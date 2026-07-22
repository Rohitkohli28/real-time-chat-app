import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/Auth/AuthModal';

const HomePage = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  // Automatically redirect authenticated users directly to /chat without landing page exposure
  if (user) {
    return <Navigate to="/chat" replace />;
  }

  const openAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-x-hidden font-sans">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[650px] h-[650px] bg-dark-accent/15 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] left-[-15%] w-[650px] h-[650px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            ChatApp
          </span>
        </div>

        {/* Navbar Right Actions - Clean Sign In / Get Started only */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAuth('signin')}
            className="px-5 py-2.5 rounded-xl text-slate-200 hover:text-white font-medium text-sm hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuth('signup')}
            className="px-6 py-2.5 rounded-xl gradient-accent text-white font-semibold text-sm hover:opacity-90 transition-all transform hover:scale-105 shadow-xl shadow-pink-500/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 md:pt-24 pb-20 text-center flex flex-col items-center">
        <div className="animate-fade-in max-w-4xl flex flex-col items-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-8 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-glow-emerald" />
            Next-Generation Voice & Real-Time Messaging Platform
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Chat in{' '}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Real-Time
            </span>
            <br />
            with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Voice Commands
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Experience the future of communication. Send instant messages, switch rooms hands-free, and control your app — all with your voice. No typing required.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <button
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl gradient-accent text-white font-bold text-base hover:opacity-95 transition-all transform hover:scale-105 shadow-2xl shadow-pink-500/25 flex items-center justify-center gap-3"
            >
              <span>Get Started Free</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={() => openAuth('guest')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-100 font-semibold text-base transition-all border border-white/10 flex items-center justify-center gap-2.5 backdrop-blur-md"
            >
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Try Guest Mode</span>
            </button>
          </div>
        </div>

        {/* App Interface Showcase Preview */}
        <div className="w-full max-w-5xl mt-4 rounded-3xl glass-panel p-3 border border-white/15 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none" />
          {/* Top Bar Mock */}
          <div className="h-9 w-full bg-slate-950/60 rounded-t-2xl flex items-center px-4 gap-2 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-slate-400 font-mono mx-auto">NexusChat App — #general channel</span>
          </div>

          {/* App Preview Content Mock */}
          <div className="bg-slate-950/70 p-6 md:p-10 rounded-b-2xl flex flex-col md:flex-row gap-6 items-center text-left">
            <div className="w-full md:w-1/3 space-y-3">
              <div className="h-4 bg-white/10 rounded-lg w-3/4 animate-pulse" />
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">#</div>
                <div>
                  <div className="text-xs font-bold text-white">general</div>
                  <div className="text-[10px] text-slate-400">Public channel</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">#</div>
                <div>
                  <div className="text-xs font-bold text-white">tech-talk</div>
                  <div className="text-[10px] text-slate-400">Tech discussions</div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[10px] font-bold">AI</div>
                  <span className="text-xs font-bold text-slate-200">Voice System</span>
                  <span className="text-[10px] text-slate-500">12:00 PM</span>
                </div>
                <p className="text-xs text-slate-300">"Command recognized: Switched to #tech-talk channel."</p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">R</div>
                  <span className="text-xs font-bold text-white">Rohit</span>
                  <span className="text-[10px] text-pink-300">Just now</span>
                </div>
                <p className="text-xs text-slate-200">Welcome to NexusChat! Try speaking your commands hands-free.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section className="mt-32 max-w-6xl w-full text-left">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Designed for Speed, Security & Simplicity
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Everything you need for seamless real-time messaging and hands-free voice control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Real-Time WebSockets',
                desc: 'Instant bidirectional message delivery powered by Socket.io engine with zero latency.',
              },
              {
                icon: '🎤',
                title: 'Voice Controls',
                desc: 'Control channel switching, message sending, and theme toggling with Web Speech API.',
              },
              {
                icon: '🔒',
                title: 'Encrypted Security',
                desc: 'Secure JWT authentication with HttpOnly cookies and password hashing.',
              },
              {
                icon: '💬',
                title: 'Custom Group Channels',
                desc: 'Create, join, and manage public channels for structured team conversations.',
              },
              {
                icon: '✨',
                title: 'Rich Interactions',
                desc: 'Typing indicators, active online user lists, emojis, and read receipts.',
              },
              {
                icon: '🌓',
                title: 'Dynamic Themes',
                desc: 'Beautiful glassmorphic dark and light themes toggleable instantly via voice or click.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mt-28 max-w-5xl w-full glass-panel rounded-3xl p-10 border border-white/10 text-center relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Ready to experience voice-enabled chat?
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-8">
            Join thousands of users communicating effortlessly with real-time text and voice commands.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => openAuth('signup')}
              className="px-8 py-3.5 rounded-xl gradient-accent text-white font-bold text-sm hover:opacity-90 transition-all transform hover:scale-105 shadow-xl"
            >
              Get Started Now
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <div className="w-6 h-6 gradient-accent rounded-lg flex items-center justify-center text-white text-xs font-bold">C</div>
          <span className="font-bold text-white">ChatApp</span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <p>Built with React, Socket.io, MongoDB & ❤️</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default HomePage;
