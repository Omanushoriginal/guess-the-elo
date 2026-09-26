import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Crown, 
  Medal, 
  RotateCcw 
} from 'lucide-react';
import type { ChessGame, PlayerRoundEvaluation, PlayerProfile } from '../types/chess';
import { soundFx } from '../services/soundEffects';

interface MultiplayerResultModalProps {
  game: ChessGame;
  evaluations: PlayerRoundEvaluation[];
  players: PlayerProfile[];
  currentRound: number;
  totalRounds: number;
  onNextRound: () => void;
  isMatchOver: boolean;
  onRestartMatch: () => void;
  instantWinner: PlayerProfile | null;
  isOnlineGuest?: boolean;
}

export const MultiplayerResultModal: React.FC<MultiplayerResultModalProps> = ({
  game,
  evaluations,
  players,
  currentRound,
  totalRounds,
  onNextRound,
  isMatchOver,
  onRestartMatch,
  instantWinner,
  isOnlineGuest = false,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const matchWinner = instantWinner || (isMatchOver ? sortedPlayers[0] : null);

  useEffect(() => {
    if (instantWinner) {
      soundFx.playInstantVictory();
      try {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch {}
    } else {
      const maxPts = Math.max(...evaluations.map(e => e.totalScore), 0);
      if (maxPts >= 7) {
        soundFx.playExact();
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else if (maxPts > 0) {
        soundFx.playClose();
      } else {
        soundFx.playMiss();
      }
    }
  }, [instantWinner, evaluations]);

  const getPointsLabel = (diff: number, score: number) => {
    if (score === 7) {
      if (diff === 0) return '+7 pts (Exact Hit!)';
      return `+7 pts (\u226410 pts: \u00B1${diff})`;
    }
    if (score === 5) return `+5 pts (\u226425 pts: \u00B1${diff})`;
    if (score === 3) return `+3 pts (\u2264100 pts: \u00B1${diff})`;
    return `+0 pts (Off by \u00B1${diff})`;
  };

  const getPointsColor = (score: number) => {
    if (score === 7) return '#fbbf24'; // Amber
    if (score === 5) return '#38bdf8'; // Cyan
    if (score === 3) return '#34d399'; // Emerald
    return '#9ca3af'; // Neutral
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-chess-panel border-2 border-chess-panelBorder rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6">
      {/* INSTANT VICTORY BANNER */}
      {instantWinner && (
        <div className="bg-gradient-to-r from-amber-500/30 via-chess-panel to-amber-500/30 border-2 border-amber-400 p-6 rounded-2xl text-center relative overflow-hidden shadow-2xl animate-pulseGlow">
          <div className="inline-flex p-3 rounded-full bg-amber-400/20 text-amber-300 mb-2">
            <Crown className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-amber-300 tracking-tight">
            ⚡ INSTANT MATCH VICTORY! ⚡
          </h2>
          <p className="text-base sm:text-lg text-white font-bold mt-1">
            <span className="text-amber-400 underline decoration-2">{instantWinner.name}</span> triggered an Instant Match Victory!
          </p>
          <p className="text-xs text-neutral-300 mt-1 max-w-md mx-auto">
            A bullseye exact rating match triggered immediate sudden-death championship victory!
          </p>
        </div>
      )}

      {/* MATCH COMPLETED PODIUM */}
      {!instantWinner && isMatchOver && matchWinner && (
        <div className="bg-gradient-to-r from-chess-accent/20 via-chess-panel to-chess-accent/20 border-2 border-chess-accent p-6 rounded-2xl text-center space-y-2 shadow-2xl">
          <div className="inline-flex p-3 rounded-full bg-chess-accent/20 text-chess-accent">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            🏆 Match Champion: {matchWinner.name}!
          </h2>
          <p className="text-sm text-neutral-300">
            Finished all {totalRounds} rounds with <strong className="text-amber-400 font-mono text-base">{matchWinner.score} Total Points</strong>!
          </p>
        </div>
      )}

      {/* Header: Actual Game Ratings Revealed */}
      <div className="bg-chess-bg p-4 rounded-xl border border-chess-panelBorder">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-chess-accent" />
            <h3 className="font-bold text-white text-base">
              Actual Ratings Revealed
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            Round {currentRound} of {totalRounds}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Actual White Player */}
          <div className="bg-chess-panelLight p-3.5 rounded-xl border border-chess-panelBorder flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-white border border-neutral-300 shadow-sm" />
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">White Player</div>
                <div className="text-sm font-bold text-white">{game.white.username}</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-amber-400">{game.white.rating}</div>
              <div className="text-[10px] text-neutral-400 uppercase">Elo Rating</div>
            </div>
          </div>

          {/* Actual Black Player */}
          <div className="bg-chess-panelLight p-3.5 rounded-xl border border-chess-panelBorder flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-600 shadow-sm" />
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Black Player</div>
                <div className="text-sm font-bold text-white">{game.black.username}</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-amber-400">{game.black.rating}</div>
              <div className="text-[10px] text-neutral-400 uppercase">Elo Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Round Performance Breakdown Cards */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Round {currentRound} Player Predictions:
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {evaluations.map((evalItem) => (
            <div 
              key={evalItem.playerId}
              className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                evalItem.isInstantVictory
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                  : 'bg-chess-panelLight border-chess-panelBorder text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-[160px]">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: evalItem.playerColor }} />
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <span>{evalItem.playerName}</span>
                    {evalItem.isInstantVictory && (
                      <span className="px-1.5 py-0.5 bg-amber-400 text-black text-[10px] font-black rounded uppercase font-mono">
                        Instant Win ⚡
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                {/* White Guess */}
                <div className="bg-chess-bg/80 p-2 rounded-lg border border-chess-panelBorder/60">
                  <div className="text-neutral-400 flex items-center justify-between">
                    <span>White Guess: <strong>{evalItem.whiteGuess}</strong></span>
                    <span className="font-mono text-neutral-300">
                      {evalItem.whiteDiff === 0 ? 'Exact!' : `\u00B1${evalItem.whiteDiff}`}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: getPointsColor(evalItem.whiteScore) }}>
                    {getPointsLabel(evalItem.whiteDiff, evalItem.whiteScore)}
                  </div>
                </div>

                {/* Black Guess */}
                <div className="bg-chess-bg/80 p-2 rounded-lg border border-chess-panelBorder/60">
                  <div className="text-neutral-400 flex items-center justify-between">
                    <span>Black Guess: <strong>{evalItem.blackGuess}</strong></span>
                    <span className="font-mono text-neutral-300">
                      {evalItem.blackDiff === 0 ? 'Exact!' : `\u00B1${evalItem.blackDiff}`}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: getPointsColor(evalItem.blackScore) }}>
                    {getPointsLabel(evalItem.blackDiff, evalItem.blackScore)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <div className="flex flex-col items-center justify-center px-3.5 py-1.5 rounded-lg bg-chess-bg font-mono border border-chess-panelBorder min-w-[70px]">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Round</span>
                  <span className="text-lg font-black text-amber-400">+{evalItem.totalScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Leaderboard Standings */}
      {players.length > 1 && (
        <div className="bg-chess-bg p-4 rounded-xl border border-chess-panelBorder space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-400" />
              Current Match Standings
            </span>
            <span>Total Points</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {sortedPlayers.map((player, rank) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                  rank === 0 
                    ? 'bg-amber-500/10 border border-amber-500/30 font-bold' 
                    : 'bg-chess-panelLight border border-chess-panelBorder'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-neutral-500 w-4">{rank + 1}.</span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: player.color }} />
                  <span className="text-white">{player.name}</span>
                  {rank === 0 && <Crown className="w-3.5 h-3.5 text-amber-400 inline" />}
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-neutral-400 text-[11px]">Exact: {player.exactHits}</span>
                  <span className="text-base font-black text-amber-400">{player.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      {isOnlineGuest ? (
        <p className="pt-2 text-center text-sm text-neutral-400">
          {instantWinner || isMatchOver
            ? 'The host ended the match. Leave the room when you are ready.'
            : `Waiting for the host to start round ${currentRound + 1}…`}
        </p>
      ) : (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {game.url ? (
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-chess-panelLight hover:bg-neutral-700 text-neutral-300 hover:text-white border border-chess-panelBorder text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-chess-accent" />
            <span>Open Game on Chess.com</span>
          </a>
        ) : <div />}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {instantWinner || isMatchOver ? (
            <button
              onClick={onRestartMatch}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover text-white font-black text-sm shadow-lg shadow-chess-accent/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Match</span>
            </button>
          ) : (
            <button
              onClick={onNextRound}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-chess-accent hover:bg-chess-accentHover text-white font-black text-sm shadow-lg shadow-chess-accent/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Play Round {currentRound + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
