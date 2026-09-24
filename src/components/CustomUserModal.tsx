import React, { useState } from 'react';
import { X, User, Search, AlertCircle } from 'lucide-react';

interface CustomUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (username: string) => void;
  isLoading: boolean;
}

const POPULAR_USERS = [
  { name: 'Hikaru', rating: '3200+ (Super GM)' },
  { name: 'MagnusCarlsen', rating: '3200+ (World Champion)' },
  { name: 'GothamChess', rating: '2300+ (IM Levy Rozman)' },
  { name: 'DanielNaroditsky', rating: '3000+ (GM Danya)' },
  { name: 'EricRosen', rating: '2400+ (IM Eric Rosen)' },
  { name: 'AnnaCramling', rating: '2000+ (WFM Anna)' },
  { name: 'Botez', rating: '2000+ (Alexandra Botez)' },
  { name: 'NihalSarin2004', rating: '3100+ (Super GM)' }
];

export const CustomUserModal: React.FC<CustomUserModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  isLoading
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setError('Please enter a Chess.com username');
      return;
    }
    setError(null);
    onSelectUser(usernameInput.trim());
  };

  const handleSelectPreset = (user: string) => {
    setError(null);
    onSelectUser(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-chess-panel border border-chess-panelBorder rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-chess-panelLight transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <User className="w-6 h-6 text-chess-accent" />
          <h2 className="text-xl font-bold text-white">Load Games by Player</h2>
        </div>

        <p className="text-xs text-neutral-400 mb-4">
          Enter any public Chess.com username to fetch real random games from their archives.
        </p>

        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. Hikaru, GothamChess, or your username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-chess-panelLight border border-chess-panelBorder text-white text-sm rounded-xl px-3.5 py-2.5 pl-9 focus:outline-none focus:border-chess-accent"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-chess-accent hover:bg-chess-accentHover text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Fetch'}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-1 text-xs text-rose-400 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="pt-2 border-t border-chess-panelBorder">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Featured Streamers & Masters:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_USERS.map((u) => (
              <button
                key={u.name}
                type="button"
                onClick={() => handleSelectPreset(u.name)}
                disabled={isLoading}
                className="text-left p-2 rounded-lg bg-chess-panelLight hover:bg-neutral-700/60 border border-chess-panelBorder transition-colors flex flex-col group disabled:opacity-50"
              >
                <span className="text-xs font-bold text-neutral-200 group-hover:text-chess-accent transition-colors">
                  {u.name}
                </span>
                <span className="text-[10px] text-neutral-400">{u.rating}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
