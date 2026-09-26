import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Crown, DoorOpen, Plus, Users, UserRound } from 'lucide-react';
import type { InstantWinCondition } from '../types/chess';
import type { PublicRoom } from '../services/onlineRooms';

export type RoomSettings = {
  playerName: string;
  playerCount: number;
  totalRounds: number;
  roundDurationMinutes: number;
  instantWinCondition: InstantWinCondition;
  visibility: 'public' | 'private';
};

interface StartScreenProps {
  onSolo: () => void;
  onLocalMultiplayer: () => void;
  onCreateRoom: (settings: RoomSettings) => void;
  onJoinRoom: (code: string, playerName: string) => void;
  onBrowseRooms: () => void;
  publicRooms: PublicRoom[];
  publicRoomsError?: string | null;
  publicRoomsLoading?: boolean;
  onOpenRules: () => void;
  roomError?: string | null;
  isConnecting?: boolean;
}

type Screen = 'home' | 'multiplayer' | 'create' | 'join' | 'browse';

export const StartScreen: React.FC<StartScreenProps> = ({
  onSolo, onLocalMultiplayer, onCreateRoom, onJoinRoom, onBrowseRooms, publicRooms, publicRoomsError, publicRoomsLoading = false, onOpenRules, roomError, isConnecting = false
}) => {
  const [screen, setScreen] = useState<Screen>('home');
  const [playerName, setPlayerName] = useState('');
  const [playerCount, setPlayerCount] = useState(2);
  const [totalRounds, setTotalRounds] = useState(5);
  const [roundDurationMinutes, setRoundDurationMinutes] = useState(3);
  const [instantWinCondition, setInstantWinCondition] = useState<InstantWinCondition>('either');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [roomCode, setRoomCode] = useState('');

  const goBack = () => {
    setScreen(screen === 'create' || screen === 'join' ? 'multiplayer' : 'home');
  };

  return (
    <div className="min-h-screen bg-chess-bg text-neutral-200 font-sans flex flex-col">
      <header className="border-b border-chess-panelBorder bg-chess-panel/80">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-chess-accent to-emerald-400 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div><h1 className="text-xl font-black text-white">Guess The Elo</h1><p className="text-xs text-neutral-400">Chess rating guessing game</p></div>
          </div>
          <button onClick={onOpenRules} className="text-sm text-neutral-300 hover:text-white">How to play</button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <section className="w-full max-w-2xl bg-chess-panel border border-chess-panelBorder rounded-3xl p-6 sm:p-10 shadow-2xl">
          {screen !== 'home' && <button onClick={goBack} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-5"><ArrowLeft className="w-4 h-4" />Back</button>}
          {screen === 'home' && <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-chess-accent mb-2">Choose your game mode</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">How do you want to play?</h2>
            <p className="text-sm text-neutral-400 mb-8">Practice alone or challenge friends with separate rules and scoring.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={onSolo} className="text-left p-6 rounded-2xl border border-chess-panelBorder bg-chess-bg hover:border-chess-accent transition-colors group">
                <UserRound className="w-8 h-8 text-chess-accent mb-4" />
                <h3 className="text-xl font-extrabold text-white mb-2">Singleplayer</h3>
                <p className="text-sm text-neutral-400">Guess the game’s average rating. Earn +7 for an exact guess or +3 within 100 Elo.</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-chess-accent">Play solo <ArrowRight className="w-4 h-4" /></span>
              </button>
              <button onClick={() => setScreen('multiplayer')} className="text-left p-6 rounded-2xl border border-chess-panelBorder bg-chess-bg hover:border-amber-400 transition-colors group">
                <Users className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-xl font-extrabold text-white mb-2">Multiplayer</h3>
                <p className="text-sm text-neutral-400">Challenge friends online or play together on one device.</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-300">Choose multiplayer <ArrowRight className="w-4 h-4" /></span>
              </button>
            </div>
          </>}

          {screen === 'multiplayer' && <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 mb-2">Multiplayer</p>
            <h2 className="text-3xl font-black text-white mb-3">Play with friends</h2>
            <p className="text-sm text-neutral-400 mb-8">Online rooms let each player join from their own device.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={() => setScreen('create')} className="text-left p-5 rounded-2xl border border-chess-panelBorder bg-chess-bg hover:border-amber-400 transition-colors">
                <Plus className="w-7 h-7 text-amber-400 mb-3" /><h3 className="font-extrabold text-white">Create online room</h3><p className="text-xs text-neutral-400 mt-1">Host a match and share the room code.</p>
              </button>
              <button onClick={() => setScreen('join')} className="text-left p-5 rounded-2xl border border-chess-panelBorder bg-chess-bg hover:border-chess-accent transition-colors">
                <DoorOpen className="w-7 h-7 text-chess-accent mb-3" /><h3 className="font-extrabold text-white">Join a room</h3><p className="text-xs text-neutral-400 mt-1">Enter a friend's code to join their match.</p>
              </button>
            </div>
            <button onClick={() => { setScreen('browse'); onBrowseRooms(); }} className="mt-4 w-full rounded-xl px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-sm font-bold text-amber-200">Browse public rooms</button>
            <button onClick={onLocalMultiplayer} className="mt-4 w-full rounded-xl px-4 py-3 bg-chess-panelLight hover:bg-neutral-700 border border-chess-panelBorder text-sm font-bold text-neutral-200">Pass & Play on this device</button>
          </>}

          {screen === 'browse' && <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 mb-2">Public rooms</p>
            <h2 className="text-3xl font-black text-white mb-3">Find a match</h2>
            <p className="text-sm text-neutral-400 mb-5">Choose an open room to join. Private rooms only appear when you enter their code.</p>
            {publicRoomsLoading && <p className="text-sm text-neutral-400">Loading rooms…</p>}
            {publicRoomsError && <p role="alert" className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-3">{publicRoomsError}</p>}
            {!publicRoomsLoading && !publicRoomsError && publicRooms.length === 0 && <p className="text-sm text-neutral-400 rounded-xl bg-chess-bg p-4">No public rooms are available right now.</p>}
            <div className="space-y-2 max-h-72 overflow-auto">
              {publicRooms.map(room => <button key={room.code} disabled={!playerName.trim() || isConnecting} onClick={() => onJoinRoom(room.code, playerName.trim())} className="w-full rounded-xl border border-chess-panelBorder bg-chess-bg hover:border-amber-400 p-4 text-left disabled:opacity-50">
                <div className="flex items-center justify-between"><span className="font-bold text-white">{room.hostName}’s room</span><span className="font-mono text-amber-300">{room.playerCount}/{room.capacity}</span></div>
                <div className="text-xs text-neutral-400 mt-1">Code {room.code} · {room.capacity - room.playerCount} {room.capacity - room.playerCount === 1 ? 'seat' : 'seats'} open</div>
              </button>)}
            </div>
            <label className="block text-xs font-bold text-neutral-300 mt-5">Your name<input value={playerName} onChange={e => setPlayerName(e.target.value)} maxLength={20} placeholder="Enter your name to join" className="mt-2 w-full rounded-xl bg-chess-bg border border-chess-panelBorder px-4 py-3 text-sm text-white outline-none focus:border-chess-accent" /></label>
          </>}

          {screen === 'create' && <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300 mb-2">Create room</p>
            <h2 className="text-3xl font-black text-white mb-6">Set up your match</h2>
            <div className="space-y-5">
              <label className="block text-xs font-bold text-neutral-300">Your name<input value={playerName} onChange={e => setPlayerName(e.target.value)} maxLength={20} placeholder="Enter your name" className="mt-2 w-full rounded-xl bg-chess-bg border border-chess-panelBorder px-4 py-3 text-sm text-white outline-none focus:border-chess-accent" /></label>
              <div>
                <p className="text-xs font-bold text-neutral-300 mb-2">Players including you</p>
                <div className="grid grid-cols-4 gap-2">{[2, 3, 4, 5].map(count => <button key={count} onClick={() => setPlayerCount(count)} className={`rounded-xl py-2.5 border font-bold ${playerCount === count ? 'bg-chess-accent border-chess-accent text-white' : 'bg-chess-bg border-chess-panelBorder text-neutral-400'}`}>{count}</button>)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-xs font-bold text-neutral-300">Rounds<select value={totalRounds} onChange={e => setTotalRounds(Number(e.target.value))} className="mt-2 w-full rounded-xl bg-chess-bg border border-chess-panelBorder px-3 py-3 text-white">{[5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
                <label className="text-xs font-bold text-neutral-300">Minutes per round<select value={roundDurationMinutes} onChange={e => setRoundDurationMinutes(Number(e.target.value))} className="mt-2 w-full rounded-xl bg-chess-bg border border-chess-panelBorder px-3 py-3 text-white">{[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
              </div>
              <fieldset>
                <legend className="text-xs font-bold text-neutral-300 mb-2">Room visibility</legend>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setVisibility('private')} className={`rounded-xl border py-3 text-sm font-bold ${visibility === 'private' ? 'bg-chess-accent border-chess-accent text-white' : 'bg-chess-bg border-chess-panelBorder text-neutral-400'}`}>Private · code only</button>
                  <button type="button" onClick={() => setVisibility('public')} className={`rounded-xl border py-3 text-sm font-bold ${visibility === 'public' ? 'bg-amber-500 border-amber-500 text-black' : 'bg-chess-bg border-chess-panelBorder text-neutral-400'}`}>Public · listed</button>
                </div>
              </fieldset>
              <label className="block text-xs font-bold text-neutral-300">Instant victory rule<select value={instantWinCondition} onChange={e => setInstantWinCondition(e.target.value as InstantWinCondition)} className="mt-2 w-full rounded-xl bg-chess-bg border border-chess-panelBorder px-3 py-3 text-white"><option value="either">Exact guess on either player</option><option value="both">Exact guesses on both players</option><option value="white_only">Exact guess on White only</option><option value="black_only">Exact guess on Black only</option><option value="disabled">Disabled</option></select></label>
              {roomError && <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{roomError}</p>}
              <button disabled={!playerName.trim() || isConnecting} onClick={() => onCreateRoom({ playerName: playerName.trim(), playerCount, totalRounds, roundDurationMinutes, instantWinCondition, visibility })} className="w-full rounded-xl px-4 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black disabled:opacity-50">{isConnecting ? 'Creating room…' : 'Create room'}</button>
            </div>
          </>}

          {screen === 'join' && <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-chess-accent mb-2">Join room</p>
            <h2 className="text-3xl font-black text-white mb-6">Enter your friend's code</h2>
            <div className="space-y-5">
              <label className="block text-xs font-bold text-neutral-300">Your name<input value={playerName} onChange={e => setPlayerName(e.target.value)} maxLength={20} placeholder="Enter your name" className="mt-2 w-full rounded-xl bg-chess-bg border border-chess-panelBorder px-4 py-3 text-sm text-white outline-none focus:border-chess-accent" /></label>
              <label className="block text-xs font-bold text-neutral-300">Room code<input value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} maxLength={6} placeholder="ABC123" className="mt-2 w-full rounded-xl bg-chess-bg border border-chess-panelBorder px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-white outline-none focus:border-chess-accent" /></label>
              {roomError && <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{roomError}</p>}
              <button disabled={!playerName.trim() || roomCode.length !== 6 || isConnecting} onClick={() => onJoinRoom(roomCode, playerName.trim())} className="w-full rounded-xl px-4 py-3.5 bg-chess-accent hover:bg-chess-accentHover text-white font-black disabled:opacity-50">{isConnecting ? 'Joining room…' : 'Join room'}</button>
            </div>
          </>}
        </section>
      </main>
      <footer className="text-center text-xs text-neutral-500 py-4">Multiplayer: +7 within 10 • +5 within 25 • +3 within 100</footer>
    </div>
  );
};
