import React from 'react';
import { X, Trophy, Award, Target, HelpCircle, Lightbulb, Flame, Users, Clock } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-chess-panel border border-chess-panelBorder rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-chess-panelLight transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-6 h-6 text-chess-accent" />
          <h2 className="text-xl font-bold text-white">How To Play Guess The Elo</h2>
        </div>

        <p className="text-xs text-neutral-300 mb-5">
          Analyze real Chess.com games move-by-move, evaluate piece coordination, openings, and blunders to guess both player ratings!
        </p>

        {/* INSTANT VICTORY HERO BANNER */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-500/20 border-2 border-amber-400/80 mb-5 flex items-start gap-3">
          <Flame className="w-7 h-7 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="text-sm font-black text-amber-300">⚡ INSTANT VICTORY RULE</h4>
            <p className="text-xs text-neutral-200 mt-0.5">
              In multiplayer, an exact rating guess can trigger an <strong>Instant Match Victory</strong>. Choose whether this requires either rating, both ratings, White only, or Black only in match setup. Solo scoring and play are unchanged.
            </p>
          </div>
        </div>

        {/* Scoring Rules (Max 14 Pts) */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Scoring Rules (Max 14 Points Per Round):
          </h3>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">Exact Rating — 7 Points Each</h4>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                In multiplayer, guesses within 10 Elo earn +7 points per player. Solo exact guesses still earn +7 points.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300">Multiplayer Tiered Points</h4>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Multiplayer guesses within 25 Elo earn +5; within 100 Elo earn +3. Solo guesses within 100 Elo earn +3.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-800/80 border border-neutral-700">
            <Target className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-neutral-300">&gt; 100 Elo Off — 0 Points</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Guesses more than 100 points off score 0 points for that player.
              </p>
            </div>
          </div>
        </div>

        {/* Match Customization Features */}
        <div className="p-3.5 rounded-xl bg-chess-bg border border-chess-panelBorder mb-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-chess-accent">
            Match Options:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span><strong>2 to 5 Players</strong> Pass & Play</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-chess-accent" />
              <span><strong>5 to 10 Rounds</strong> per Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span><strong>2 to 10 Mins</strong> Round Timer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              <span>Live Leaderboards</span>
            </div>
          </div>
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
