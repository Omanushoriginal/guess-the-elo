import { useState, useEffect, useCallback } from 'react';
import type { ChessGame, RatingFilter, GuessEvaluation, GameStats } from './types/chess';
import { fetchRandomChessComGame } from './services/chessComApi';
import { CURATED_GAMES } from './services/curatedGames';
import { ChessBoardViewer } from './components/ChessBoardViewer';
import { GuessInput } from './components/GuessInput';
import { ResultModal } from './components/ResultModal';
import { ScoreBoard } from './components/ScoreBoard';
import { GameHeader } from './components/GameHeader';
import { RulesModal } from './components/RulesModal';
import { CustomUserModal } from './components/CustomUserModal';
import { soundFx } from './services/soundEffects';
import { Trophy, RefreshCw, AlertTriangle } from 'lucide-react';

const TOTAL_ROUNDS = 5;
const STORAGE_KEY = 'guess_the_elo_stats_v1';

export function App() {
  const [currentGame, setCurrentGame] = useState<ChessGame>(CURATED_GAMES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [customUser, setCustomUser] = useState<string | undefined>(undefined);
  const [gameMode, setGameMode] = useState<'rounds' | 'endless'>('rounds');
  const [currentRound, setCurrentRound] = useState<number>(1);

  const [evaluation, setEvaluation] = useState<GuessEvaluation | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isCustomUserOpen, setIsCustomUserOpen] = useState<boolean>(false);

  // Statistics state
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      totalScore: 0,
      roundsPlayed: 0,
      exactGuesses: 0,
      within100Guesses: 0,
      currentStreak: 0,
      bestStreak: 0,
      history: []
    };
  });

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Load game
  const loadGame = useCallback(async (filter: RatingFilter, user?: string) => {
    setIsLoading(true);
    setError(null);
    setIsRevealed(false);
    setEvaluation(null);

    try {
      const game = await fetchRandomChessComGame(filter, user);
      setCurrentGame(game);
    } catch (err: any) {
      console.error('Error fetching game:', err);
      // Fallback to random curated game
      const fallback = CURATED_GAMES[Math.floor(Math.random() * CURATED_GAMES.length)];
      setCurrentGame(fallback);
      setError('Could not connect to Chess.com API. Loaded a verified offline game.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadGame(ratingFilter, customUser);
  }, []);

  // Handle rating guess submission
  const handleGuessSubmit = (guess: number) => {
    if (isRevealed) return;

    const actualAverage = currentGame.averageRating;
    const diff = Math.abs(guess - actualAverage);
    const isExact = guess === actualAverage;
    const isWithin100 = !isExact && diff <= 100;

    let pointsEarned = 0;
    let feedback = '';

    if (isExact) {
      pointsEarned = 7;
      feedback = `Incredible! Exactly ${actualAverage} Elo! You nailed the rating perfectly.`;
      soundFx.playExact();
    } else if (isWithin100) {
      pointsEarned = 3;
      feedback = `Spot on! You were only ${diff} Elo away from ${actualAverage}.`;
      soundFx.playClose();
    } else {
      pointsEarned = 0;
      feedback = `You guessed ${guess}, but the actual average rating was ${actualAverage} (${diff} Elo off).`;
      soundFx.playMiss();
    }

    const evalResult: GuessEvaluation = {
      guess,
      actualAverage,
      actualWhite: currentGame.white.rating,
      actualBlack: currentGame.black.rating,
      difference: diff,
      pointsEarned,
      isExact,
      isWithin100,
      feedback
    };

    setEvaluation(evalResult);
    setIsRevealed(true);

    // Update stats
    setStats(prev => {
      const isHit = isExact || isWithin100;
      const nextStreak = isHit ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, nextStreak);

      return {
        totalScore: prev.totalScore + pointsEarned,
        roundsPlayed: prev.roundsPlayed + 1,
        exactGuesses: prev.exactGuesses + (isExact ? 1 : 0),
        within100Guesses: prev.within100Guesses + (isWithin100 ? 1 : 0),
        currentStreak: nextStreak,
        bestStreak,
        history: [
          {
            gameId: currentGame.id,
            white: currentGame.white,
            black: currentGame.black,
            guess,
            points: pointsEarned,
            difference: diff
          },
          ...prev.history.slice(0, 19)
        ]
      };
    });

    // Check game over in 5-round challenge mode
    if (gameMode === 'rounds' && currentRound >= TOTAL_ROUNDS) {
      setIsGameOver(true);
    }
  };

  // Next game handler
  const handleNextGame = () => {
    if (gameMode === 'rounds') {
      if (currentRound < TOTAL_ROUNDS) {
        setCurrentRound(r => r + 1);
        loadGame(ratingFilter, customUser);
      } else {
        setIsGameOver(true);
      }
    } else {
      setCurrentRound(r => r + 1);
      loadGame(ratingFilter, customUser);
    }
  };

  // Restart 5-round challenge
  const handleRestartChallenge = () => {
    setCurrentRound(1);
    setIsGameOver(false);
    loadGame(ratingFilter, customUser);
  };

  // Reset all stats
  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset your score and streaks?')) {
      const cleanStats: GameStats = {
        totalScore: 0,
        roundsPlayed: 0,
        exactGuesses: 0,
        within100Guesses: 0,
        currentStreak: 0,
        bestStreak: 0,
        history: []
      };
      setStats(cleanStats);
      setCurrentRound(1);
      setIsGameOver(false);
    }
  };

  const handleFilterChange = (filter: RatingFilter) => {
    setRatingFilter(filter);
    setCustomUser(undefined);
    loadGame(filter, undefined);
  };

  const handleSelectCustomUser = (user: string) => {
    setCustomUser(user);
    setIsCustomUserOpen(false);
    loadGame(ratingFilter, user);
  };

  const handleModeChange = (mode: 'rounds' | 'endless') => {
    setGameMode(mode);
    setCurrentRound(1);
    setIsGameOver(false);
  };

  return (
    <div className="min-h-screen bg-chess-bg text-neutral-200 flex flex-col font-sans selection:bg-chess-accent selection:text-white">
      {/* Header */}
      <GameHeader
        ratingFilter={ratingFilter}
        onFilterChange={handleFilterChange}
        gameMode={gameMode}
        onModeChange={handleModeChange}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenCustomUser={() => setIsCustomUserOpen(true)}
        onNewGame={() => loadGame(ratingFilter, customUser)}
        isLoading={isLoading}
        activeUsername={customUser}
        onClearCustomUser={() => {
          setCustomUser(undefined);
          loadGame(ratingFilter, undefined);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Score & Streak Stats Bar */}
        <ScoreBoard
          stats={stats}
          currentRound={currentRound}
          totalRounds={TOTAL_ROUNDS}
          gameMode={gameMode}
          onResetStats={handleResetStats}
        />

        {/* Error notification banner if any */}
        {error && (
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-amber-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Game Over Banner (if completed 5-round challenge) */}
        {isGameOver && (
          <div className="max-w-4xl mx-auto w-full bg-gradient-to-r from-amber-600/20 via-chess-panel to-amber-600/20 border-2 border-amber-500/50 rounded-2xl p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-3">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">5-Round Challenge Complete!</h2>
            <p className="text-sm text-neutral-300 mt-1 max-w-md mx-auto">
              You scored <strong className="text-amber-400 font-mono text-lg">{stats.totalScore}</strong> total points with {stats.exactGuesses} exact guesses and {stats.within100Guesses} near hits!
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={handleRestartChallenge}
                className="px-6 py-2.5 rounded-xl bg-chess-accent hover:bg-chess-accentHover text-white font-bold text-sm shadow-lg transition-all"
              >
                Start New Challenge
              </button>
            </div>
          </div>
        )}

        {/* Interactive Chessboard Viewer */}
        {isLoading ? (
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[460px] bg-chess-panel border border-chess-panelBorder rounded-2xl p-12">
            <RefreshCw className="w-12 h-12 text-chess-accent animate-spin mb-4" />
            <p className="text-base font-bold text-white">Fetching Chess Game from Chess.com...</p>
            <p className="text-xs text-neutral-400 mt-1">Retrieving player archives and position history</p>
          </div>
        ) : (
          <ChessBoardViewer
            game={currentGame}
            isRevealed={isRevealed}
          />
        )}

        {/* Rating Guess Input or Result Reveal */}
        {!isLoading && (
          <div className="w-full">
            {isRevealed && evaluation ? (
              <ResultModal
                game={currentGame}
                evaluation={evaluation}
                onNextGame={handleNextGame}
                isGameOver={isGameOver}
                onRestart={handleRestartChallenge}
                totalScore={stats.totalScore}
              />
            ) : (
              <GuessInput
                onSubmit={handleGuessSubmit}
                isRevealed={isRevealed}
                disabled={isLoading}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-chess-panel border-t border-chess-panelBorder py-4 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Guess The Elo • Powered by Chess.com Public API</span>
          <span>Scoring: Exact Guess = <strong>+7 pts</strong> | Within 100 Elo = <strong>+3 pts</strong></span>
        </div>
      </footer>

      {/* Modals */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <CustomUserModal
        isOpen={isCustomUserOpen}
        onClose={() => setIsCustomUserOpen(false)}
        onSelectUser={handleSelectCustomUser}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
