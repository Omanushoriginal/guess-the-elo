import React from 'react';
import { ArrowLeft, Copy, Crown, Users } from 'lucide-react';
import type { RoomPlayer } from '../services/onlineRooms';

interface RoomLobbyProps {
  code: string;
  players: RoomPlayer[];
  capacity: number;
  isHost: boolean;
  isStarting: boolean;
  roomError?: string | null;
  onStart: () => void;
  onLeave: () => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({ code, players, capacity, isHost, isStarting, onStart, onLeave, roomError }) => {
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); } catch { /* Clipboard may be unavailable; the code stays selectable. */ }
  };

  return (
    <div className="min-h-screen bg-chess-bg text-neutral-200 flex items-center justify-center p-5">
      <section className="w-full max-w-xl bg-chess-panel border border-chess-panelBorder rounded-3xl p-6 sm:p-9 shadow-2xl">
        <button onClick={onLeave} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6"><ArrowLeft className="w-4 h-4" />Leave room</button>
        <div className="flex items-center gap-3 mb-2"><Crown className="w-7 h-7 text-amber-400" /><h1 className="text-2xl font-black text-white">{isHost ? 'Your room is ready' : 'You joined the room'}</h1></div>
        <p className="text-sm text-neutral-400">Share this code with your friends so they can join from their own devices.</p>
        <button onClick={copyCode} className="mt-5 w-full flex items-center justify-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 py-4 text-3xl font-black font-mono tracking-[0.3em] text-amber-300">{code}<Copy className="w-5 h-5" /></button>
        <div className="flex items-center justify-between mt-8 mb-3"><h2 className="font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-chess-accent" />Players</h2><span className="text-xs text-neutral-400">{players.length}/{capacity}</span></div>
        <div className="space-y-2">
          {players.map((player, index) => <div key={player.id} className="flex items-center gap-3 rounded-xl bg-chess-bg border border-chess-panelBorder px-4 py-3"><span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ background: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][index % 5] }}>{player.name.slice(0, 1).toUpperCase()}</span><span className="text-sm font-semibold text-white">{player.name}</span>{index === 0 && <span className="ml-auto text-[10px] uppercase tracking-wider text-amber-300">Host</span>}</div>)}
        </div>
        {roomError && <p role="alert" className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">{roomError}</p>}
        {isHost ? <button onClick={onStart} disabled={players.length < 2 || isStarting} className="mt-6 w-full rounded-xl bg-chess-accent hover:bg-chess-accentHover px-4 py-3.5 text-white font-black disabled:opacity-40">{isStarting ? 'Starting match…' : players.length < 2 ? 'Waiting for at least one friend…' : 'Start match'}</button> : <p className="mt-6 rounded-xl bg-chess-bg border border-chess-panelBorder p-4 text-center text-sm text-neutral-300">Waiting for the host to start the match…</p>}
        <p className="text-[11px] leading-relaxed text-neutral-500 mt-4">Room connections use peer-to-peer networking. Some restricted networks may prevent players from connecting.</p>
      </section>
    </div>
  );
};
