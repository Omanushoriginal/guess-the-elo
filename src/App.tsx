import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  ChessGame, 
  RatingFilter, 
  MatchConfig, 
  DualGuess, 
  PlayerRoundEvaluation, 
  PlayerProfile,
  GuessEvaluation
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
import { GuessInput } from './components/GuessInput';
import { ResultModal } from './components/ResultModal';
import { StartScreen, type RoomSettings } from './components/StartScreen';
import { RoomLobby } from './components/RoomLobby';
import { createRoomCode, createRoomPeer, sendRoomMessage, type OnlineRoom, type RoomMessage, type RoomPlayer } from './services/onlineRooms';
import type { DataConnection, Peer } from 'peerjs';
import { soundFx } from './services/soundEffects';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const DEFAULT_MATCH_CONFIG: MatchConfig = {
  mode: 'solo',
  playerCount: 1,
  players: [
    { id: 'solo-player', name: 'You', color: '#3b82f6', score: 0, exactHits: 0, within100Hits: 0 }
  ],
  totalRounds: 5,
  roundDurationMinutes: 3,
  instantWinCondition: 'either'
};

const SOLO_MATCH_CONFIG: MatchConfig = {
  ...DEFAULT_MATCH_CONFIG,
  mode: 'solo',
  playerCount: 1,
  players: [{ id: 'solo-player', name: 'You', color: '#3b82f6', score: 0, exactHits: 0, within100Hits: 0 }]
};

const LOCAL_MULTIPLAYER_CONFIG: MatchConfig = {
  ...DEFAULT_MATCH_CONFIG,
  mode: 'multiplayer',
  playerCount: 2,
  players: [
    { id: 'player-1', name: 'Player 1', color: '#3b82f6', score: 0, exactHits: 0, within100Hits: 0 },
    { id: 'player-2', name: 'Player 2', color: '#ef4444', score: 0, exactHits: 0, within100Hits: 0 }
  ]
};

export function App() {
  const [currentGame, setCurrentGame] = useState<ChessGame>(CURATED_GAMES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [customUser, setCustomUser] = useState<string | undefined>(undefined);

  // Match Configuration & Progression
  const [matchConfig, setMatchConfig] = useState<MatchConfig>(DEFAULT_MATCH_CONFIG);
  const [screen, setScreen] = useState<'start' | 'room' | 'game'>('start');
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoom | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const roomPlayersRef = useRef<RoomPlayer[]>([]);
  roomPlayersRef.current = roomPlayers;
  const [roomCapacity, setRoomCapacity] = useState(2);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [soloEvaluation, setSoloEvaluation] = useState<GuessEvaluation | null>(null);
  const [soloScore, setSoloScore] = useState(0);
  const [hasSubmittedRoomGuess, setHasSubmittedRoomGuess] = useState(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const currentRoundRef = useRef(currentRound);
  currentRoundRef.current = currentRound;
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
  const peerRef = useRef<Peer | null>(null);
  const roomConnectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const roomPlayingRef = useRef(false);
  const incomingGuessHandlerRef = useRef<(playerId: string, guess: DualGuess) => void>(() => undefined);

  const timerRef = useRef<any>(null);

  // Load game
  const loadGame = useCallback(async (filter: RatingFilter, user?: string) => {
    setIsLoading(true);
    setError(null);
    setIsRevealed(false);
    setEvaluations(null);
    setSoloEvaluation(null);
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

  // Round Timer Countdown Loop
  useEffect(() => {
    if (matchConfig.mode === 'solo' || screen !== 'game' || onlineRoom?.role === 'guest') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
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
  }, [screen, onlineRoom?.role, matchConfig.mode, isRevealed, isMatchOver, isTimerPaused, isLoading, currentTurnPlayerIndex, playerGuesses]);

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

    if (onlineRoom?.role === 'guest') {
      const connection = roomConnectionsRef.current.get('host');
      if (!connection?.open) {
        setRoomError('Connection to the host was lost. Leave the room and try joining again.');
        return;
      }
      sendRoomMessage(connection, { type: 'guess', playerId: onlineRoom.playerId, guess });
      setPlayerGuesses({ [onlineRoom.playerId]: guess });
      setHasSubmittedRoomGuess(true);
      return;
    }

    const playerId = onlineRoom?.role === 'host'
      ? matchConfig.players[0]?.id
      : matchConfig.players[currentTurnPlayerIndex]?.id;
    if (!playerId) return;
    addPlayerGuess(playerId, guess);
  };

  const addPlayerGuess = (playerId: string, guess: DualGuess) => {
    if (isRevealed) return;
    if (playerGuesses[playerId]) return;

    const updatedGuesses = {
      ...playerGuesses,
      [playerId]: guess
    };
    setPlayerGuesses(updatedGuesses);

    if (onlineRoom?.role === 'host') {
      if (matchConfig.players.every(player => updatedGuesses[player.id])) evaluateRound(updatedGuesses);
    } else if (currentTurnPlayerIndex < matchConfig.players.length - 1) {
      setCurrentTurnPlayerIndex(idx => idx + 1);
    } else {
      evaluateRound(updatedGuesses);
    }
  };

  incomingGuessHandlerRef.current = addPlayerGuess;

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
    setSoloScore(0);
    setScreen('game');
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
    setSoloScore(0);
    loadGame(ratingFilter, customUser);
  };

  const applyRoomSnapshot = (rawSnapshot: unknown) => {
    const snapshot = rawSnapshot as {
      matchConfig?: MatchConfig;
      currentGame?: ChessGame;
      currentRound?: number;
      isLoading?: boolean;
      isRevealed?: boolean;
      evaluations?: PlayerRoundEvaluation[] | null;
      instantWinner?: PlayerProfile | null;
      isMatchOver?: boolean;
      timeRemainingSeconds?: number;
      isTimerPaused?: boolean;
    };
    if (snapshot.matchConfig) setMatchConfig(snapshot.matchConfig);
    if (snapshot.currentGame) setCurrentGame(snapshot.currentGame);
    if (typeof snapshot.currentRound === 'number') {
      if (snapshot.currentRound !== currentRoundRef.current) {
        setPlayerGuesses({});
        setHasSubmittedRoomGuess(false);
      }
      currentRoundRef.current = snapshot.currentRound;
      setCurrentRound(snapshot.currentRound);
    }
    if (typeof snapshot.isLoading === 'boolean') setIsLoading(snapshot.isLoading);
    if (typeof snapshot.isRevealed === 'boolean') setIsRevealed(snapshot.isRevealed);
    if (snapshot.evaluations !== undefined) setEvaluations(snapshot.evaluations);
    if (snapshot.instantWinner !== undefined) setInstantWinner(snapshot.instantWinner);
    if (typeof snapshot.isMatchOver === 'boolean') setIsMatchOver(snapshot.isMatchOver);
    if (typeof snapshot.timeRemainingSeconds === 'number') setTimeRemainingSeconds(snapshot.timeRemainingSeconds);
    if (typeof snapshot.isTimerPaused === 'boolean') setIsTimerPaused(snapshot.isTimerPaused);
    setScreen('game');
    setOnlineRoom(previous => previous ? { ...previous, status: 'playing' } : previous);
    roomPlayingRef.current = true;
  };

  useEffect(() => {
    if (screen !== 'game' || onlineRoom?.role !== 'host') return;
    const snapshot = {
      matchConfig,
      currentGame,
      currentRound,
      isLoading,
      isRevealed,
      evaluations,
      instantWinner,
      isMatchOver,
      timeRemainingSeconds,
      isTimerPaused
    };
    for (const connection of roomConnectionsRef.current.values()) {
      sendRoomMessage(connection, { type: 'sync', snapshot });
    }
  }, [screen, onlineRoom?.role, matchConfig, currentGame, currentRound, isLoading, isRevealed, evaluations, instantWinner, isMatchOver, timeRemainingSeconds, isTimerPaused]);

  const handleCreateRoom = (settings: RoomSettings) => {
    setRoomError(null);
    setIsConnecting(true);
    roomPlayingRef.current = false;
    const code = createRoomCode();
    const peer = createRoomPeer(code);
    peerRef.current?.destroy();
    peerRef.current = peer;

    peer.on('open', (peerId) => {
      const host: PlayerProfile = {
        id: peerId,
        name: settings.playerName,
        color: '#3b82f6',
        score: 0,
        exactHits: 0,
        within100Hits: 0
      };
      const config: MatchConfig = {
        mode: 'multiplayer',
        playerCount: settings.playerCount,
        players: [host],
        totalRounds: settings.totalRounds,
        roundDurationMinutes: settings.roundDurationMinutes,
        instantWinCondition: settings.instantWinCondition
      };
      setMatchConfig(config);
      setRoomCapacity(settings.playerCount);
      setRoomPlayers([{ id: host.id, name: host.name }]);
      roomPlayersRef.current = [{ id: host.id, name: host.name }];
      setOnlineRoom({ role: 'host', code, playerId: host.id, status: 'lobby' });
      setScreen('room');
      setIsConnecting(false);
    });

    peer.on('connection', connection => {
      connection.on('data', rawMessage => {
        const message = rawMessage as RoomMessage;
        if (message.type === 'guess' && message.playerId === connection.peer) {
          incomingGuessHandlerRef.current(message.playerId, message.guess);
          return;
        }
        if (message.type !== 'join') return;
        if (roomPlayingRef.current) {
          sendRoomMessage(connection, { type: 'error', message: 'This match has already started.' });
          connection.close();
          return;
        }
        if (roomPlayersRef.current.length >= settings.playerCount) {
          sendRoomMessage(connection, { type: 'error', message: 'This room is full.' });
          connection.close();
          return;
        }
        const joinedPlayer: PlayerProfile = {
          id: connection.peer,
          name: message.name.slice(0, 20) || 'Guest',
          color: ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][roomConnectionsRef.current.size % 4],
          score: 0,
          exactHits: 0,
          within100Hits: 0
        };
        roomConnectionsRef.current.set(connection.peer, connection);
        setMatchConfig(previous => {
          if (previous.players.some(player => player.id === joinedPlayer.id) || previous.players.length >= settings.playerCount) return previous;
          return { ...previous, players: [...previous.players, joinedPlayer] };
        });
        if (roomPlayersRef.current.some(player => player.id === joinedPlayer.id)) return;
        const nextPlayers = [...roomPlayersRef.current, { id: joinedPlayer.id, name: joinedPlayer.name }];
        roomPlayersRef.current = nextPlayers;
        setRoomPlayers(nextPlayers);
        const messageToSend: RoomMessage = { type: 'lobby', players: nextPlayers, capacity: settings.playerCount };
        for (const roomConnection of roomConnectionsRef.current.values()) sendRoomMessage(roomConnection, messageToSend);
      });
      connection.on('close', () => {
        roomConnectionsRef.current.delete(connection.peer);
        if (roomPlayingRef.current) return;
        setMatchConfig(previous => ({ ...previous, players: previous.players.filter(player => player.id !== connection.peer) }));
        const nextPlayers = roomPlayersRef.current.filter(player => player.id !== connection.peer);
        roomPlayersRef.current = nextPlayers;
        setRoomPlayers(nextPlayers);
        for (const roomConnection of roomConnectionsRef.current.values()) {
          sendRoomMessage(roomConnection, { type: 'lobby', players: nextPlayers, capacity: settings.playerCount });
        }
      });
    });

    peer.on('error', error => {
      setRoomError(error.type === 'unavailable-id'
        ? 'That room code is already in use. Try creating the room again.'
        : `Could not connect to the room service (${error.type}). Check your connection and try again.`);
      setIsConnecting(false);
      if (!onlineRoom) peer.destroy();
    });
  };

  const handleJoinRoom = (code: string, playerName: string) => {
    setRoomError(null);
    setIsConnecting(true);
    roomPlayingRef.current = false;
    const peer = createRoomPeer();
    peerRef.current?.destroy();
    peerRef.current = peer;

    peer.on('open', playerId => {
      const info: OnlineRoom = { role: 'guest', code, playerId, status: 'lobby' };
      setOnlineRoom(info);
      setRoomPlayers([{ id: playerId, name: playerName }]);
      roomPlayersRef.current = [{ id: playerId, name: playerName }];
      setScreen('room');
      const connection = peer.connect(`gte-${code}`, { reliable: true });
      roomConnectionsRef.current.set('host', connection);
      connection.on('open', () => sendRoomMessage(connection, { type: 'join', name: playerName }));
      connection.on('data', rawMessage => {
        const message = rawMessage as RoomMessage;
        if (message.type === 'lobby') {
          setRoomCapacity(message.capacity);
          setRoomPlayers(message.players);
          roomPlayersRef.current = message.players;
        } else if (message.type === 'start' || message.type === 'sync') {
          applyRoomSnapshot(message.snapshot);
        } else if (message.type === 'error') {
          setRoomError(message.message);
        }
      });
      connection.on('error', () => setRoomError('Could not reach the host. Check the room code and try again.'));
      connection.on('close', () => {
        if (roomPlayingRef.current) setRoomError('The host disconnected from this match.');
      });
      setIsConnecting(false);
    });
    peer.on('error', error => {
      setRoomError(`Could not join the room (${error.type}). Check the code and your connection.`);
      setIsConnecting(false);
      peer.destroy();
    });
  };

  const handleStartRoom = async () => {
    if (onlineRoom?.role !== 'host' || roomPlayers.length < 2) return;
    roomPlayingRef.current = true;
    setOnlineRoom(previous => previous ? { ...previous, status: 'playing' } : previous);
    setScreen('game');
    setCurrentRound(1);
    setIsMatchOver(false);
    setInstantWinner(null);
    setPlayerGuesses({});
    setIsRevealed(false);
    setIsTimerPaused(false);
    setTimeRemainingSeconds(matchConfig.roundDurationMinutes * 60);
    await loadGame(ratingFilter, customUser);
    setTimeRemainingSeconds(matchConfig.roundDurationMinutes * 60);
  };

  const handleLeaveRoom = () => {
    roomPlayingRef.current = true;
    for (const connection of roomConnectionsRef.current.values()) {
      sendRoomMessage(connection, { type: 'error', message: 'The host closed the room.' });
      connection.close();
    }
    roomConnectionsRef.current.clear();
    peerRef.current?.destroy();
    peerRef.current = null;
    setOnlineRoom(null);
    setRoomPlayers([]);
    roomPlayersRef.current = [];
    setRoomError(null);
    setMatchConfig(SOLO_MATCH_CONFIG);
    setScreen('start');
  };

  const handleStartSolo = () => {
    setMatchConfig(SOLO_MATCH_CONFIG);
    setSoloScore(0);
    setCurrentRound(1);
    setIsMatchOver(false);
    setScreen('game');
    loadGame(ratingFilter, customUser);
  };

  const handleRestartSolo = () => {
    setSoloScore(0);
    setCurrentRound(1);
    setIsMatchOver(false);
    loadGame(ratingFilter, customUser);
  };

  const handleStartLocalMultiplayer = () => {
    setMatchConfig(LOCAL_MULTIPLAYER_CONFIG);
    setIsMatchSetupOpen(true);
  };

  const handleSoloGuess = (guess: number) => {
    if (isRevealed) return;
    const actualAverage = currentGame.averageRating;
    const difference = Math.abs(guess - actualAverage);
    const isExact = guess === actualAverage;
    const isWithin100 = !isExact && difference <= 100;
    const pointsEarned = isExact ? 7 : isWithin100 ? 3 : 0;
    const feedback = isExact
      ? `Incredible! Exactly ${actualAverage} Elo! You nailed the rating perfectly.`
      : isWithin100
        ? `Spot on! You were only ${difference} Elo away from ${actualAverage}.`
        : `You guessed ${guess}, but the actual average rating was ${actualAverage} (${difference} Elo off).`;
    setSoloEvaluation({
      guess,
      actualAverage,
      actualWhite: currentGame.white.rating,
      actualBlack: currentGame.black.rating,
      difference,
      pointsEarned,
      isExact,
      isWithin100,
      feedback
    });
    setSoloScore(score => score + pointsEarned);
    setIsRevealed(true);
    if (isExact) soundFx.playExact();
    else if (isWithin100) soundFx.playClose();
    else soundFx.playMiss();
    if (currentRound >= matchConfig.totalRounds) setIsMatchOver(true);
  };

  const handleNextSoloGame = () => {
    if (currentRound >= matchConfig.totalRounds) {
      setIsMatchOver(true);
      return;
    }
    setCurrentRound(round => round + 1);
    loadGame(ratingFilter, customUser);
  };

  const activePlayer = onlineRoom?.role === 'guest'
    ? matchConfig.players.find(player => player.id === onlineRoom.playerId)
    : onlineRoom?.role === 'host'
      ? matchConfig.players[0]
      : matchConfig.players[currentTurnPlayerIndex];

  if (screen === 'start') {
    return <>
      <StartScreen
        onSolo={handleStartSolo}
        onLocalMultiplayer={handleStartLocalMultiplayer}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onOpenRules={() => setIsRulesOpen(true)}
        roomError={roomError}
        isConnecting={isConnecting}
      />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      {isMatchSetupOpen && <MatchSetupModal
        isOpen
        onClose={() => setIsMatchSetupOpen(false)}
        onStartMatch={handleStartMatch}
        currentConfig={matchConfig}
      />}
    </>;
  }

  if (screen === 'room' && onlineRoom) {
    return <RoomLobby
      code={onlineRoom.code}
      players={roomPlayers}
      capacity={roomCapacity}
      isHost={onlineRoom.role === 'host'}
      isStarting={isLoading}
      onStart={handleStartRoom}
      onLeave={handleLeaveRoom}
      roomError={roomError}
    />;
  }

  return (
    <div className="min-h-screen bg-chess-bg text-neutral-200 flex flex-col font-sans selection:bg-chess-accent selection:text-white">
      {/* Header */}
      <GameHeader
        ratingFilter={ratingFilter}
        canConfigure={!onlineRoom}
        onFilterChange={(f) => {
          if (onlineRoom?.role === 'guest') return;
          setRatingFilter(f);
          setCustomUser(undefined);
          loadGame(f, undefined);
        }}
        matchConfig={matchConfig}
        currentRound={currentRound}
        timeRemainingSeconds={timeRemainingSeconds}
        isTimerPaused={isTimerPaused}
        onTogglePauseTimer={() => {
          if (onlineRoom?.role !== 'guest') setIsTimerPaused(p => !p);
        }}
        isRevealed={isRevealed}
        onOpenMatchSetup={() => {
          if (!onlineRoom) setIsMatchSetupOpen(true);
        }}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenCustomUser={() => {
          if (!onlineRoom) setIsCustomUserOpen(true);
        }}
        onNewGame={() => {
          if (onlineRoom?.role !== 'guest') loadGame(ratingFilter, customUser);
        }}
        isLoading={isLoading}
        roomCode={onlineRoom?.code}
        onLeaveRoom={onlineRoom ? handleLeaveRoom : undefined}
        activeUsername={customUser}
        onClearCustomUser={() => {
          if (onlineRoom) return;
          setCustomUser(undefined);
          loadGame(ratingFilter, undefined);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Error notification banner if any */}
        {(error || roomError) && (
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{roomError || error}</span>
            </div>
            <button
              onClick={() => { setError(null); setRoomError(null); }}
              className="text-amber-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {matchConfig.mode === 'solo' && <div className="w-full max-w-6xl mx-auto flex items-center justify-between rounded-xl bg-chess-panel border border-chess-panelBorder px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Singleplayer challenge score</span>
          <span className="text-sm font-black text-amber-300">{soloScore} pts <span className="text-neutral-500 font-medium">• Round {currentRound}/{matchConfig.totalRounds}</span></span>
        </div>}

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

        {/* Singleplayer uses the classic average rating rules; multiplayer guesses both players. */}
        {!isLoading && (
          <div className="w-full">
            {matchConfig.mode === 'solo' && isRevealed && soloEvaluation ? (
              <ResultModal
                game={currentGame}
                evaluation={soloEvaluation}
                onNextGame={handleNextSoloGame}
                isGameOver={isMatchOver}
                onRestart={handleRestartSolo}
                totalScore={soloScore}
              />
            ) : matchConfig.mode === 'solo' ? (
              <GuessInput onSubmit={handleSoloGuess} isRevealed={isRevealed} disabled={isLoading} />
            ) : onlineRoom && (
              (onlineRoom.role === 'guest' && hasSubmittedRoomGuess) ||
              (onlineRoom.role === 'host' && Boolean(playerGuesses[onlineRoom.playerId]))
            ) && !isRevealed ? (
              <div className="w-full max-w-5xl mx-auto bg-chess-panel border border-chess-panelBorder rounded-2xl p-8 text-center shadow-2xl">
                <h2 className="text-xl font-black text-white">Guess locked in</h2>
                <p className="mt-2 text-sm text-neutral-400">Waiting for the other players to submit their guesses…</p>
              </div>
            ) : isRevealed && evaluations ? (
              <MultiplayerResultModal
                game={currentGame}
                evaluations={evaluations}
                players={matchConfig.players}
                currentRound={currentRound}
                totalRounds={matchConfig.totalRounds}
                onNextRound={() => {
                  if (onlineRoom?.role !== 'guest') handleNextRound();
                }}
                isMatchOver={isMatchOver}
                onRestartMatch={() => {
                  if (onlineRoom?.role !== 'guest') handleRestartMatch();
                }}
                instantWinner={instantWinner}
                isOnlineGuest={onlineRoom?.role === 'guest'}
              />
            ) : (
              <DualGuessInput
                onSubmitPlayerGuess={handlePlayerGuessSubmit}
                activePlayer={activePlayer}
                totalPlayersInRound={matchConfig.players.length}
                currentTurnIndex={currentTurnPlayerIndex}
                isRevealed={isRevealed}
                isOnline={onlineRoom !== null}
                isMultiplayerMode={matchConfig.mode === 'multiplayer'}
                disabled={isLoading}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-chess-panel border-t border-chess-panelBorder py-4 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Guess The Elo • Singleplayer & Multiplayer</span>
          <span>{matchConfig.mode === 'solo' ? 'Solo: +7 exact | +3 within 100 of average' : 'Multiplayer: &le;10 (+7) | &le;25 (+5) | &le;100 (+3) • Instant Win ⚡'}</span>
        </div>
      </footer>

      {/* Modals */}
      {isMatchSetupOpen && <MatchSetupModal
        isOpen={isMatchSetupOpen}
        onClose={() => setIsMatchSetupOpen(false)}
        onStartMatch={handleStartMatch}
        currentConfig={matchConfig}
      />}

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
