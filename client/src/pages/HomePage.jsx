import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/UI/Avatar';

const HomePage = () => {
  const { user, logout, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      await guestLogin(guestName);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join chat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-dark-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">ChatApp</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <Avatar username={user.username} avatar={user.avatar} size="xs" />
                <span className="text-slate-300">Signed in:</span>
                <span className="font-semibold text-white truncate max-w-[120px]">{user.username}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 text-sm font-medium transition-all border border-white/10"
              >
                Sign Out
              </button>
              <Link
                to="/chat"
                className="px-5 py-2 rounded-xl gradient-accent text-white font-medium hover:opacity-90 transition-all transform hover:scale-105 shadow-lg text-sm"
              >
                Open Chat
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl text-white font-medium hover:bg-white/10 transition-all border border-white/10 text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl gradient-accent text-white font-medium hover:opacity-90 transition-all transform hover:scale-105 shadow-lg text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-12 md:pt-20 pb-20">
        <div className="animate-fade-in max-w-3xl w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-dark-muted mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Real-Time Voice & Text Communication
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Chat in{' '}
            <span className="bg-gradient-to-r from-dark-accent to-purple-500 bg-clip-text text-transparent">
              Real-Time
            </span>
            <br />
            with{' '}
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Voice Commands
            </span>
          </h1>

          <p className="text-lg text-dark-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Experience real-time messaging, group chat rooms, and voice commands. Sign in with your account or enter your name to start chatting instantly.
          </p>

          {/* Active Identity Card OR Sign In Options */}
          {user ? (
            <div className="glass rounded-2xl p-6 max-w-md w-full border border-white/15 shadow-2xl flex flex-col items-center gap-4 mb-8">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Session Detected</div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl w-full border border-white/10">
                <Avatar username={user.username} avatar={user.avatar} size="lg" />
                <div className="text-left overflow-hidden">
                  <h3 className="font-bold text-white text-base truncate">{user.username}</h3>
                  <p className="text-xs text-dark-muted truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-1">
                <Link
                  to="/chat"
                  className="flex-1 py-3 px-4 rounded-xl gradient-accent text-white font-semibold text-center hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <span>Continue as {user.username}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 font-medium transition-all flex items-center justify-center gap-2 border border-white/10 text-sm"
                >
                  <span>Switch Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md flex flex-col items-center gap-6 mb-8">
              {/* Quick Guest Identity Form */}
              <div className="glass rounded-2xl p-6 w-full border border-white/15 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-1">Enter Your Identity to Chat</h3>
                <p className="text-xs text-dark-muted mb-4">Enter a display name to enter chat instantly, or sign in below.</p>

                {error && (
                  <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs p-2.5 rounded-lg mb-3">
                    {error}
                  </div>
                )}

                <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name (e.g. Alex)"
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl gradient-accent text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Join Chat Instantly</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center space-x-3">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-dark-muted text-xs">or sign in with existing account</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    to="/login"
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs text-center border border-white/10 transition-all"
                  >
                    Sign In (Email)
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs text-center border border-white/10 transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full">
          {[
            {
              icon: '⚡',
              title: 'Real-Time Messaging',
              desc: 'Instant message delivery with Socket.io WebSockets',
            },
            {
              icon: '🎤',
              title: 'Voice Commands',
              desc: 'Control the app hands-free with 15+ voice commands',
            },
            {
              icon: '🔒',
              title: 'Secure Auth',
              desc: 'JWT authentication with encrypted passwords',
            },
            {
              icon: '💬',
              title: 'Chat Rooms',
              desc: 'Join or create public rooms for group conversations',
            },
            {
              icon: '✨',
              title: 'Rich Features',
              desc: 'Typing indicators, read receipts, emojis & more',
            },
            {
              icon: '🌓',
              title: 'Dark & Light Mode',
              desc: 'Beautiful themes — switch with a voice command',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all group animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">
                {feature.icon}
              </span>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-dark-muted text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-dark-muted text-sm border-t border-white/5">
        <p>Built with React, Socket.io, MongoDB & ❤️</p>
      </footer>
    </div>
  );
};

export default HomePage;
