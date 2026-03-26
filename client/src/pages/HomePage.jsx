import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { user } = useAuth();

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
          <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-xl font-bold">ChatApp</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/chat"
              className="px-6 py-2.5 rounded-xl gradient-accent text-white font-medium hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
            >
              Open Chat
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl text-white font-medium hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-xl gradient-accent text-white font-medium hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 md:pt-32 pb-20">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-dark-muted mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Voice commands powered by Web Speech API
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
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

          <p className="text-lg md:text-xl text-dark-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the future of communication. Send messages, switch rooms, and control the app — all with your voice. No typing required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/chat' : '/register'}
              className="px-8 py-4 rounded-2xl gradient-accent text-white font-semibold text-lg
                         hover:opacity-90 transition-all transform hover:scale-105 shadow-xl
                         flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Chatting
            </Link>

            <div className="flex items-center gap-2 text-dark-muted text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice enabled
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full">
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
