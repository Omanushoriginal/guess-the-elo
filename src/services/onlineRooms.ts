import Peer, { type DataConnection } from 'peerjs';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Unsubscribe } from 'firebase/database';

export type RoomMessage =
  | { type: 'join'; name: string }
  | { type: 'lobby'; players: Array<{ id: string; name: string }>; capacity: number }
  | { type: 'start'; snapshot: unknown }
  | { type: 'sync'; snapshot: unknown }
  | { type: 'guess'; playerId: string; guess: { whiteGuess: number; blackGuess: number } }
  | { type: 'error'; message: string };

export type OnlineRoom = {
  role: 'host' | 'guest';
  code: string;
  playerId: string;
  status: 'lobby' | 'playing';
  visibility?: 'public' | 'private';
};

export type RoomPlayer = { id: string; name: string };
export type PublicRoom = {
  code: string;
  hostName: string;
  playerCount: number;
  capacity: number;
  createdAt: number;
  status: 'lobby' | 'playing';
};

type DirectoryRoom = PublicRoom & { ownerUid: string; updatedAt: number };

let firebaseAppPromise: Promise<FirebaseApp | null> | undefined;
let anonymousUserPromise: Promise<User> | null = null;

function readFirebaseConfig(): Record<string, unknown> | null {
  const rawConfig = import.meta.env.VITE_FIREBASE_CONFIG as string | undefined;
  if (!rawConfig) return null;
  try {
    const config = JSON.parse(rawConfig) as Record<string, unknown>;
    if (!config.apiKey || !config.databaseURL || !config.projectId || !config.appId) {
      return null;
    }
    return config;
  } catch {
    return null;
  }
}

export function isRoomDirectoryConfigured(): boolean {
  return readFirebaseConfig() !== null;
}

async function getFirebaseApp(): Promise<FirebaseApp | null> {
  const config = readFirebaseConfig();
  if (!config) return null;
  firebaseAppPromise ??= import('firebase/app').then(({ getApp, getApps, initializeApp }) =>
    getApps().length ? getApp() : initializeApp(config)
  );
  return firebaseAppPromise;
}

async function getRoomDirectory() {
  const app = await getFirebaseApp();
  if (!app) throw new Error('Public room listings are not configured yet. The site owner must connect Firebase.');
  const [{ getAuth }, { getDatabase }] = await Promise.all([import('firebase/auth'), import('firebase/database')]);
  const auth = getAuth(app);
  const user = auth.currentUser ?? await getAnonymousUser(auth);
  return { database: getDatabase(app), ownerUid: user.uid };
}

function getAnonymousUser(auth: Auth): Promise<User> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  if (!anonymousUserPromise) {
    anonymousUserPromise = import('firebase/auth').then(({ signInAnonymously }) => signInAnonymously(auth))
      .then(credential => credential.user)
      .catch(error => {
        anonymousUserPromise = null;
        throw error;
      });
  }
  return anonymousUserPromise;
}

export async function publishPublicRoom(room: Omit<PublicRoom, 'createdAt'> & { createdAt?: number }): Promise<string> {
  const { database, ownerUid } = await getRoomDirectory();
  const listing: DirectoryRoom = {
    ...room,
    createdAt: room.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    ownerUid
  };
  const { ref, set } = await import('firebase/database');
  await set(ref(database, `publicRooms/${room.code}`), listing);
  return ownerUid;
}

export async function updatePublicRoom(code: string, ownerUid: string, values: Partial<Pick<PublicRoom, 'playerCount' | 'status'>>): Promise<void> {
  const app = await getFirebaseApp();
  if (!app) return;
  const [{ getDatabase, ref, update }] = await Promise.all([import('firebase/database')]);
  await update(ref(getDatabase(app), `publicRooms/${code}`), { ...values, updatedAt: Date.now(), ownerUid });
}

export async function unpublishPublicRoom(code: string): Promise<void> {
  const app = await getFirebaseApp();
  if (!app) return;
  const [{ getAuth }, { getDatabase, ref, remove }] = await Promise.all([import('firebase/auth'), import('firebase/database')]);
  const auth = getAuth(app);
  if (!auth.currentUser) return;
  await remove(ref(getDatabase(app), `publicRooms/${code}`));
}

export function subscribePublicRooms(onRooms: (rooms: PublicRoom[]) => void, onError: (error: Error) => void): Unsubscribe | undefined {
  if (!isRoomDirectoryConfigured()) return undefined;
  let unsubscribe: Unsubscribe | undefined;
  let disposed = false;
  const start = async () => {
    try {
      const app = await getFirebaseApp();
      if (!app) return;
      const [{ getAuth }, { getDatabase, onValue, ref }] = await Promise.all([import('firebase/auth'), import('firebase/database')]);
      const auth = getAuth(app);
      await getAnonymousUser(auth);
      if (disposed) return;
      unsubscribe = onValue(ref(getDatabase(app), 'publicRooms'), snapshot => {
        const now = Date.now();
        const rooms = Object.values((snapshot.val() ?? {}) as Record<string, DirectoryRoom>)
          .filter(room => room.status === 'lobby' && room.playerCount < room.capacity && now - room.updatedAt < 90_000)
          .map(({ code, hostName, playerCount, capacity, createdAt, status }) => ({ code, hostName, playerCount, capacity, createdAt, status }))
          .sort((a, b) => b.createdAt - a.createdAt);
        onRooms(rooms);
      }, error => onError(error));
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Could not load public rooms.'));
    }
  };
  void start();
  return () => {
    disposed = true;
    unsubscribe?.();
  };
}

export function createRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomValues = new Uint8Array(6);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, value => alphabet[value % alphabet.length]).join('');
}

export function createRoomPeer(roomCode?: string): Peer {
  return roomCode ? new Peer(`gte-${roomCode.toUpperCase()}`, { debug: 1 }) : new Peer();
}

export function sendRoomMessage(connection: DataConnection, message: RoomMessage): void {
  if (connection.open) connection.send(message);
}
