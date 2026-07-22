import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { login, register, guestLogin, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);

      if (mode === 'signin') {
        if (!email || !password) {
          setError('Please fill in all fields');
          setIsSubmitting(false);
          return;
        }
        await login(email, password, rememberMe);
        onClose();
        navigate('/chat');
      } else if (mode === 'signup') {
        if (!username || !email || !password) {
          setError('Please fill in all required fields');
          setIsSubmitting(false);
          return;
        }
        const data = await register(username, email, password);
        onClose();
        navigate('/verify-email', { state: { email: data.email || email } });
      } else if (mode === 'guest') {
        if (!guestName.trim()) {
          setError('Please enter a display name');
          setIsSubmitting(false);
          return;
        }
        await guestLogin(guestName);
        onClose();
        navigate('/chat');
      }
    } catch (err) {
      if (err.response?.status === 403 && mode === 'signin') {
        onClose();
        navigate('/verify-email', { state: { email } });
      } else {
        setError(err.response?.data?.message || 'Authentication failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      await googleLogin(credentialResponse.credential, rememberMe);
      onClose();
      navigate('/chat');
    } catch (err) {
      setError('Google authentication failed');
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
          className="relative w-full max-w-md bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden glass-panel"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'guest' && 'Instant Guest Access'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'signin' && 'Sign in to access your chat channels and voice rooms'}
              {mode === 'signup' && 'Join NexusChat to connect with real-time audio and text'}
              {mode === 'guest' && 'Enter a display name to start chatting right away'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/40 p-1 rounded-2xl mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signin' ? 'gradient-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup' ? 'gradient-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode('guest'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'guest' ? 'gradient-accent text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Guest
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-3 rounded-xl mb-4 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full bg-black/30 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-pink-500 text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {mode !== 'guest' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-black/30 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-pink-500 text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {mode !== 'guest' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
            )}

            {mode === 'guest' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Alex"
                    className="w-full bg-black/30 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-pink-500 text-sm transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Instant guest access requires no email or password.
                </p>
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-black/30 text-pink-500 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => { onClose(); navigate('/forgot-password'); }}
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl gradient-accent text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In to Chat'
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Enter Chat as Guest'
              )}
            </button>
          </form>

          {mode !== 'guest' && (
            <>
              <div className="my-5 flex items-center justify-center space-x-3">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-slate-400 text-xs uppercase tracking-wider">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Authentication Failed')}
                  useOneTap
                  theme="filled_black"
                  shape="rectangular"
                  width="320"
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
