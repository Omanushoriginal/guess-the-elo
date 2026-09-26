import React, { useEffect } from 'react';
import { Clock, Pause, Play } from 'lucide-react';
import { soundFx } from '../services/soundEffects';

interface RoundTimerProps {
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  isRevealed: boolean;
}

export const RoundTimer: React.FC<RoundTimerProps> = ({
  timeRemainingSeconds,
  isPaused,
  onTogglePause,
  isRevealed
}) => {
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = timeRemainingSeconds <= 30 && timeRemainingSeconds > 0;

  // Sound ticking in the last 10 seconds
  useEffect(() => {
    if (!isRevealed && !isPaused && timeRemainingSeconds > 0 && timeRemainingSeconds <= 10) {
      soundFx.playTimerTick();
    }
  }, [timeRemainingSeconds, isRevealed, isPaused]);

  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
      isUrgent
        ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
        : 'bg-chess-bg border-chess-panelBorder text-neutral-200'
    }`}>
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-amber-400'}`} />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-sm tracking-widest">
            {formattedTime}
          </span>
          {!isRevealed && (
            <button
              type="button"
              onClick={onTogglePause}
              className="p-1 hover:text-white text-neutral-400 transition-colors"
              title={isPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current text-emerald-400" /> : <Pause className="w-3 h-3 fill-current" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
