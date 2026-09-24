import React from 'react';
import { X, Trophy, Award, Target, HelpCircle, Lightbulb } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-chess-panel border border-chess-panelBorder rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-chess-panelLight transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-6 h-6 text-chess-accent" />
          <h2 className="text-xl font-bold text-white">How To Play Guess The Elo</h2>
        </div>

        <p className="text-sm text-neutral-300 mb-5">
          Watch the chess game unfold move by move from Chess.com database, analyze player moves, tactical choices, and blunders to guess the game's average Elo rating!
        </p>

        {/* Scoring Rules */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">Exact Rating Guess — 7 Points</h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                If you guess the exact average rating of the game on the nose, you earn the maximum 7 points!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <Award className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-300">Within 100 Elo — 3 Points</h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                If your guess is within ±100 points of the actual average rating (e.g. ±1 to ±100), you earn 3 points!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/80 border border-neutral-700">
            <Target className="w-6 h-6 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-neutral-300">&gt; 100 Elo Difference — 0 Points</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Guesses more than 100 points away score 0 points.
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="p-3.5 rounded-xl bg-chess-bg border border-chess-panelBorder mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-chess-accent mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>Elo Estimation Clues</span>
          </div>
          <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
            <li><strong className="text-neutral-200">&lt; 800 Elo:</strong> Early queen attacks (Wayward Queen), 1-move hung pieces, missing simple captures.</li>
            <li><strong className="text-neutral-200">1000 - 1500 Elo:</strong> Solid opening knowledge, basic 2-move tactics, occasional endgame blunders.</li>
            <li><strong className="text-neutral-200">1800 - 2200 Elo:</strong> Deep tactical awareness, positional pawn structures, king safety mastery.</li>
            <li><strong className="text-neutral-200">2500+ GM:</strong> Flawless theoretical openings, precise conversion of small advantages.</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover text-white font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-chess-accent/20"
        >
          Got it, Let's Play!
        </button>
      </div>
    </div>
  );
};
