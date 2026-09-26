import React, { useState } from 'react';
import { 
  X, 
  Users, 
  User, 
  Clock, 
  Trophy, 
  Play, 
  Flame,
} from 'lucide-react';
import type { MatchConfig, PlayerProfile, InstantWinCondition } from '../types/chess';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (config: MatchConfig) => void;
  currentConfig: MatchConfig;
}

const PLAYER_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
];

const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];

const INSTANT_WIN_OPTIONS: { id: InstantWinCondition; label: string; desc: string }[] = [
  { 
    id: 'either', 
    label: 'Either White OR Black (1 Guess)', 
    desc: 'Exact rating on either player triggers instant match victory.' 
  },
  { 
    id: 'both', 
    label: 'Both White AND Black (Dual Bullseye)', 
    desc: 'Requires guessing BOTH player ratings exact to trigger instant victory.' 
  },
  { 
    id: 'white_only', 
    label: 'White Player Only', 
    desc: 'Only an exact guess on White triggers instant victory.' 
  },
  { 
    id: 'black_only', 
    label: 'Black Player Only', 
    desc: 'Only an exact guess on Black triggers instant victory.' 
  },
  { 
    id: 'disabled', 
    label: 'Disabled (Points Only)', 
    desc: 'No instant victory. Match is decided purely by total points.' 
  }
];

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
  currentConfig
}) => {
  const [mode, setMode] = useState<'solo' | 'multiplayer'>(currentConfig.mode);
  const [playerCount, setPlayerCount] = useState<number>(currentConfig.playerCount || 2);
  const [playerNames, setPlayerNames] = useState<string[]>(
    currentConfig.players.map(p => p.name).length > 0 
      ? currentConfig.players.map(p => p.name) 
      : DEFAULT_NAMES
  );
  const [totalRounds, setTotalRounds] = useState<number>(currentConfig.totalRounds || 5);
  const [roundDurationMinutes, setRoundDurationMinutes] = useState<number>(
    currentConfig.roundDurationMinutes || 3
  );
  const [instantWinCondition, setInstantWinCondition] = useState<InstantWinCondition>(
    currentConfig.instantWinCondition || 'either'
  );

  if (!isOpen) return null;

  const handleNameChange = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const count = mode === 'solo' ? 1 : playerCount;
    const players: PlayerProfile[] = Array.from({ length: count }).map((_, i) => ({
      id: `player-${i + 1}`,
      name: playerNames[i]?.trim() || `Player ${i + 1}`,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      score: 0,
      exactHits: 0,
      within100Hits: 0
    }));

    onStartMatch({
      mode,
      playerCount: count,
      players,
      totalRounds,
      roundDurationMinutes,
      instantWinCondition
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-chess-panel border border-chess-panelBorder rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-chess-panelLight transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white">Custom Match Setup</h2>
        </div>
        <p className="text-xs text-neutral-400 mb-5">
          Configure game mode, player count, rounds (5–10), timers (2–10 mins), and Instant Victory conditions.
        </p>

        <form onSubmit={handleStart} className="space-y-5">
          {/* Mode Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('solo')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  mode === 'solo'
                    ? 'bg-chess-accent/20 border-chess-accent text-white shadow-md'
                    : 'bg-chess-panelLight border-chess-panelBorder text-neutral-400 hover:text-white'
                }`}
              >
                <User className="w-5 h-5 text-chess-accent" />
                <div className="text-left">
                  <div className="font-bold text-sm">Solo Practice</div>
                  <div className="text-[11px] text-neutral-400">Classic Rules (+7 exact, +3 &le;100)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('multiplayer')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  mode === 'multiplayer'
                    ? 'bg-chess-accent/20 border-chess-accent text-white shadow-md'
                    : 'bg-chess-panelLight border-chess-panelBorder text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <div className="font-bold text-sm">Pass & Play Multiplayer</div>
                  <div className="text-[11px] text-neutral-400">Tiered Scoring (+7, +5, +3)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Multiplayer Player Count (if Multiplayer) */}
          {mode === 'multiplayer' && (
            <div className="p-4 rounded-xl bg-chess-bg border border-chess-panelBorder space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Number of Players (2 to 5)
                </label>
                <div className="flex gap-1.5">
                  {[2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPlayerCount(num)}
                      className={`w-9 h-9 rounded-lg font-mono font-bold text-sm border transition-all ${
                        playerCount === num
                          ? 'bg-chess-accent text-white border-chess-accent shadow-sm'
                          : 'bg-chess-panelLight text-neutral-400 border-chess-panelBorder hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Names Inputs */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Player Names:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from({ length: playerCount }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div 
                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                        style={{ backgroundColor: PLAYER_COLORS[idx % PLAYER_COLORS.length] }} 
                      />
                      <input
                        type="text"
                        placeholder={`Player ${idx + 1}`}
                        value={playerNames[idx] || ''}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className="flex-1 bg-chess-panelLight border border-chess-panelBorder text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-chess-accent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rounds Configuration (5 to 10 rounds) */}
          <div className="p-4 rounded-xl bg-chess-bg border border-chess-panelBorder space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-chess-accent" />
                <span>Total Rounds (5 to 10)</span>
              </label>
              <span className="font-mono text-base font-black text-chess-accent">
                {totalRounds} Rounds
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[5, 6, 7, 8, 9, 10].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTotalRounds(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    totalRounds === r
                      ? 'bg-chess-accent text-white border-chess-accent shadow-sm'
                      : 'bg-chess-panelLight text-neutral-400 border-chess-panelBorder hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Round Duration Configuration (2 to 10 minutes) */}
          <div className="p-4 rounded-xl bg-chess-bg border border-chess-panelBorder space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Timer Per Round (2 to 10 mins)</span>
              </label>
              <span className="font-mono text-base font-black text-amber-400">
                {roundDurationMinutes} Minutes
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRoundDurationMinutes(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    roundDurationMinutes === m
                      ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                      : 'bg-chess-panelLight text-neutral-400 border-chess-panelBorder hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Multiplayer Instant Victory Condition Selector */}
          {mode === 'multiplayer' && <div className="p-4 rounded-xl bg-chess-bg border border-chess-panelBorder space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Instant Victory Trigger (Exact Guess)</span>
            </div>

            <div className="space-y-1.5">
              {INSTANT_WIN_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInstantWinCondition(opt.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                    instantWinCondition === opt.id
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                      : 'bg-chess-panelLight border-chess-panelBorder text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    instantWinCondition === opt.id ? 'border-amber-400 bg-amber-400' : 'border-neutral-500'
                  }`}>
                    {instantWinCondition === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-neutral-200">{opt.label}</div>
                    <div className="text-[11px] text-neutral-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>}

          {/* Start Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-chess-accent hover:bg-chess-accentHover active:scale-[0.99] text-white font-black text-base shadow-lg shadow-chess-accent/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Match ({totalRounds} Rounds • {roundDurationMinutes}m Each)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
