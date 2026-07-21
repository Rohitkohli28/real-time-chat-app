import { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import Avatar from './Avatar';

const UserSwitcher = () => {
  const { user, switchUser, savedAccounts } = useAuth();
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
            className="absolute right-0 top-full mt-3 w-64 rounded-3xl glass-panel shadow-2xl border border-white/10 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Switch Active Session
              </p>
              <p className="text-[10px] text-slate-400">
                Seamless multi-account switching
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
              {savedAccounts.length === 0 ? (
                <p className="px-4 py-4 text-xs text-center text-slate-400">
                  No other saved sessions found. Log in with another account to switch dynamically.
                </p>
              ) : (
                savedAccounts.map((account) => (
                  <button
                    key={account._id}
                    onClick={() => handleSwitch(account)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all ${
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
                    {account._id === user?._id && (
                      <span className="text-[9px] font-extrabold gradient-accent text-white px-2 py-0.5 rounded-full uppercase">
                        Active
                      </span>
                    )}
                  </button>
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
