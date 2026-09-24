import type { ChessGame, PlayerInfo, RatingFilter } from '../types/chess';
import { CURATED_GAMES } from './curatedGames';

// Diverse player pools categorized by general rating brackets to guarantee varied games
const PLAYER_POOLS: Record<RatingFilter, string[]> = {
  all: [
    'hikaru', 'magnuscarlsen', 'nihalsarin2004', 'danielnaroditsky', 'danyasergeyev',
    'ericrosen', 'botez', 'annacramling', 'gothamchess', 'chessnerd',
    'woodpusher', 'pawnstormer', 'tactics_king', 'chessnoob123', 'rookie2023',
    'speeddemon_chess', 'blitz_master_99', 'endgame_lover', 'alexandrabotez'
  ],
  beginner: [
    'chessnoob123', 'rookie2023', 'pawnmover_001', 'beginner_tactics', 'firstmoves101', 'randomchesslover'
  ],
  intermediate: [
    'ericrosen', 'botez', 'annacramling', 'tactics_king', 'blitz_master_99', 'chessnerd', 'checkmate_hunter'
  ],
  advanced: [
    'gothamchess', 'danyasergeyev', 'cantyquant', 'nemsko', 'penguingm1', 'speeddemon_chess'
  ],
  master: [
    'nihalsarin2004', 'danielnaroditsky', 'firouzja2003', 'anishgiri', 'viditchess', 'alireza2003'
  ],
  gm: [
    'hikaru', 'magnuscarlsen', 'fabianocaruana', 'firouzja2003', 'lachesisq', 'duckchess'
  ]
};

// In-memory cache of games to avoid redundant API calls and respect rate limits
const gamesCache: ChessGame[] = [...CURATED_GAMES];
const usedGameIds = new Set<string>();

interface ChessComGameResponse {
  url: string;
  pgn?: string;
  time_control: string;
  time_class: string;
  rated: boolean;
  rules: string;
  white: {
    rating: number;
    result: string;
    username: string;
  };
  black: {
    rating: number;
    result: string;
    username: string;
  };
  end_time: number;
}

/**
 * Fetch a random game from Chess.com public API
 */
export async function fetchRandomChessComGame(filter: RatingFilter = 'all', specificUser?: string): Promise<ChessGame> {
  // If specific username requested
  if (specificUser && specificUser.trim().length > 0) {
    try {
      const userGames = await fetchGamesForUser(specificUser.trim().toLowerCase());
      if (userGames.length > 0) {
        const randomGame = userGames[Math.floor(Math.random() * userGames.length)];
        return randomGame;
      }
    } catch (err) {
      console.warn(`Failed to fetch custom games for ${specificUser}:`, err);
    }
  }

  // Try to fetch a dynamic game from Chess.com API
  const pool = PLAYER_POOLS[filter] || PLAYER_POOLS.all;
  const randomUser = pool[Math.floor(Math.random() * pool.length)];

  try {
    const liveGames = await fetchGamesForUser(randomUser);
    if (liveGames.length > 0) {
      // Find one not recently used if possible
      const freshGame = liveGames.find(g => !usedGameIds.has(g.id)) || liveGames[Math.floor(Math.random() * liveGames.length)];
      usedGameIds.add(freshGame.id);
      gamesCache.push(freshGame);
      return freshGame;
    }
  } catch (error) {
    console.warn(`Error fetching games from Chess.com for user ${randomUser}, using cached pool:`, error);
  }

  // Fallback: pick from cached pool matching filter
  const filtered = filter === 'all' 
    ? gamesCache 
    : gamesCache.filter(g => matchesFilter(g.averageRating, filter));

  const poolToUse = filtered.length > 0 ? filtered : gamesCache;
  const game = poolToUse[Math.floor(Math.random() * poolToUse.length)];
  return game;
}

/**
 * Fetch games for a specific Chess.com username
 */
export async function fetchGamesForUser(username: string): Promise<ChessGame[]> {
  const archivesUrl = `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`;
  
  const archivesRes = await fetch(archivesUrl, {
    headers: {
      'User-Agent': 'GuessTheEloApp/1.0 (contact: guess-the-elo@example.com)'
    }
  });

  if (!archivesRes.ok) {
    throw new Error(`Chess.com API returned ${archivesRes.status} for archives of ${username}`);
  }

  const archivesData = await archivesRes.json();
  const archives: string[] = archivesData.archives || [];

  if (archives.length === 0) {
    throw new Error(`No game archives found for ${username}`);
  }

  // Pick one of the recent monthly archives (from last 12 months or random available archive)
  const recentArchives = archives.slice(-12);
  const selectedArchiveUrl = recentArchives[Math.floor(Math.random() * recentArchives.length)];

  const gamesRes = await fetch(selectedArchiveUrl, {
    headers: {
      'User-Agent': 'GuessTheEloApp/1.0 (contact: guess-the-elo@example.com)'
    }
  });

  if (!gamesRes.ok) {
    throw new Error(`Chess.com API returned ${gamesRes.status} for monthly games`);
  }

  const gamesData = await gamesRes.json();
  const rawGames: ChessComGameResponse[] = gamesData.games || [];

  // Parse and filter valid standard games
  const validGames: ChessGame[] = [];

  for (const raw of rawGames) {
    if (
      raw.rules === 'chess' &&
      raw.pgn &&
      raw.white &&
      raw.black &&
      typeof raw.white.rating === 'number' &&
      typeof raw.black.rating === 'number' &&
      raw.white.rating > 0 &&
      raw.black.rating > 0
    ) {
      // Basic check to ensure game had at least 8 moves
      const moveCount = (raw.pgn.match(/\d+\./g) || []).length;
      if (moveCount >= 6) {
        const whiteInfo: PlayerInfo = {
          username: raw.white.username,
          rating: raw.white.rating,
          result: raw.white.result
        };
        const blackInfo: PlayerInfo = {
          username: raw.black.username,
          rating: raw.black.rating,
          result: raw.black.result
        };

        const averageRating = Math.round((whiteInfo.rating + blackInfo.rating) / 2);
        const gameId = raw.url ? raw.url.split('/').pop() || Math.random().toString() : Math.random().toString();

        validGames.push({
          id: gameId,
          white: whiteInfo,
          black: blackInfo,
          averageRating,
          timeControl: raw.time_control || 'unknown',
          timeClass: (raw.time_class as any) || 'blitz',
          url: raw.url,
          pgn: raw.pgn,
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          rated: raw.rated ?? true,
          rules: raw.rules || 'chess',
          date: new Date(raw.end_time * 1000).toISOString().split('T')[0]
        });
      }
    }
  }

  return validGames;
}

function matchesFilter(rating: number, filter: RatingFilter): boolean {
  switch (filter) {
    case 'beginner': return rating < 1000;
    case 'intermediate': return rating >= 1000 && rating < 1600;
    case 'advanced': return rating >= 1600 && rating < 2100;
    case 'master': return rating >= 2100 && rating < 2600;
    case 'gm': return rating >= 2600;
    default: return true;
  }
}
