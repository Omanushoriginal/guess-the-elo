import React from 'react';
import { 
  Crown, 
  HelpCircle, 
  User, 
  RefreshCw, 
  Filter
} from 'lucide-react';
import type { RatingFilter } from '../types/chess';

interface GameHeaderProps {
  ratingFilter: RatingFilter;
  onFilterChange: (filter: RatingFilter) => void;
  gameMode: 'rounds' | 'endless';
  onModeChange: (mode: 'rounds' | 'endless') => void;
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
  gameMode,
  onModeChange,
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
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-chess-accent/20 text-chess-accent border border-chess-accent/30 font-mono">
                  Chess.com Edition
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">
                Analyze games & guess hidden player ratings
              </p>
            </div>
          </div>

          {/* Mobile Right Buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onOpenRules}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-chess-panelLight transition-colors"
              title="How to Play"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onNewGame}
              disabled={isLoading}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-chess-panelLight transition-colors disabled:opacity-40"
              title="New Random Game"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
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

          {/* Mode Selector */}
          <div className="flex items-center bg-chess-bg rounded-xl p-1 border border-chess-panelBorder text-xs">
            <button
              onClick={() => onModeChange('rounds')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                gameMode === 'rounds'
                  ? 'bg-chess-panelLight text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              5-Round Challenge
            </button>
            <button
              onClick={() => onModeChange('endless')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                gameMode === 'endless'
                  ? 'bg-chess-panelLight text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Endless Mode
            </button>
          </div>

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

          {/* Rules Button (Desktop) */}
          <button
            onClick={onOpenRules}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-chess-panelLight hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-chess-panelBorder transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules</span>
          </button>

          {/* New Game Button (Desktop) */}
          <button
            onClick={onNewGame}
            disabled={isLoading}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-chess-accent hover:bg-chess-accentHover text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>New Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};
