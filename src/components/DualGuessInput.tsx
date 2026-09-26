import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  EyeOff, 
  Eye
} from 'lucide-react';
import type { DualGuess, PlayerProfile } from '../types/chess';

interface DualGuessInputProps {
  onSubmitPlayerGuess: (guess: DualGuess) => void;
  activePlayer?: PlayerProfile;
  totalPlayersInRound: number;
  currentTurnIndex: number;
  isRevealed: boolean;
  disabled?: boolean;
}

const PRESET_TIERS = [
  { label: '400', value: 400 },
  { label: '800', value: 800 },
  { label: '1200', value: 1200 },
  { label: '1500', value: 1500 },
  { label: '1800', value: 1800 },
  { label: '2200', value: 2200 },
  { label: '2800+', value: 2800 }
];

export const DualGuessInput: React.FC<DualGuessInputProps> = ({
  onSubmitPlayerGuess,
  activePlayer,
  totalPlayersInRound,
  currentTurnIndex,
  isRevealed,
  disabled = false
}) => {
  const [whiteGuess, setWhiteGuess] = useState<number>(1400);
  const [blackGuess, setBlackGuess] = useState<number>(1400);
  const [isPrivacyLocked, setIsPrivacyLocked] = useState<boolean>(false);

  const isMultiplayer = totalPlayersInRound > 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isRevealed || whiteGuess <= 0 || blackGuess <= 0) return;

    onSubmitPlayerGuess({
      whiteGuess,
      blackGuess
    });

    if (isMultiplayer && currentTurnIndex < totalPlayersInRound - 1) {
      setIsPrivacyLocked(true);
      setWhiteGuess(1400);
      setBlackGuess(1400);
    }
  };

  const getRatingCategory = (elo: number) => {
    if (elo < 600) return { title: 'Beginner', color: 'text-amber-400' };
    if (elo < 1000) return { title: 'Developing', color: 'text-yellow-400' };
    if (elo < 1400) return { title: 'Intermediate', color: 'text-emerald-400' };
    if (elo < 1800) return { title: 'Club Player', color: 'text-cyan-400' };
    if (elo < 2200) return { title: 'Expert/Master', color: 'text-blue-400' };
    if (elo < 2500) return { title: 'FIDE Master', color: 'text-purple-400' };
    return { title: 'Grandmaster', color: 'text-rose-400' };
  };

  if (isPrivacyLocked && activePlayer) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-chess-panel border border-chess-panelBorder rounded-2xl p-8 shadow-2xl text-center space-y-4 animate-in fade-in">
        <div className="inline-flex p-4 rounded-full bg-chess-panelLight border border-chess-panelBorder text-amber-400 mb-2">
          <EyeOff className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-black text-white">
          Guess Locked In!
        </h3>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Pass the device to <strong className="text-white" style={{ color: activePlayer.color }}>{activePlayer.name}</strong> for their turn.
        </p>
        <div>
          <button
            type="button"
            onClick={() => setIsPrivacyLocked(false)}
            className="px-8 py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover text-white font-bold text-sm shadow-lg shadow-chess-accent/25 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>I am {activePlayer.name} — Start My Turn</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-chess-panel border border-chess-panelBorder rounded-2xl p-5 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Turn Header & Score Rules */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-chess-panelBorder/70">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-chess-accent" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-100 text-base sm:text-lg">
                  {activePlayer && isMultiplayer ? (
                    <span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: activePlayer.color }} />
                      {activePlayer.name}'s Guess Turn
                    </span>
                  ) : (
                    'Guess Both Player Ratings'
                  )}
                </h3>
                {isMultiplayer && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-chess-panelLight text-neutral-300 border border-chess-panelBorder">
                    Turn {currentTurnIndex + 1} of {totalPlayersInRound}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isMultiplayer 
                  ? 'Multiplayer Tiers: \u226410 (+7 pts) • \u226425 (+5 pts) • \u2264100 (+3 pts)' 
                  : 'Predict White & Black Elo (Max 14 Pts • Exact Hit = +7 pts)'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 bg-chess-bg px-3 py-1.5 rounded-xl border border-chess-panelBorder">
            {isMultiplayer ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>&le;10 pts: <strong className="text-amber-400">+7</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>&le;25 pts: <strong className="text-cyan-400">+5</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>&le;100 pts: <strong className="text-emerald-400">+3</strong></span>
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Exact: <strong className="text-amber-400">+7 pts</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>&le;100: <strong className="text-emerald-400">+3 pts</strong></span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dual Guess Sections (White & Black) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WHITE PLAYER GUESS CARD */}
          <div className="bg-chess-panelLight p-4 rounded-xl border border-chess-panelBorder flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-neutral-300 inline-block shadow-sm" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">White Player</span>
              </div>
              <span className={`text-xs font-semibold ${getRatingCategory(whiteGuess).color}`}>
                {getRatingCategory(whiteGuess).title}
              </span>
            </div>

            {/* Value display and fine-tuning */}
            <div className="flex items-center justify-center gap-2 py-1">
              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setWhiteGuess(prev => Math.max(100, prev - 100))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                -100
              </button>
              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setWhiteGuess(prev => Math.max(100, prev - 25))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                -25
              </button>

              <div className="relative flex items-center">
                <input
                  type="number"
                  min="100"
                  max="3800"
                  value={whiteGuess || ''}
                  onChange={(e) => setWhiteGuess(Math.max(100, Math.min(3800, parseInt(e.target.value, 10) || 0)))}
                  disabled={isRevealed || disabled}
                  className="w-28 text-center text-2xl font-black font-mono bg-chess-bg text-white border border-chess-accent/60 rounded-xl py-1.5 px-2 focus:outline-none focus:border-chess-accent shadow-inner disabled:opacity-50"
                />
                <span className="absolute right-2 text-[10px] text-neutral-500 font-mono uppercase pointer-events-none">
                  Elo
                </span>
              </div>

              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setWhiteGuess(prev => Math.min(3800, prev + 25))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                +25
              </button>
              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setWhiteGuess(prev => Math.min(3800, prev + 100))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                +100
              </button>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="200"
              max="3200"
              step="10"
              value={whiteGuess}
              onChange={(e) => setWhiteGuess(Number(e.target.value))}
              disabled={isRevealed || disabled}
              className="w-full accent-chess-accent h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1 pt-1 justify-center">
              {PRESET_TIERS.map(tier => (
                <button
                  key={tier.value}
                  type="button"
                  disabled={isRevealed || disabled}
                  onClick={() => setWhiteGuess(tier.value)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-all ${
                    Math.abs(whiteGuess - tier.value) < 50
                      ? 'bg-chess-accent/20 border-chess-accent text-chess-accent font-bold'
                      : 'bg-chess-bg border-chess-panelBorder text-neutral-400 hover:text-white'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* BLACK PLAYER GUESS CARD */}
          <div className="bg-chess-panelLight p-4 rounded-xl border border-chess-panelBorder flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-600 inline-block shadow-sm" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Black Player</span>
              </div>
              <span className={`text-xs font-semibold ${getRatingCategory(blackGuess).color}`}>
                {getRatingCategory(blackGuess).title}
              </span>
            </div>

            {/* Value display and fine-tuning */}
            <div className="flex items-center justify-center gap-2 py-1">
              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setBlackGuess(prev => Math.max(100, prev - 100))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                -100
              </button>
              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setBlackGuess(prev => Math.max(100, prev - 25))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                -25
              </button>

              <div className="relative flex items-center">
                <input
                  type="number"
                  min="100"
                  max="3800"
                  value={blackGuess || ''}
                  onChange={(e) => setBlackGuess(Math.max(100, Math.min(3800, parseInt(e.target.value, 10) || 0)))}
                  disabled={isRevealed || disabled}
                  className="w-28 text-center text-2xl font-black font-mono bg-chess-bg text-white border border-chess-accent/60 rounded-xl py-1.5 px-2 focus:outline-none focus:border-chess-accent shadow-inner disabled:opacity-50"
                />
                <span className="absolute right-2 text-[10px] text-neutral-500 font-mono uppercase pointer-events-none">
                  Elo
                </span>
              </div>

              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setBlackGuess(prev => Math.min(3800, prev + 25))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                +25
              </button>
              <button
                type="button"
                disabled={isRevealed || disabled}
                onClick={() => setBlackGuess(prev => Math.min(3800, prev + 100))}
                className="px-2 py-1 bg-chess-bg hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-lg border border-chess-panelBorder transition-colors disabled:opacity-40"
              >
                +100
              </button>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="200"
              max="3200"
              step="10"
              value={blackGuess}
              onChange={(e) => setBlackGuess(Number(e.target.value))}
              disabled={isRevealed || disabled}
              className="w-full accent-chess-accent h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1 pt-1 justify-center">
              {PRESET_TIERS.map(tier => (
                <button
                  key={tier.value}
                  type="button"
                  disabled={isRevealed || disabled}
                  onClick={() => setBlackGuess(tier.value)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-all ${
                    Math.abs(blackGuess - tier.value) < 50
                      ? 'bg-chess-accent/20 border-chess-accent text-chess-accent font-bold'
                      : 'bg-chess-bg border-chess-panelBorder text-neutral-400 hover:text-white'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit & Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-chess-accent" />
            <span>Max Round Score: <strong>14 points</strong></span>
          </div>

          <button
            type="submit"
            disabled={isRevealed || disabled || whiteGuess <= 0 || blackGuess <= 0}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-chess-accent/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          >
            {isMultiplayer && currentTurnIndex < totalPlayersInRound - 1 ? (
              <>
                <UserCheck className="w-5 h-5" />
                <span>Lock In & Pass to Next Player</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-current" />
                <span>Submit & Reveal Ratings</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
