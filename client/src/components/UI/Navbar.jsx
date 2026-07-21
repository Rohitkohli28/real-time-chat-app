import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import Avatar from './Avatar';
import ProfileModal from './ProfileModal';
import NotificationBell from './NotificationBell';
import UserSwitcher from './UserSwitcher';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { activeRoom, theme, toggleTheme, toggleSidebar } = useContext(ChatContext);
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav
        id="navbar"
        className="h-16 w-full flex items-center justify-between px-4 sm:px-6 rounded-2xl glass-panel shadow-glass border border-white/10 relative z-30 transition-all duration-300"
      >
        {/* Left section: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-toggle-btn"
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-all"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/chat')}>
            <div className="w-9 h-9 rounded-xl gradient-accent p-0.5 shadow-glow-accent transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950/40 backdrop-blur-md rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold tracking-wide gradient-text leading-none">
                Nexus<span className="text-slate-100 font-light">Chat</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">Real-time Platform</p>
            </div>
          </div>
        </div>

        {/* Center: Current active room pill */}
        {activeRoom ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-white/10"
          >
            <span className="text-pink-400 font-bold text-sm">#</span>
            <span className="font-semibold text-sm text-slate-100">{activeRoom.name}</span>
            {activeRoom.description && (
              <span className="text-xs text-slate-400 max-w-[220px] truncate border-l border-white/10 pl-2">
                {activeRoom.description}
              </span>
            )}
          </motion.div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs text-slate-400">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-200 font-mono">⌘ K</kbd>
            <span>to search rooms</span>
          </div>
        )}

        {/* Right section: Tools & Profile */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <NotificationBell />

          {/* Theme toggle button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            id="theme-toggle-btn"
            onClick={() => toggleTheme()}
            className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>

          {/* Account switcher */}
          <UserSwitcher />

          {/* Profile Button */}
          {user && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="profile-btn"
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full glass-pill hover:border-pink-500/40 transition-all group"
            >
              <div className="relative">
                <Avatar username={user.username} avatar={user.avatar} size="sm" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <span className="hidden md:block text-xs font-semibold text-slate-200 group-hover:text-pink-300 transition-colors max-w-[100px] truncate">
                {user.username}
              </span>
            </motion.button>
          )}

          {/* Logout button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            id="logout-btn"
            onClick={handleLogout}
            className="p-2 rounded-xl glass-pill hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="Sign Out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </motion.button>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default Navbar;
