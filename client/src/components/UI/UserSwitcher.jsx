import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Avatar from './Avatar';

const UserSwitcher = () => {
  const { user, switchUser, savedAccounts, removeSavedAccount, clearSavedAccounts } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (account) => {
    if (account._id === user?._id) return;
    const saved = savedAccounts.find((a) => a._id === account._id);
    if (saved) {
      switchUser(saved.token, saved);
    }
    setIsOpen(false);
  };

  const handleRemove = (e, accountId) => {
    e.stopPropagation();
    removeSavedAccount(accountId);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        id="user-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
        title="Switch Account"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 top-full mt-3 w-72 rounded-3xl glass-panel shadow-2xl border border-white/10 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Saved Sessions
                </p>
                <p className="text-[10px] text-slate-400">
                  Switch account on this browser
                </p>
              </div>
              {savedAccounts.length > 0 && (
                <button
                  onClick={clearSavedAccounts}
                  className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline transition-all"
                  title="Clear all saved sessions"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
              {savedAccounts.length === 0 ? (
                <p className="px-4 py-4 text-xs text-center text-slate-400">
                  No saved sessions on this device.
                </p>
              ) : (
                savedAccounts.map((account) => (
                  <div
                    key={account._id}
                    onClick={() => handleSwitch(account)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer group ${
                      account._id === user?._id
                        ? 'glass-card border border-pink-500/30 text-white'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <Avatar username={account.username} avatar={account.avatar} size="sm" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-bold truncate text-white">{account.username}</p>
                      <p className="text-[10px] text-slate-400 truncate">{account.email}</p>
                    </div>
                    {account._id === user?._id ? (
                      <span className="text-[9px] font-extrabold gradient-accent text-white px-2 py-0.5 rounded-full uppercase">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleRemove(e, account._id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove this account"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSwitcher;
