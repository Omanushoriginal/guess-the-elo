import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Info,
  Swords,
  Layers
} from 'lucide-react';
import type { ChessGame, MoveHistoryItem } from '../types/chess';
import { soundFx } from '../services/soundEffects';

interface ChessBoardViewerProps {
  game: ChessGame;
  isRevealed: boolean;
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

export const ChessBoardViewer: React.FC<ChessBoardViewerProps> = ({
  game,
  isRevealed
}) => {
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per move
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const moveListRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLButtonElement>(null);

  // Parse game moves and FEN positions
  const { moveHistory, fens } = useMemo(() => {
    const chess = new Chess();
    const history: MoveHistoryItem[] = [];
    const positions: string[] = [chess.fen()];

    try {
      // Load PGN
      chess.loadPgn(game.pgn);
      const moves = chess.history({ verbose: true });
      
      const tempChess = new Chess();
      moves.forEach((m, idx) => {
        const moveRes = tempChess.move(m);
        if (moveRes) {
          positions.push(tempChess.fen());
          history.push({
            san: moveRes.san,
            from: moveRes.from,
            to: moveRes.to,
            fen: tempChess.fen(),
            captured: moveRes.captured,
            color: moveRes.color,
            moveNumber: Math.floor(idx / 2) + 1
          });
        }
      });
    } catch (err) {
      console.warn('Failed to parse PGN with verbose history, fallback to manual parse:', err);
    }

    return { moveHistory: history, fens: positions };
  }, [game.pgn]);

  // Reset when game changes
  useEffect(() => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  }, [game.id]);

  // Current FEN
  const currentFen = fens[currentMoveIndex] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // Calculate material difference and captured pieces
  const { whiteCaptured, blackCaptured, materialAdvantage } = useMemo(() => {
    const defaultPieces = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentCounts: Record<'w' | 'b', Record<string, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    // Parse piece placement from current FEN
    const boardPart = currentFen.split(' ')[0];
    for (const char of boardPart) {
      if ('pnbrqk'.includes(char.toLowerCase()) && char.toLowerCase() !== 'k') {
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase();
        currentCounts[color][type] = (currentCounts[color][type] || 0) + 1;
      }
    }

    const wCaptured: string[] = [];
    const bCaptured: string[] = [];
    let wMat = 0;
    let bMat = 0;

    // Pieces black has lost (white captured them)
    Object.entries(defaultPieces).forEach(([piece, total]) => {
      const lostByBlack = Math.max(0, total - (currentCounts.b[piece] || 0));
      for (let i = 0; i < lostByBlack; i++) wCaptured.push(piece);
      bMat += (currentCounts.b[piece] || 0) * PIECE_VALUES[piece];
    });

    // Pieces white has lost (black captured them)
    Object.entries(defaultPieces).forEach(([piece, total]) => {
      const lostByWhite = Math.max(0, total - (currentCounts.w[piece] || 0));
      for (let i = 0; i < lostByWhite; i++) bCaptured.push(piece.toUpperCase());
      wMat += (currentCounts.w[piece] || 0) * PIECE_VALUES[piece];
    });

    return {
      whiteCaptured: wCaptured,
      blackCaptured: bCaptured,
      materialAdvantage: wMat - bMat
    };
  }, [currentFen]);

  // Handle move navigation
  const goToMove = useCallback((index: number, playSound: boolean = true) => {
    const boundedIndex = Math.max(0, Math.min(index, fens.length - 1));
    if (boundedIndex === currentMoveIndex) return;

    if (playSound && soundEnabled) {
      if (boundedIndex > currentMoveIndex) {
        const moveItem = moveHistory[boundedIndex - 1];
        if (moveItem?.captured) {
          soundFx.playCapture();
        } else if (moveItem?.san.includes('+') || moveItem?.san.includes('#')) {
          soundFx.playCheck();
        } else {
          soundFx.playMove();
        }
      } else {
        soundFx.playMove();
      }
    }

    setCurrentMoveIndex(boundedIndex);
  }, [currentMoveIndex, fens.length, moveHistory, soundEnabled]);

  // Auto-play timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentMoveIndex((prev) => {
          if (prev >= fens.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          const moveItem = moveHistory[next - 1];
          if (soundEnabled && moveItem) {
            if (moveItem.captured) soundFx.playCapture();
            else if (moveItem.san.includes('+') || moveItem.san.includes('#')) soundFx.playCheck();
            else soundFx.playMove();
          }
          return next;
        });
      }, playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, fens.length, moveHistory, soundEnabled]);

  // Scroll active move into view in move list
  useEffect(() => {
    if (activeMoveRef.current && moveListRef.current) {
      activeMoveRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentMoveIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        goToMove(currentMoveIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToMove(currentMoveIndex + 1);
      } else if (e.key === 'ArrowUp') {
        goToMove(0);
      } else if (e.key === 'ArrowDown') {
        goToMove(fens.length - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key.toLowerCase() === 'f') {
        setBoardOrientation(o => (o === 'white' ? 'black' : 'white'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMoveIndex, fens.length, goToMove]);

  // Render piece icon character
  const getPieceSymbol = (pieceChar: string) => {
    const map: Record<string, string> = {
      p: '♟', n: '♞', b: '♝', r: '♜', q: '♛',
      P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕'
    };
    return map[pieceChar] || pieceChar;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start w-full max-w-6xl mx-auto">
      {/* Left side: Chess Board and Direct Controls */}
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Top Player Bar */}
        <div className="w-full max-w-[520px] flex items-center justify-between px-3 py-2 bg-chess-panel rounded-t-xl border border-chess-panelBorder border-b-0 shadow-md">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full border ${boardOrientation === 'white' ? 'bg-neutral-800 border-neutral-600' : 'bg-white border-neutral-300'}`} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-200">
                {boardOrientation === 'white' 
                  ? (isRevealed ? game.black.username : 'Black Player (Rating Hidden 🔒)') 
                  : (isRevealed ? game.white.username : 'White Player (Rating Hidden 🔒)')}
              </span>
              {isRevealed && (
                <span className="text-xs text-amber-400 font-mono">
                  {boardOrientation === 'white' ? `${game.black.rating} Elo` : `${game.white.rating} Elo`}
                </span>
              )}
            </div>
          </div>

          {/* Captured pieces for top player */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center tracking-tighter text-base text-neutral-400">
              {(boardOrientation === 'white' ? blackCaptured : whiteCaptured).map((p, idx) => (
                <span key={idx} className="opacity-90">{getPieceSymbol(p)}</span>
              ))}
            </div>
            {boardOrientation === 'white' && materialAdvantage < 0 && (
              <span className="bg-neutral-700/80 text-white font-mono px-1.5 py-0.5 rounded text-[11px] font-bold">
                +{Math.abs(materialAdvantage)}
              </span>
            )}
            {boardOrientation === 'black' && materialAdvantage > 0 && (
              <span className="bg-neutral-700/80 text-white font-mono px-1.5 py-0.5 rounded text-[11px] font-bold">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>

        {/* Board Container */}
        <div className="w-full max-w-[520px] aspect-square rounded-none overflow-hidden shadow-2xl relative border-x border-chess-panelBorder bg-chess-panel">
          <Chessboard
            options={{
              position: currentFen,
              boardOrientation: boardOrientation,
              allowDragging: false,
              animationDurationInMs: 150,
              darkSquareStyle: { backgroundColor: '#779952' },
              lightSquareStyle: { backgroundColor: '#edeed1' },
            }}
          />
        </div>

        {/* Bottom Player Bar */}
        <div className="w-full max-w-[520px] flex items-center justify-between px-3 py-2 bg-chess-panel rounded-b-xl border border-chess-panelBorder border-t-0 shadow-md">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full border ${boardOrientation === 'white' ? 'bg-white border-neutral-300' : 'bg-neutral-800 border-neutral-600'}`} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-200">
                {boardOrientation === 'white' 
                  ? (isRevealed ? game.white.username : 'White Player (Rating Hidden 🔒)') 
                  : (isRevealed ? game.black.username : 'Black Player (Rating Hidden 🔒)')}
              </span>
              {isRevealed && (
                <span className="text-xs text-amber-400 font-mono">
                  {boardOrientation === 'white' ? `${game.white.rating} Elo` : `${game.black.rating} Elo`}
                </span>
              )}
            </div>
          </div>

          {/* Captured pieces for bottom player */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center tracking-tighter text-base text-neutral-400">
              {(boardOrientation === 'white' ? whiteCaptured : blackCaptured).map((p, idx) => (
                <span key={idx} className="opacity-90">{getPieceSymbol(p)}</span>
              ))}
            </div>
            {boardOrientation === 'white' && materialAdvantage > 0 && (
              <span className="bg-neutral-700/80 text-white font-mono px-1.5 py-0.5 rounded text-[11px] font-bold">
                +{materialAdvantage}
              </span>
            )}
            {boardOrientation === 'black' && materialAdvantage < 0 && (
              <span className="bg-neutral-700/80 text-white font-mono px-1.5 py-0.5 rounded text-[11px] font-bold">
                +{Math.abs(materialAdvantage)}
              </span>
            )}
          </div>
        </div>

        {/* Board Navigation Controls */}
        <div className="w-full max-w-[520px] mt-3 flex items-center justify-between gap-1 bg-chess-panel p-2.5 rounded-xl border border-chess-panelBorder shadow-lg">
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToMove(0)}
              disabled={currentMoveIndex === 0}
              className="p-2 text-neutral-400 hover:text-white hover:bg-chess-panelLight disabled:opacity-30 rounded-lg transition-colors"
              title="First move (Up Arrow)"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToMove(currentMoveIndex - 1)}
              disabled={currentMoveIndex === 0}
              className="p-2 text-neutral-400 hover:text-white hover:bg-chess-panelLight disabled:opacity-30 rounded-lg transition-colors"
              title="Previous move (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-2 font-medium rounded-lg flex items-center gap-1.5 text-xs transition-colors ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-chess-accent text-white hover:bg-chess-accentHover shadow-sm'
              }`}
              title="Auto-play (Space)"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => goToMove(currentMoveIndex + 1)}
              disabled={currentMoveIndex >= fens.length - 1}
              className="p-2 text-neutral-400 hover:text-white hover:bg-chess-panelLight disabled:opacity-30 rounded-lg transition-colors"
              title="Next move (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => goToMove(fens.length - 1)}
              disabled={currentMoveIndex >= fens.length - 1}
              className="p-2 text-neutral-400 hover:text-white hover:bg-chess-panelLight disabled:opacity-30 rounded-lg transition-colors"
              title="Last move (Down Arrow)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Speed selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-chess-panelLight text-neutral-300 text-xs px-2 py-1.5 rounded-lg border border-chess-panelBorder focus:outline-none focus:border-chess-accent cursor-pointer"
              title="Playback speed"
            >
              <option value={1500}>0.7x</option>
              <option value={1000}>1.0x</option>
              <option value={500}>2.0x</option>
              <option value={250}>4.0x</option>
            </select>

            {/* Flip Board */}
            <button
              onClick={() => setBoardOrientation(o => (o === 'white' ? 'black' : 'white'))}
              className="p-2 text-neutral-400 hover:text-white hover:bg-chess-panelLight rounded-lg transition-colors"
              title="Flip board (F)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Sound toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundFx.enabled = next;
              }}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled ? 'text-neutral-400 hover:text-white hover:bg-chess-panelLight' : 'text-red-400 bg-red-500/10'
              }`}
              title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Move progress bar */}
        <div className="w-full max-w-[520px] mt-2 px-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, fens.length - 1)}
            value={currentMoveIndex}
            onChange={(e) => goToMove(Number(e.target.value))}
            className="w-full accent-chess-accent h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Right side: Game Move List & Meta Info */}
      <div className="w-full lg:w-80 flex flex-col gap-3">
        {/* Game Meta Header Card */}
        <div className="bg-chess-panel p-4 rounded-xl border border-chess-panelBorder shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <Swords className="w-4 h-4 text-chess-accent" />
              <span>Game Details</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-chess-panelLight text-neutral-300 border border-chess-panelBorder uppercase">
              {game.timeClass} • {game.timeControl}
            </span>
          </div>

          <div className="text-xs text-neutral-400 space-y-1">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="text-neutral-200 font-mono">{game.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Moves:</span>
              <span className="text-neutral-200 font-mono">{moveHistory.length} ply ({Math.ceil(moveHistory.length / 2)} moves)</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-neutral-200 capitalize">{isRevealed ? `${game.white.result} / ${game.black.result}` : 'Rating Hidden 🔒'}</span>
            </div>
          </div>
        </div>

        {/* Move History Table */}
        <div className="bg-chess-panel rounded-xl border border-chess-panelBorder shadow-lg flex flex-col h-[340px] overflow-hidden">
          <div className="px-3 py-2 bg-chess-panelLight border-b border-chess-panelBorder flex items-center justify-between text-xs font-medium text-neutral-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              Move History
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {currentMoveIndex} / {fens.length - 1}
            </span>
          </div>

          <div 
            ref={moveListRef}
            className="flex-1 overflow-y-auto p-1 font-mono text-xs space-y-0.5"
          >
            {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, movePairIdx) => {
              const moveNum = movePairIdx + 1;
              const whiteMove = moveHistory[movePairIdx * 2];
              const blackMove = moveHistory[movePairIdx * 2 + 1];

              const isWhiteCurrent = currentMoveIndex === movePairIdx * 2 + 1;
              const isBlackCurrent = currentMoveIndex === movePairIdx * 2 + 2;

              return (
                <div 
                  key={moveNum}
                  className="flex items-center rounded hover:bg-chess-panelLight/60 transition-colors py-0.5 px-2"
                >
                  <span className="w-8 text-neutral-500 select-none text-[11px]">
                    {moveNum}.
                  </span>

                  {/* White Move */}
                  {whiteMove && (
                    <button
                      ref={isWhiteCurrent ? activeMoveRef : null}
                      onClick={() => goToMove(movePairIdx * 2 + 1)}
                      className={`flex-1 text-left px-2 py-0.5 rounded transition-all ${
                        isWhiteCurrent
                          ? 'bg-chess-accent text-white font-bold shadow-sm'
                          : 'text-neutral-200 hover:text-white hover:bg-chess-panelLight'
                      }`}
                    >
                      {whiteMove.san}
                    </button>
                  )}

                  {/* Black Move */}
                  {blackMove ? (
                    <button
                      ref={isBlackCurrent ? activeMoveRef : null}
                      onClick={() => goToMove(movePairIdx * 2 + 2)}
                      className={`flex-1 text-left px-2 py-0.5 rounded transition-all ${
                        isBlackCurrent
                          ? 'bg-chess-accent text-white font-bold shadow-sm'
                          : 'text-neutral-200 hover:text-white hover:bg-chess-panelLight'
                      }`}
                    >
                      {blackMove.san}
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chess-panel/80 border border-chess-panelBorder/70 text-[11px] text-neutral-400">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Use keyboard <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">←</kbd> <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">→</kbd> to step moves, <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">Space</kbd> for auto-play.</span>
        </div>
      </div>
    </div>
  );
};
