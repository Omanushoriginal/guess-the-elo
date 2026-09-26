import React from 'react';
import { 
  Crown, 
  HelpCircle, 
  User, 
  RefreshCw, 
  Filter,
  Settings,
  Trophy
} from 'lucide-react';
import type { RatingFilter, MatchConfig } from '../types/chess';
import { RoundTimer } from './RoundTimer';

interface GameHeaderProps {
  ratingFilter: RatingFilter;
  onFilterChange: (filter: RatingFilter) => void;
  matchConfig: MatchConfig;
  currentRound: number;
  timeRemainingSeconds: number;
  isTimerPaused: boolean;
  onTogglePauseTimer: () => void;
  isRevealed: boolean;
  onOpenMatchSetup: () => void;
  onOpenRules: () => void;
  onOpenCustomUser: () => void;
  onNewGame: () => void;
  isLoading: boolean;
  activeUsername?: string;
  onClearCustomUser?: () => void;
}

const FILTER_OPTIONS: { id: RatingFilter; label: string }[] = [
  { id: 'all', label: 'All Ratings' },
  { id: 'beginner', label: 'Beginner (<1000)' },
  { id: 'intermediate', label: 'Intermediate (1000-1600)' },
  { id: 'advanced', label: 'Advanced (1600-2100)' },
  { id: 'master', label: 'Master (2100-2600)' },
  { id: 'gm', label: 'Grandmaster (2600+)' },
];

export const GameHeader: React.FC<GameHeaderProps> = ({
  ratingFilter,
  onFilterChange,
  matchConfig,
  currentRound,
  timeRemainingSeconds,
  isTimerPaused,
  onTogglePauseTimer,
  isRevealed,
  onOpenMatchSetup,
  onOpenRules,
  onOpenCustomUser,
  onNewGame,
  isLoading,
  activeUsername,
  onClearCustomUser
}) => {
  return (
    <header className="w-full bg-chess-panel border-b border-chess-panelBorder sticky top-0 z-40 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-chess-accent to-emerald-400 flex items-center justify-center shadow-lg shadow-chess-accent/20">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight leading-none m-0">
                  Guess The Elo
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {matchConfig.mode === 'multiplayer' ? `${matchConfig.playerCount}P Multiplayer` : 'Solo Mode'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">
                Predict White & Black Elo • Instant Win on Exact Hit
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <RoundTimer
              timeRemainingSeconds={timeRemainingSeconds}
              totalDurationSeconds={matchConfig.roundDurationMinutes * 60}
              isPaused={isTimerPaused}
              onTogglePause={onTogglePauseTimer}
              isRevealed={isRevealed}
            />
            <button
              onClick={onOpenMatchSetup}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-chess-panelLight transition-colors"
              title="Match Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Live Round and Countdown Timer */}
        <div className="flex items-center gap-2.5">
          {/* Round Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chess-bg border border-chess-panelBorder text-xs font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Round <strong className="text-white text-sm">{currentRound}</strong>/{matchConfig.totalRounds}</span>
          </div>

          {/* Timer */}
          <div className="hidden md:block">
            <RoundTimer
              timeRemainingSeconds={timeRemainingSeconds}
              totalDurationSeconds={matchConfig.roundDurationMinutes * 60}
              isPaused={isTimerPaused}
              onTogglePause={onTogglePauseTimer}
              isRevealed={isRevealed}
            />
          </div>
        </div>

        {/* Right: Filters & Match Configuration Controls */}
        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end w-full md:w-auto">
          {/* Active Custom User Badge */}
          {activeUsername && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium">
              <span>Player: <strong>{activeUsername}</strong></span>
              {onClearCustomUser && (
                <button
                  onClick={onClearCustomUser}
                  className="hover:text-white ml-1 font-bold"
                  title="Clear custom player"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Match Setup Button */}
          <button
            onClick={onOpenMatchSetup}
            className="px-3 py-2 bg-chess-panelLight hover:bg-neutral-700 text-white text-xs font-bold rounded-xl border border-chess-panelBorder flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Match Setup ({matchConfig.totalRounds}R • {matchConfig.roundDurationMinutes}m)</span>
          </button>

          {/* Rating Tier Filter */}
          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => onFilterChange(e.target.value as RatingFilter)}
              className="bg-chess-bg text-neutral-200 text-xs px-3 py-2 rounded-xl border border-chess-panelBorder focus:outline-none focus:border-chess-accent cursor-pointer pr-7 appearance-none"
              disabled={isLoading}
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Custom Player Button */}
          <button
            onClick={onOpenCustomUser}
            className="px-3 py-2 bg-chess-panelLight hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-chess-panelBorder flex items-center gap-1.5 transition-colors"
            title="Load games from specific Chess.com player"
          >
            <User className="w-3.5 h-3.5 text-chess-accent" />
            <span className="hidden sm:inline">Custom Player</span>
          </button>

          {/* Rules Button */}
          <button
            onClick={onOpenRules}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-chess-panelLight hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-chess-panelBorder transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules</span>
          </button>

          {/* Skip / New Game Button */}
          <button
            onClick={onNewGame}
            disabled={isLoading}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-chess-bg hover:bg-chess-panelLight text-neutral-300 hover:text-white text-xs font-semibold rounded-xl border border-chess-panelBorder transition-colors disabled:opacity-40"
            title="Skip to another random game"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Skip Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};
