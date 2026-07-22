import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const { user, login, googleLogin, guestLogin, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'account') {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      try {
        setIsSubmitting(true);
        setError('');
        await login(email, password, rememberMe);
        navigate('/chat');
      } catch (err) {
        if (err.response?.status === 403) {
            navigate('/verify-email', { state: { email } });
        } else {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!guestName.trim()) {
        setError('Please enter a display name');
        return;
      }

      try {
        setIsSubmitting(true);
        setError('');
        await guestLogin(guestName);
        navigate('/chat');
      } catch (err) {
        setError(err.response?.data?.message || 'Guest login failed');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential, rememberMe);
      navigate('/chat');
    } catch (err) {
      setError('Google login failed');
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to ChatApp</h2>
          <p className="text-gray-400 text-sm">Choose how you want to enter the chat</p>
        </div>

        {/* Existing Session Alert if visited directly while logged in */}
        {user && (
          <div className="bg-indigo-500/20 border border-indigo-500/40 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">Currently Signed In</div>
            <div className="text-white font-bold text-base">{user.username}</div>
            <div className="text-gray-300 text-xs mb-3">{user.email}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/chat')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 px-3 rounded-lg transition-colors"
              >
                Continue to Chat
              </button>
              <button
                onClick={handleSignOut}
                className="bg-white/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 font-medium text-xs py-2 px-3 rounded-lg border border-white/10 transition-colors"
              >
                Sign Out & Switch
              </button>
            </div>
          </div>
        )}

        {/* Auth Tabs */}
        <div className="flex bg-black/30 p-1 rounded-xl mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => { setActiveTab('account'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'account' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In with Account
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('guest'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'guest' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Quick Guest Identity
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'account' ? (
            <>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-black/20 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-black/20 border border-white/10 text-white rounded-lg pl-10 pr-12 py-3 outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-black/30 text-indigo-500 focus:ring-0"
                    />
                    <span>Remember account on this device</span>
                  </label>
                  <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium">
                    Forgot password?
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs text-gray-300 mb-2 font-medium">Your Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name (e.g. Alex)"
                  className="w-full bg-black/20 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">No password required. Enter your identity and start chatting instantly!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center text-sm shadow-lg"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : activeTab === 'account' ? (
              'Sign In'
            ) : (
              'Enter Chat as Guest'
            )}
          </button>
        </form>

        {activeTab === 'account' && (
          <>
            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-gray-400 text-xs">or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="filled_black"
                shape="rectangular"
                width="300"
              />
            </div>
          </>
        )}

        <p className="text-gray-400 text-center mt-6 text-xs">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
