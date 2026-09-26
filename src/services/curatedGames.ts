import type { ChessGame } from '../types/chess';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const CURATED_GAMES: ChessGame[] = [
  {
    id: 'game-beginner-1',
    white: { username: 'Woodpusher99', rating: 480, result: 'checkmated' },
    black: { username: 'KnightRider07', rating: 520, result: 'win' },
    averageRating: 500,
    timeControl: '600',
    timeClass: 'rapid',
    url: 'https://www.chess.com/game/live/1',
    date: '2024-03-15',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.03.15"]
[White "Woodpusher99"]
[Black "KnightRider07"]
[Result "0-1"]
[WhiteElo "480"]
[BlackElo "520"]
[TimeControl "600"]

1. e4 e5 2. Qh5 Nc6 3. Bc4 g6 4. Qf3 Nf6 5. g4 Nd4 6. Qd1 d5 7. exd5 Bxg4 8. f3 Bf5 9. d3 Nxd5 10. c3 Qh4+ 11. Kf1 Bh3+ 12. Nxh3 Qxh3+ 13. Kf2 Be7 14. cxd4 Bh4+ 15. Kg1 Nf4 16. Bxf4 exf4 17. Qe2+ Kd7 18. Bxf7 Rae8 19. Bxe8+ Rxe8 20. Qd2 Re1+ 21. Qxe1 Bxe1 0-1`
  },
  {
    id: 'game-intermediate-1',
    white: { username: 'TacticsGuru', rating: 1120, result: 'win' },
    black: { username: 'PawnStormer', rating: 1180, result: 'resigned' },
    averageRating: 1150,
    timeControl: '300+2',
    timeClass: 'blitz',
    url: 'https://www.chess.com/game/live/2',
    date: '2024-04-10',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.04.10"]
[White "TacticsGuru"]
[Black "PawnStormer"]
[Result "1-0"]
[WhiteElo "1120"]
[BlackElo "1180"]
[TimeControl "300+2"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. e5 dxe5 11. fxe5 Nfd7 12. Ne4 h6 13. Bh4 Qxa2 14. Rd1 Qd5 15. Qe3 Qxe5 16. Be2 Bc5 17. Bg3 Bxd4 18. Rxd4 Qa5+ 19. Rd2 O-O 20. Bd6 Rd8 21. Qg3 Nc6 22. Bc7 Qa1+ 23. Rd1 Qa4 24. Nd6 Rf8 25. O-O Nde5 26. Rf4 Qxc2 27. Re1 Ng6 28. Rg4 e5 29. Bd3 Qc5+ 30. Kh1 Bxg4 31. Qxg4 Nd4 32. Nxf7 Rxf7 33. Qxg6 Qxc7 34. Qh7+ Kf8 35. Qh8+ Ke7 36. Qxa8 Rf8 37. Qa7 Nc6 38. Qc5+ Qd6 39. Qe3 Rd8 40. Be4 Qd2 41. Qg3 Qg5 42. Qa3+ Rd6 43. Rd1 Qf6 44. Bf3 Nd4 45. Bxb7 Nb5 46. Qc5 Qe6 47. Bxa6 Nd4 48. Bc4 Qf6 49. Re1 Nc6 50. Bb5 Kd8 51. Bxc6 Rxc6 52. Rd1+ Kc8 53. Qa7 Rd6 54. Rc1+ Kd8 55. Qc7+ Ke8 56. Ra1 Rd8 57. h3 e4 58. Re1 Rd4 59. Rb1 Rd7 60. Qc4 Qf5 61. Re1 Re7 62. Qg8+ Kd7 63. Rd1+ Kc6 64. Qc4+ Qc5 65. Qa6+ Kc7 66. Rb1 Kd8 67. Qa8+ Kd7 68. Rb7+ Ke6 69. Qg8+ Kf6 70. Qf8+ Ke6 71. Qg8+ Kf6 72. Qf8+ Ke6 73. Rb1 Qc7 74. Qg8+ Ke5 75. Rd1 Rd7 76. Qe8+ Re7 77. Qh5+ g5 78. Qxh6 Kf5 79. Rf1+ Ke5 80. Qxg5+ Kd4 81. Rd1+ Kc3 82. Rc1+ 1-0`
  },
  {
    id: 'game-intermediate-2',
    white: { username: 'CheckmateArtist', rating: 1540, result: 'win' },
    black: { username: 'EndgameWizard', rating: 1580, result: 'resigned' },
    averageRating: 1560,
    timeControl: '180',
    timeClass: 'blitz',
    url: 'https://www.chess.com/game/live/3',
    date: '2024-05-02',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.05.02"]
[White "CheckmateArtist"]
[Black "EndgameWizard"]
[Result "1-0"]
[WhiteElo "1540"]
[BlackElo "1580"]
[TimeControl "180"]

1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Be7 5. Bg5 O-O 6. e3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5 10. Bxe7 Qxe7 11. O-O Nxc3 12. Rxc3 e5 13. Qc2 exd4 14. exd4 Nb6 15. Re1 Qf6 16. Bd3 h6 17. Ne5 Be6 18. Be4 Rad8 19. Rf3 Qg5 20. Rg3 Qf6 21. Qd2 Rd6 22. Bb1 Bf5 23. Rf3 g6 24. Qxh6 Rxd4 25. Bxf5 Qxe5 26. Rfe3 Qxf5 27. Rh3 Qxh3 28. Qxh3 Nd5 29. Qb3 b5 30. g3 Rd8 31. h4 a5 32. Qf3 Kg7 33. h5 Rd6 34. Re8 gxh5 35. Qxh5 Rh6 36. Qe5+ 1-0`
  },
  {
    id: 'game-advanced-1',
    white: { username: 'FischerFan99', rating: 1980, result: 'win' },
    black: { username: 'AlekhineGun', rating: 2020, result: 'resigned' },
    averageRating: 2000,
    timeControl: '180+1',
    timeClass: 'blitz',
    url: 'https://www.chess.com/game/live/4',
    date: '2024-06-18',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.06.18"]
[White "FischerFan99"]
[Black "AlekhineGun"]
[Result "1-0"]
[WhiteElo "1980"]
[BlackElo "2020"]
[TimeControl "180+1"]

1. e4 c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 e5 6. Ndb5 d6 7. Bg5 a6 8. Na3 b5 9. Nd5 Be7 10. Bxf6 Bxf6 11. c3 Bg5 12. Nc2 O-O 13. a4 bxa4 14. Rxa4 a5 15. Bc4 Rb8 16. b3 Kh8 17. O-O f5 18. exf5 Bxf5 19. Nce3 Bg6 20. Bd3 Bf7 21. Be4 Qd7 22. Qd3 g6 23. b4 axb4 24. cxb4 Nd4 25. Rfa1 Bxe3 26. fxe3 Bxd5 27. Bxd5 Qb5 28. Qxb5 Nxb5 29. Ra8 Nc3 30. Rxb8 Rxb8 31. Ra8 Rxa8 32. Bxa8 Kg7 33. Bc6 Kf6 34. Kf2 d5 35. b5 Ke7 36. b6 Kd6 37. b7 Kc7 38. h4 Ne4+ 39. Kf3 Nd2+ 40. Ke2 Nc4 41. Bxd5 Na5 42. Bg8 h6 43. Kf3 Nxb7 44. Ke4 Kd6 45. Bf7 Nc5+ 46. Kf3 g5 47. hxg5 hxg5 48. Kg4 Ke7 49. Bd5 Kf6 50. g3 Nd3 51. e4 Nc5 52. Kf3 Nd7 53. Ke3 Ke7 54. Kf3 Nf6 55. Bb7 Kd6 56. Bc8 Kc5 57. Bf5 Kd4 58. g4 Kd3 59. Bg6 Kd2 60. Bf5 Ke1 61. Bg6 Kf1 62. Bf5 Kg1 63. Bg6 Kh2 64. Bf5 Kh3 65. Bc8 Kh4 66. Bf5 Ne8 67. Bg6 Nd6 68. Bf5 Nc4 69. Bc8 Nd2+ 70. Ke3 Nf1+ 71. Kf2 Nh2 72. Kg2 Nxg4 73. Kf3 Nf6 74. Bf5 g4+ 75. Kg2 Nh5 76. Bc8 Nf4+ 77. Kf2 g3+ 78. Kf3 g2 79. Kf2 Kg5 80. Bd7 Kf6 81. Bc8 Ke7 82. Bf5 Kd6 83. Bc8 Kc5 84. Bf5 Kd4 85. Bh7 Kd3 86. Bf5 Kd2 87. Bh7 Kd1 88. Bf5 Kd2 89. Bh7 Kd3 90. Bf5 Kd4 91. Bh7 Nh3+ 92. Kxg2 Ng5 93. Bf5 Nxe4 94. Kf3 Nc3 95. Kf2 e4 96. Bxe4 Nxe4+ 1-0`
  },
  {
    id: 'game-master-1',
    white: { username: 'Hikaru', rating: 3240, result: 'win', title: 'GM' },
    black: { username: 'DanielNaroditsky', rating: 3110, result: 'resigned', title: 'GM' },
    averageRating: 3175,
    timeControl: '180',
    timeClass: 'blitz',
    url: 'https://www.chess.com/game/live/5',
    date: '2024-07-20',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.07.20"]
[White "Hikaru"]
[Black "DanielNaroditsky"]
[Result "1-0"]
[WhiteElo "3240"]
[BlackElo "3110"]
[TimeControl "180"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. h3 e5 7. Nde2 h5 8. g3 Be6 9. Bg2 Nbd7 10. a4 Be7 11. a5 Rc8 12. Be3 Qc7 13. O-O O-O 14. f4 Rfe8 15. Rf2 Bc4 16. f5 b5 17. axb6 Nxb6 18. Nc1 d5 19. exd5 Bc5 20. Bxc5 Qxc5 21. Nb3 Bxb3 22. cxb3 e4 23. Rxa6 Nbxd5 24. Nxd5 Nxd5 25. b4 Nxb4 26. Rd6 Nd3 27. Rxd3 exd3 28. Qxd3 Re1+ 29. Bf1 Rb8 30. Qd2 Re3 31. Kh2 Qe5 32. Rg2 h4 33. Qf2 Rbb3 34. Bc4 hxg3+ 35. Rxg3 Rxg3 1-0`
  },
  {
    id: 'game-beginner-2',
    white: { username: 'ChessNewbie', rating: 710, result: 'resigned' },
    black: { username: 'RookMaster77', rating: 690, result: 'win' },
    averageRating: 700,
    timeControl: '600',
    timeClass: 'rapid',
    url: 'https://www.chess.com/game/live/6',
    date: '2024-02-11',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.02.11"]
[White "ChessNewbie"]
[Black "RookMaster77"]
[Result "0-1"]
[WhiteElo "710"]
[BlackElo "690"]
[TimeControl "600"]

1. d4 d5 2. Nf3 Nc6 3. Bf4 Bg4 4. Nbd2 Nf6 5. e3 e6 6. c3 Bd6 7. Bg3 O-O 8. Bd3 Re8 9. Qc2 h6 10. Ne5 Bxe5 11. dxe5 Nd7 12. f4 Nc5 13. O-O Nxd3 14. Qxd3 Bf5 15. Qe2 Ne7 16. Rad1 c5 17. e4 dxe4 18. Nxe4 Qb6 19. Nd6 Red8 20. Bf2 Qc6 21. g4 Bh7 22. Bh4 Rd7 23. f5 exf5 24. gxf5 Nd5 25. Qe4 Ne7 26. Qc4 Rf8 27. Bxe7 Rxe7 28. Rde1 a6 29. Qg4 f6 30. exf6 Rxf6 31. Rxe7 0-1`
  },
  {
    id: 'game-gm-magnus',
    white: { username: 'MagnusCarlsen', rating: 3290, result: 'win', title: 'GM' },
    black: { username: 'Firouzja2003', rating: 3180, result: 'resigned', title: 'GM' },
    averageRating: 3235,
    timeControl: '180',
    timeClass: 'blitz',
    url: 'https://www.chess.com/game/live/7',
    date: '2024-08-01',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Speed Chess Championship"]
[Site "Chess.com"]
[Date "2024.08.01"]
[White "MagnusCarlsen"]
[Black "Firouzja2003"]
[Result "1-0"]
[WhiteElo "3290"]
[BlackElo "3180"]
[TimeControl "180"]

1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Nc3 Bb4 5. Qa4+ Nc6 6. e3 O-O 7. Bd2 dxc4 8. Bxc4 Bd6 9. O-O e5 10. h3 a6 11. Qc2 h6 12. a3 exd4 13. exd4 Ne7 14. Rfe1 Bf5 15. Qb3 b5 16. Bf1 Be6 17. Rxe6 fxe6 18. Qxe6+ Kh8 19. Ne5 Qe8 20. Re1 Rd8 21. Bd3 Bxe5 22. Qxe5 Nc6 23. Qxc7 Qd7 24. Qg3 Qxd4 25. Re3 Rfe8 26. Rf3 Ne5 27. Rxf6 Qxd3 28. Be3 gxf6 29. Qh4 Qg6 1-0`
  },
  {
    id: 'game-intermediate-3',
    white: { username: 'BishopPairEnjoyer', rating: 1340, result: 'win' },
    black: { username: 'KnightOutpost', rating: 1390, result: 'checkmated' },
    averageRating: 1365,
    timeControl: '600',
    timeClass: 'rapid',
    url: 'https://www.chess.com/game/live/8',
    date: '2024-01-20',
    rated: true,
    rules: 'chess',
    fen: START_FEN,
    pgn: `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.20"]
[White "BishopPairEnjoyer"]
[Black "KnightOutpost"]
[Result "1-0"]
[WhiteElo "1340"]
[BlackElo "1390"]
[TimeControl "600"]

1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Qb6 7. Nc3 Qxb2 8. Qb1 Qxb1+ 9. Rxb1 c4 10. Rxb7 Nc6 11. Kd2 Bb4 12. Rb1 a5 13. a3 Bxa3 14. Nb5 Bb4+ 15. Rxb4 axb4 16. Nc7+ Kd8 17. Nxa8 Nge7 18. Bg5 Kc8 19. Rc7+ Kb8 20. Bxe7 Kxa8 21. Rxc6 b3 22. cxb3 cxb3 23. Kc3 Rb8 24. Ra6+ Kb7 25. Kxb3 Kc8+ 26. Kc3 Kd7 27. Bd6 Rc8+ 28. Bc5 1-0`
  }
];
