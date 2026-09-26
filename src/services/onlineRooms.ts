import Peer, { type DataConnection } from 'peerjs';

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
};

export type RoomPlayer = { id: string; name: string };

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
