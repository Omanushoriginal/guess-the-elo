export type TimeClass = 'bullet' | 'blitz' | 'rapid' | 'daily';

export interface PlayerInfo {
  username: string;
  rating: number;
  result: string;
  accuracy?: number;
  title?: string;
  avatar?: string;
}

export interface ChessGame {
  id: string;
  white: PlayerInfo;
  black: PlayerInfo;
  averageRating: number;
  timeControl: string;
  timeClass: TimeClass;
  url: string;
  pgn: string;
  fen: string;
  rated: boolean;
  rules: string;
  date: string;
  termination?: string;
}

export interface MoveHistoryItem {
  san: string;
  from: string;
  to: string;
  fen: string;
  captured?: string;
  color: 'w' | 'b';
  moveNumber: number;
}

export interface GuessEvaluation {
  guess: number;
  actualAverage: number;
  actualWhite: number;
  actualBlack: number;
  difference: number;
  pointsEarned: number;
  isExact: boolean;
  isWithin100: boolean;
  feedback: string;
}

export interface GameStats {
  totalScore: number;
  roundsPlayed: number;
  exactGuesses: number;
  within100Guesses: number;
  currentStreak: number;
  bestStreak: number;
  history: {
    gameId: string;
    white: PlayerInfo;
    black: PlayerInfo;
    guess: number;
    points: number;
    difference: number;
  }[];
}

export type RatingFilter = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'master' | 'gm';
