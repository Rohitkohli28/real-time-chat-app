import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from './Avatar';
import ManageAccountsModal from './ManageAccountsModal';
import PasswordVerifyModal from './PasswordVerifyModal';

const UserSwitcher = () => {
  const { user, switchUser, savedAccounts } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [targetAccountForSwitch, setTargetAccountForSwitch] = useState(null);
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

  const handleAccountClick = (account) => {
    if (account._id === user?._id) return;
    setTargetAccountForSwitch(account);
    setIsOpen(false);
  };

  const handleVerifyPasswordAndSwitch = async (targetUserId, password) => {
    await switchUser(targetUserId, password);
  };

  if (!user) return null;

  const otherAccounts = savedAccounts.filter((a) => a._id !== user._id);

  return (
    <>
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
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Switch Active Account</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Re-authentication required to switch
                </p>
              </div>

              {/* Active User Card */}
              <div className="p-2 border-b border-white/5">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl glass-card border border-pink-500/30">
                  <Avatar username={user.username} avatar={user.avatar} size="sm" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-bold truncate text-white">{user.username}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-[9px] font-extrabold gradient-accent text-white px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                </div>
              </div>

              {/* Other Remembered Accounts */}
              <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                {otherAccounts.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-center text-slate-400">
                    No other remembered accounts on this browser.
                  </p>
                ) : (
                  otherAccounts.map((account) => (
                    <button
                      key={account._id}
                      onClick={() => handleAccountClick(account)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all hover:bg-white/5 text-slate-300 text-left group"
                    >
                      <Avatar username={account.username} avatar={account.avatar} size="sm" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-bold truncate text-white">{account.username}</p>
                        <p className="text-[10px] text-slate-400 truncate">{account.email}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-300">
                        <Lock className="w-3 h-3" />
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer Option: Manage Accounts */}
              <div className="p-2 border-t border-white/10 bg-slate-950/40">
                <button
                  onClick={() => { setIsOpen(false); setIsManageOpen(true); }}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Manage Accounts on Device</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Password Re-authentication Modal */}
      <PasswordVerifyModal
        isOpen={!!targetAccountForSwitch}
        onClose={() => setTargetAccountForSwitch(null)}
        targetAccount={targetAccountForSwitch}
        onVerify={handleVerifyPasswordAndSwitch}
      />

      {/* Manage Accounts Modal */}
      <ManageAccountsModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
      />
    </>
  );
};

export default UserSwitcher;
