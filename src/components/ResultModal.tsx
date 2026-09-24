import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Target, 
  ExternalLink, 
  ArrowRight, 
  Award,
  Zap,
  Sparkles
} from 'lucide-react';
import type { ChessGame, GuessEvaluation } from '../types/chess';

interface ResultModalProps {
  game: ChessGame;
  evaluation: GuessEvaluation;
  onNextGame: () => void;
  isGameOver?: boolean;
  onRestart?: () => void;
  totalScore: number;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  game,
  evaluation,
  onNextGame,
  isGameOver = false,
  onRestart
}) => {
  useEffect(() => {
    if (evaluation.isExact) {
      // Big confetti explosion for exact hit
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    } else if (evaluation.isWithin100) {
      // Modest confetti burst for within 100
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [evaluation]);

  const diffSign = evaluation.guess > evaluation.actualAverage ? '+' : evaluation.guess < evaluation.actualAverage ? '-' : '';

  return (
    <div className="w-full max-w-4xl mx-auto bg-chess-panel border-2 border-chess-panelBorder rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-chess-panelBorder">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            evaluation.isExact 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : evaluation.isWithin100
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
          }`}>
            {evaluation.isExact ? (
              <Trophy className="w-8 h-8" />
            ) : evaluation.isWithin100 ? (
              <Award className="w-8 h-8" />
            ) : (
              <Target className="w-8 h-8" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {evaluation.isExact 
                  ? 'BULLSEYE! EXACT RATING!' 
                  : evaluation.isWithin100 
                  ? 'GREAT GUESS!' 
                  : 'OFF TARGET'}
              </h2>
              {evaluation.isExact && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40 animate-pulse">
                  PERFECT
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-400">
              {evaluation.feedback}
            </p>
          </div>
        </div>

        {/* Points Tag */}
        <div className="flex items-center gap-2">
          <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl font-mono ${
            evaluation.pointsEarned === 7
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
              : evaluation.pointsEarned === 3
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
          }`}>
            <span className="text-xs font-sans uppercase font-bold tracking-wider text-neutral-400">Points</span>
            <span className="text-2xl sm:text-3xl font-black">+{evaluation.pointsEarned}</span>
          </div>
        </div>
      </div>

      {/* Ratings Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Your Guess */}
        <div className="bg-chess-panelLight p-4 rounded-xl border border-chess-panelBorder flex flex-col items-center justify-center">
          <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">Your Guess</span>
          <span className="text-3xl font-black font-mono text-white">{evaluation.guess}</span>
          <span className="text-xs text-neutral-400 mt-1">
            Difference: <strong className={evaluation.isWithin100 ? 'text-emerald-400 font-mono' : 'text-neutral-300 font-mono'}>{diffSign}{Math.abs(evaluation.difference)} Elo</strong>
          </span>
        </div>

        {/* Actual Average (Target) */}
        <div className="bg-gradient-to-br from-chess-panelLight to-neutral-800 p-4 rounded-xl border-2 border-chess-accent/60 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-chess-accent opacity-60" />
          </div>
          <span className="text-xs text-chess-accent font-bold uppercase tracking-wider mb-1">Actual Average Elo</span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-chess-accent">{evaluation.actualAverage}</span>
          <span className="text-xs text-neutral-300 mt-1">Game Rating Benchmark</span>
        </div>

        {/* Individual Player Elo */}
        <div className="bg-chess-panelLight p-4 rounded-xl border border-chess-panelBorder flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-300 inline-block" />
              {game.white.username}
            </span>
            <span className="font-mono font-bold text-amber-400">{game.white.rating} Elo</span>
          </div>
          <div className="h-[1px] bg-chess-panelBorder" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-600 inline-block" />
              {game.black.username}
            </span>
            <span className="font-mono font-bold text-amber-400">{game.black.rating} Elo</span>
          </div>
        </div>
      </div>

      {/* Visual Difference Gauge */}
      <div className="bg-chess-bg p-4 rounded-xl border border-chess-panelBorder mb-6">
        <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
          <span>0 (Min)</span>
          <span className="text-chess-accent font-bold">Actual: {evaluation.actualAverage}</span>
          <span>Guess: {evaluation.guess}</span>
          <span>3500 (Max)</span>
        </div>
        <div className="relative w-full h-4 bg-neutral-800 rounded-full overflow-hidden">
          {/* Target marker zone +/- 100 */}
          <div 
            className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-500/50"
            style={{
              left: `${Math.max(0, (evaluation.actualAverage - 100) / 3500 * 100)}%`,
              width: `${(200 / 3500) * 100}%`
            }}
            title="Within 100 Elo Target Zone"
          />
          {/* Actual position bar */}
          <div 
            className="absolute top-0 bottom-0 w-1.5 bg-chess-accent z-10"
            style={{
              left: `${Math.max(0, Math.min(100, (evaluation.actualAverage / 3500) * 100))}%`
            }}
          />
          {/* User guess bar */}
          <div 
            className={`absolute top-0 bottom-0 w-1.5 z-20 ${evaluation.isExact ? 'bg-amber-400' : 'bg-cyan-400'}`}
            style={{
              left: `${Math.max(0, Math.min(100, (evaluation.guess / 3500) * 100))}%`
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-chess-accent inline-block" />
              Actual ({evaluation.actualAverage})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-cyan-400 inline-block" />
              Guess ({evaluation.guess})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500/50 inline-block" />
              ±100 Zone
            </span>
          </div>
          <span className="font-mono">
            {evaluation.isExact ? 'Perfect 100% precision' : `${Math.max(0, 100 - Math.round(evaluation.difference / 10))}% closeness`}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {game.url ? (
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-chess-panelLight hover:bg-neutral-700 text-neutral-300 hover:text-white border border-chess-panelBorder text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-chess-accent" />
            <span>Open on Chess.com</span>
          </a>
        ) : <div />}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isGameOver && onRestart ? (
            <button
              onClick={onRestart}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          ) : (
            <button
              onClick={onNextGame}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover text-white font-bold text-sm shadow-lg shadow-chess-accent/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Next Game</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
