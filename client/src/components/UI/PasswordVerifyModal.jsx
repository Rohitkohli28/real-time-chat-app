import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Avatar from './Avatar';

const PasswordVerifyModal = ({ isOpen, onClose, targetAccount, onVerify }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetAccount) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter password to switch account');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onVerify(targetAccount._id, password);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password. Re-authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden glass-panel text-left"
        >
          {/* Close Button */}
          <button
            onClick={() => { setError(''); setPassword(''); onClose(); }}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl gradient-accent flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Re-authenticate to Switch</h2>
              <p className="text-xs text-slate-400">Security verification required</p>
            </div>
          </div>

          {/* Target Account Badge */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 mb-5">
            <Avatar username={targetAccount.username} avatar={targetAccount.avatar} size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate">{targetAccount.username}</div>
              <div className="text-xs text-slate-400 truncate">{targetAccount.email}</div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-3 rounded-xl mb-4 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Enter Password for {targetAccount.username}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full bg-black/30 border border-white/10 text-white rounded-xl pl-10 pr-12 py-2.5 outline-none focus:border-pink-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setError(''); setPassword(''); onClose(); }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-xs border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl gradient-accent text-white font-bold text-xs hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify & Switch'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PasswordVerifyModal;
