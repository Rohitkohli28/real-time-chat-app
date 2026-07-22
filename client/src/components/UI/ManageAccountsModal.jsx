import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from './Avatar';

const ManageAccountsModal = ({ isOpen, onClose }) => {
  const { user, savedAccounts, removeSavedAccount, clearSavedAccounts } = useAuth();

  if (!isOpen) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden glass-panel"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Manage Remembered Accounts</h2>
              <p className="text-xs text-slate-400">Accounts remembered on this browser device</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Remembered accounts allow quick selection. Password re-verification is required to switch accounts, ensuring nobody else on this device can access your messages.
            </p>
          </div>

          {/* Accounts List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {savedAccounts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No accounts are remembered on this device.
              </div>
            ) : (
              savedAccounts.map((account) => (
                <div
                  key={account._id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    account._id === user?._id
                      ? 'bg-pink-500/10 border-pink-500/30 text-white'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar username={account.username} avatar={account.avatar} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{account.username}</span>
                        {account._id === user?._id && (
                          <span className="text-[9px] font-extrabold gradient-accent text-white px-2 py-0.5 rounded-full uppercase">
                            Current Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{account.email}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Last active: {formatDate(account.lastActive)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeSavedAccount(account._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all border border-transparent hover:border-rose-500/30"
                    title="Remove from this device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            {savedAccounts.length > 0 ? (
              <button
                onClick={clearSavedAccounts}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Forget All Accounts on Device</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-all"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManageAccountsModal;
