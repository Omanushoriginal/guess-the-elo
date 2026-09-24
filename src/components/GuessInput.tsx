import React, { useState, useEffect } from 'react';
import { Target, Sparkles, ArrowRight } from 'lucide-react';

interface GuessInputProps {
  onSubmit: (guess: number) => void;
  isRevealed: boolean;
  disabled?: boolean;
}

const PRESET_TIERS = [
  { label: '400', value: 400, desc: 'Beginner' },
  { label: '800', value: 800, desc: 'Novice' },
  { label: '1200', value: 1200, desc: 'Intermediate' },
  { label: '1500', value: 1500, desc: 'Club' },
  { label: '1800', value: 1800, desc: 'Strong Club' },
  { label: '2200', value: 2200, desc: 'Master' },
  { label: '2700+', value: 2700, desc: 'Super GM' }
];

export const GuessInput: React.FC<GuessInputProps> = ({
  onSubmit,
  isRevealed,
  disabled = false
}) => {
  const [guessValue, setGuessValue] = useState<number>(1400);

  // Reset or adjust if needed
  useEffect(() => {
    if (!isRevealed) {
      // Keep or keep default
    }
  }, [isRevealed]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuessValue(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setGuessValue(Math.max(100, Math.min(3800, val)));
    } else if (e.target.value === '') {
      setGuessValue(0);
    }
  };

  const adjustValue = (delta: number) => {
    setGuessValue(prev => Math.max(100, Math.min(3800, prev + delta)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isRevealed || guessValue <= 0) return;
    onSubmit(guessValue);
  };

  // Determine descriptive rating title for the slider position
  const getRatingCategory = (elo: number) => {
    if (elo < 600) return { title: 'Beginner / Woodpusher', color: 'text-amber-400' };
    if (elo < 1000) return { title: 'Casual / Developing', color: 'text-yellow-400' };
    if (elo < 1400) return { title: 'Intermediate Player', color: 'text-emerald-400' };
    if (elo < 1800) return { title: 'Advanced Club Player', color: 'text-cyan-400' };
    if (elo < 2200) return { title: 'Expert / Candidate Master', color: 'text-blue-400' };
    if (elo < 2500) return { title: 'National / FIDE Master', color: 'text-purple-400' };
    return { title: 'Grandmaster / Super GM', color: 'text-rose-400' };
  };

  const cat = getRatingCategory(guessValue);

  return (
    <div className="w-full max-w-4xl mx-auto bg-chess-panel border border-chess-panelBorder rounded-2xl p-5 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Header and Scoring Reminder */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-chess-panelBorder/70">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-chess-accent" />
            <h3 className="font-bold text-neutral-100 text-base sm:text-lg">
              Guess The Average Elo
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>Within 100: <strong className="text-emerald-400">+3 pts</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
              <span>Exact Guess: <strong className="text-amber-400">+7 pts</strong></span>
            </span>
          </div>
        </div>

        {/* Big Display & Adjust Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
          {/* Quick Fine-Tuning buttons & Numeric input */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            <button
              type="button"
              disabled={isRevealed || disabled}
              onClick={() => adjustValue(-100)}
              className="px-2.5 py-1.5 rounded-lg bg-chess-panelLight hover:bg-neutral-700 text-neutral-300 font-mono text-xs border border-chess-panelBorder transition-colors disabled:opacity-40"
            >
              -100
            </button>
            <button
              type="button"
              disabled={isRevealed || disabled}
              onClick={() => adjustValue(-25)}
              className="px-2.5 py-1.5 rounded-lg bg-chess-panelLight hover:bg-neutral-700 text-neutral-300 font-mono text-xs border border-chess-panelBorder transition-colors disabled:opacity-40"
            >
              -25
            </button>

            <div className="relative flex items-center">
              <input
                type="number"
                min="100"
                max="3800"
                value={guessValue || ''}
                onChange={handleInputChange}
                disabled={isRevealed || disabled}
                className="w-32 sm:w-36 text-center text-3xl sm:text-4xl font-black font-mono bg-chess-bg text-white border-2 border-chess-accent/60 rounded-xl py-2 px-3 focus:outline-none focus:border-chess-accent focus:ring-2 focus:ring-chess-accent/40 shadow-inner disabled:opacity-50"
              />
              <span className="absolute right-3 text-xs text-neutral-500 font-mono uppercase pointer-events-none">
                Elo
              </span>
            </div>

            <button
              type="button"
              disabled={isRevealed || disabled}
              onClick={() => adjustValue(25)}
              className="px-2.5 py-1.5 rounded-lg bg-chess-panelLight hover:bg-neutral-700 text-neutral-300 font-mono text-xs border border-chess-panelBorder transition-colors disabled:opacity-40"
            >
              +25
            </button>
            <button
              type="button"
              disabled={isRevealed || disabled}
              onClick={() => adjustValue(100)}
              className="px-2.5 py-1.5 rounded-lg bg-chess-panelLight hover:bg-neutral-700 text-neutral-300 font-mono text-xs border border-chess-panelBorder transition-colors disabled:opacity-40"
            >
              +100
            </button>
          </div>

          {/* Rating Category Badge & Submit Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-neutral-400">Estimated Tier:</div>
              <div className={`text-sm font-semibold ${cat.color}`}>{cat.title}</div>
            </div>

            <button
              type="submit"
              disabled={isRevealed || disabled || guessValue <= 0}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-chess-accent/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Submit Guess</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="flex flex-col gap-1.5 pt-1">
          <input
            type="range"
            min="200"
            max="3200"
            step="10"
            value={guessValue}
            onChange={handleSliderChange}
            disabled={isRevealed || disabled}
            className="w-full accent-chess-accent h-2.5 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
          <div className="flex justify-between text-[11px] font-mono text-neutral-500">
            <span>200 (Beginner)</span>
            <span>1000</span>
            <span>1600 (Club)</span>
            <span>2200 (Master)</span>
            <span>3200+ (Super GM)</span>
          </div>
        </div>

        {/* Preset quick tier chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-neutral-400 mr-1 flex items-center gap-1">
            Quick Jump:
          </span>
          {PRESET_TIERS.map(tier => (
            <button
              key={tier.value}
              type="button"
              disabled={isRevealed || disabled}
              onClick={() => setGuessValue(tier.value)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
                Math.abs(guessValue - tier.value) < 50
                  ? 'bg-chess-accent/20 border-chess-accent text-chess-accent font-bold'
                  : 'bg-chess-panelLight border-chess-panelBorder text-neutral-300 hover:text-white hover:bg-neutral-700'
              } disabled:opacity-40`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
