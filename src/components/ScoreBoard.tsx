import React from 'react';
import { Trophy, Flame, Target, Award, RotateCcw, BarChart2 } from 'lucide-react';
import type { GameStats } from '../types/chess';

interface ScoreBoardProps {
  stats: GameStats;
  currentRound: number;
  totalRounds: number;
  gameMode: 'rounds' | 'endless';
  onResetStats: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  stats,
  currentRound,
  totalRounds,
  gameMode,
  onResetStats
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto bg-chess-panel border border-chess-panelBorder rounded-2xl p-4 shadow-xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Score */}
        <div className="bg-chess-panelLight p-3 rounded-xl border border-chess-panelBorder flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Points</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
            {stats.totalScore}
          </span>
        </div>

        {/* Current Round / Mode */}
        <div className="bg-chess-panelLight p-3 rounded-xl border border-chess-panelBorder flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <Target className="w-3.5 h-3.5 text-chess-accent" />
            <span>{gameMode === 'rounds' ? 'Challenge Round' : 'Rounds Played'}</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white">
            {gameMode === 'rounds' ? `${currentRound} / ${totalRounds}` : stats.roundsPlayed}
          </span>
        </div>

        {/* Streak */}
        <div className="bg-chess-panelLight p-3 rounded-xl border border-chess-panelBorder flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Hit Streak</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-orange-400">
              {stats.currentStreak}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono">
              (Best: {stats.bestStreak})
            </span>
          </div>
        </div>

        {/* Exact Guesses (+7) */}
        <div className="bg-chess-panelLight p-3 rounded-xl border border-chess-panelBorder flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Exact (+7)</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
            {stats.exactGuesses}
          </span>
        </div>

        {/* Within 100 (+3) */}
        <div className="bg-chess-panelLight p-3 rounded-xl border border-chess-panelBorder flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Within 100 (+3)</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            {stats.within100Guesses}
          </span>
        </div>

        {/* Accuracy & Reset */}
        <div className="bg-chess-panelLight p-3 rounded-xl border border-chess-panelBorder flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Accuracy</span>
            </span>
            <button
              onClick={onResetStats}
              className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
              title="Reset session statistics"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
            {stats.roundsPlayed > 0 
              ? `${Math.round(((stats.exactGuesses + stats.within100Guesses) / stats.roundsPlayed) * 100)}%` 
              : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
