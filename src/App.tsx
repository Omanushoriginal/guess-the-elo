import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  ChessGame, 
  RatingFilter, 
  MatchConfig, 
  DualGuess, 
  PlayerRoundEvaluation, 
  PlayerProfile 
} from './types/chess';
import { fetchRandomChessComGame } from './services/chessComApi';
import { CURATED_GAMES } from './services/curatedGames';
import { ChessBoardViewer } from './components/ChessBoardViewer';
import { DualGuessInput } from './components/DualGuessInput';
import { MultiplayerResultModal } from './components/MultiplayerResultModal';
import { GameHeader } from './components/GameHeader';
import { RulesModal } from './components/RulesModal';
import { CustomUserModal } from './components/CustomUserModal';
import { MatchSetupModal } from './components/MatchSetupModal';
import { soundFx } from './services/soundEffects';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const DEFAULT_MATCH_CONFIG: MatchConfig = {
  mode: 'multiplayer',
  playerCount: 2,
  players: [
    { id: 'player-1', name: 'Player 1', color: '#3b82f6', score: 0, exactHits: 0, within100Hits: 0 },
    { id: 'player-2', name: 'Player 2', color: '#ef4444', score: 0, exactHits: 0, within100Hits: 0 }
  ],
  totalRounds: 5,
  roundDurationMinutes: 3,
  instantWinCondition: 'either'
};

export function App() {
  const [currentGame, setCurrentGame] = useState<ChessGame>(CURATED_GAMES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [customUser, setCustomUser] = useState<string | undefined>(undefined);

  // Match Configuration & Progression
  const [matchConfig, setMatchConfig] = useState<MatchConfig>(DEFAULT_MATCH_CONFIG);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentTurnPlayerIndex, setCurrentTurnPlayerIndex] = useState<number>(0);
  const [playerGuesses, setPlayerGuesses] = useState<Record<string, DualGuess>>({});

  // Timer state
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(matchConfig.roundDurationMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Results & Reveal state
  const [evaluations, setEvaluations] = useState<PlayerRoundEvaluation[] | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [instantWinner, setInstantWinner] = useState<PlayerProfile | null>(null);
  const [isMatchOver, setIsMatchOver] = useState<boolean>(false);

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isCustomUserOpen, setIsCustomUserOpen] = useState<boolean>(false);
  const [isMatchSetupOpen, setIsMatchSetupOpen] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Load game
  const loadGame = useCallback(async (filter: RatingFilter, user?: string) => {
    setIsLoading(true);
    setError(null);
    setIsRevealed(false);
    setEvaluations(null);
    setPlayerGuesses({});
    setCurrentTurnPlayerIndex(0);
    setTimeRemainingSeconds(matchConfig.roundDurationMinutes * 60);
    setIsTimerPaused(false);

    try {
      const game = await fetchRandomChessComGame(filter, user);
      setCurrentGame(game);
    } catch (err: any) {
      console.error('Error fetching game:', err);
      const fallback = CURATED_GAMES[Math.floor(Math.random() * CURATED_GAMES.length)];
      setCurrentGame(fallback);
      setError('Could not connect to Chess.com API. Loaded a verified offline game.');
    } finally {
      setIsLoading(false);
    }
  }, [matchConfig.roundDurationMinutes]);

  // Initial load
  useEffect(() => {
    loadGame(ratingFilter, customUser);
  }, []);

  // Round Timer Countdown Loop
  useEffect(() => {
    if (isRevealed || isMatchOver || isTimerPaused || isLoading) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          soundFx.playTimerAlarm();
          handleTimeoutAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRevealed, isMatchOver, isTimerPaused, isLoading, currentTurnPlayerIndex, playerGuesses]);

  // Finalize round evaluation given all submitted guesses
  const evaluateRound = useCallback((submittedGuesses: Record<string, DualGuess>) => {
    const whiteActual = currentGame.white.rating;
    const blackActual = currentGame.black.rating;
    const isMultiplayer = matchConfig.mode === 'multiplayer';

    let foundInstantWinner: PlayerProfile | null = null;

    const roundEvaluations: PlayerRoundEvaluation[] = matchConfig.players.map((player) => {
      const guess = submittedGuesses[player.id] || { whiteGuess: 1400, blackGuess: 1400 };
      
      const whiteDiff = Math.abs(guess.whiteGuess - whiteActual);
      const blackDiff = Math.abs(guess.blackGuess - blackActual);

      const isWhiteExact = guess.whiteGuess === whiteActual;
      const isBlackExact = guess.blackGuess === blackActual;

      let whiteScore = 0;
      let blackScore = 0;

      if (isMultiplayer) {
        // Multiplayer scoring: +7 if <= 10 rating points, +5 if <= 25, +3 if <= 100
        if (whiteDiff <= 10) whiteScore = 7;
        else if (whiteDiff <= 25) whiteScore = 5;
        else if (whiteDiff <= 100) whiteScore = 3;
        else whiteScore = 0;

        if (blackDiff <= 10) blackScore = 7;
        else if (blackDiff <= 25) blackScore = 5;
        else if (blackDiff <= 100) blackScore = 3;
        else blackScore = 0;
      } else {
        // Solo scoring (unchanged): +7 for exact (diff == 0), +3 for <= 100
        whiteScore = isWhiteExact ? 7 : whiteDiff <= 100 ? 3 : 0;
        blackScore = isBlackExact ? 7 : blackDiff <= 100 ? 3 : 0;
      }

      const totalScore = whiteScore + blackScore;

      // Determine if this player triggered Instant Victory based on user's chosen condition
      let isInstantVictory = false;
      switch (isMultiplayer ? matchConfig.instantWinCondition : 'disabled') {
        case 'both':
          isInstantVictory = isWhiteExact && isBlackExact;
          break;
        case 'white_only':
          isInstantVictory = isWhiteExact;
          break;
        case 'black_only':
          isInstantVictory = isBlackExact;
          break;
        case 'disabled':
          isInstantVictory = false;
          break;
        case 'either':
        default:
          isInstantVictory = isWhiteExact || isBlackExact;
          break;
      }

      if (isInstantVictory && !foundInstantWinner) {
        foundInstantWinner = player;
      }

      return {
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        whiteGuess: guess.whiteGuess,
        blackGuess: guess.blackGuess,
        whiteActual,
        blackActual,
        whiteDiff,
        blackDiff,
        whiteScore,
        blackScore,
        totalScore,
        isWhiteExact,
        isBlackExact,
        isWhiteWithin100: whiteDiff <= 100,
        isBlackWithin100: blackDiff <= 100,
        isInstantVictory
      };
    });

    // Update cumulative player scores
    setMatchConfig((prev) => {
      const updatedPlayers = prev.players.map((p) => {
        const evalItem = roundEvaluations.find(e => e.playerId === p.id);
        if (!evalItem) return p;
        return {
          ...p,
          score: p.score + evalItem.totalScore,
          exactHits: p.exactHits + (evalItem.isWhiteExact ? 1 : 0) + (evalItem.isBlackExact ? 1 : 0),
          within100Hits: p.within100Hits + (evalItem.isWhiteWithin100 ? 1 : 0) + (evalItem.isBlackWithin100 ? 1 : 0)
        };
      });
      return { ...prev, players: updatedPlayers };
    });

    setEvaluations(roundEvaluations);
    setIsRevealed(true);

    if (foundInstantWinner) {
      setInstantWinner(foundInstantWinner);
      setIsMatchOver(true);
    } else if (currentRound >= matchConfig.totalRounds) {
      setIsMatchOver(true);
    }
  }, [currentGame, matchConfig.players, matchConfig.totalRounds, matchConfig.mode, matchConfig.instantWinCondition, currentRound]);

  // Handle timeout auto-submit
  const handleTimeoutAutoSubmit = () => {
    if (isRevealed) return;
    const filledGuesses = { ...playerGuesses };
    matchConfig.players.forEach(p => {
      if (!filledGuesses[p.id]) {
        filledGuesses[p.id] = { whiteGuess: 1400, blackGuess: 1400 };
      }
    });
    evaluateRound(filledGuesses);
  };

  // Handle player submitting their White & Black guess
  const handlePlayerGuessSubmit = (guess: DualGuess) => {
    if (isRevealed) return;

    const currentPlayer = matchConfig.players[currentTurnPlayerIndex];
    if (!currentPlayer) return;

    const updatedGuesses = {
      ...playerGuesses,
      [currentPlayer.id]: guess
    };
    setPlayerGuesses(updatedGuesses);

    if (currentTurnPlayerIndex < matchConfig.players.length - 1) {
      setCurrentTurnPlayerIndex(idx => idx + 1);
    } else {
      evaluateRound(updatedGuesses);
    }
  };

  // Next round
  const handleNextRound = () => {
    if (currentRound < matchConfig.totalRounds && !instantWinner) {
      setCurrentRound(r => r + 1);
      loadGame(ratingFilter, customUser);
    } else {
      setIsMatchOver(true);
    }
  };

  // Start new match with custom config
  const handleStartMatch = (newConfig: MatchConfig) => {
    setMatchConfig(newConfig);
    setCurrentRound(1);
    setIsMatchOver(false);
    setInstantWinner(null);
    loadGame(ratingFilter, customUser);
  };

  // Restart current match configuration
  const handleRestartMatch = () => {
    const resetPlayers = matchConfig.players.map(p => ({
      ...p,
      score: 0,
      exactHits: 0,
      within100Hits: 0
    }));
    setMatchConfig(prev => ({ ...prev, players: resetPlayers }));
    setCurrentRound(1);
    setIsMatchOver(false);
    setInstantWinner(null);
    loadGame(ratingFilter, customUser);
  };

  const activePlayer = matchConfig.players[currentTurnPlayerIndex];

  return (
    <div className="min-h-screen bg-chess-bg text-neutral-200 flex flex-col font-sans selection:bg-chess-accent selection:text-white">
      {/* Header */}
      <GameHeader
        ratingFilter={ratingFilter}
        onFilterChange={(f) => {
          setRatingFilter(f);
          setCustomUser(undefined);
          loadGame(f, undefined);
        }}
        matchConfig={matchConfig}
        currentRound={currentRound}
        timeRemainingSeconds={timeRemainingSeconds}
        isTimerPaused={isTimerPaused}
        onTogglePauseTimer={() => setIsTimerPaused(p => !p)}
        isRevealed={isRevealed}
        onOpenMatchSetup={() => setIsMatchSetupOpen(true)}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
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

        {/* Interactive Chessboard Viewer */}
        {isLoading ? (
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[460px] bg-chess-panel border border-chess-panelBorder rounded-2xl p-12">
            <RefreshCw className="w-12 h-12 text-chess-accent animate-spin mb-4" />
            <p className="text-base font-bold text-white">Fetching Chess Game from Chess.com...</p>
            <p className="text-xs text-neutral-400 mt-1">Retrieving player archives and move history</p>
          </div>
        ) : (
          <ChessBoardViewer
            game={currentGame}
            isRevealed={isRevealed}
          />
        )}

        {/* Dual Guess Input or Multiplayer Reveal Modal */}
        {!isLoading && (
          <div className="w-full">
            {isRevealed && evaluations ? (
              <MultiplayerResultModal
                game={currentGame}
                evaluations={evaluations}
                players={matchConfig.players}
                currentRound={currentRound}
                totalRounds={matchConfig.totalRounds}
                onNextRound={handleNextRound}
                isMatchOver={isMatchOver}
                onRestartMatch={handleRestartMatch}
                instantWinner={instantWinner}
              />
            ) : (
              <DualGuessInput
                onSubmitPlayerGuess={handlePlayerGuessSubmit}
                activePlayer={activePlayer}
                totalPlayersInRound={matchConfig.players.length}
                currentTurnIndex={currentTurnPlayerIndex}
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
          <span>Guess The Elo • 2–5 Player Multiplayer & Solo Practice</span>
          <span>Multiplayer: &le;10 (+7 pts) | &le;25 (+5 pts) | &le;100 (+3 pts) • Instant Win on Exact Hit ⚡</span>
        </div>
      </footer>

      {/* Modals */}
      <MatchSetupModal
        isOpen={isMatchSetupOpen}
        onClose={() => setIsMatchSetupOpen(false)}
        onStartMatch={handleStartMatch}
        currentConfig={matchConfig}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <CustomUserModal
        isOpen={isCustomUserOpen}
        onClose={() => setIsCustomUserOpen(false)}
        onSelectUser={(u) => {
          setCustomUser(u);
          setIsCustomUserOpen(false);
          loadGame(ratingFilter, u);
        }}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
