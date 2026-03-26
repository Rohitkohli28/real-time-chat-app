import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        className={`h-16 flex items-center justify-between px-4 md:px-6 border-b ${
          theme === 'dark'
            ? 'bg-dark-sidebar border-white/10 text-white'
            : 'bg-white border-gray-200 text-gray-800'
        } z-50`}
      >
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-toggle-btn"
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold hidden sm:block">ChatApp</h1>
          </div>
        </div>

        {/* Center - Current room */}
        {activeRoom && (
          <div className="hidden md:flex items-center gap-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
              #
            </span>
            <span className="font-semibold">{activeRoom.name}</span>
            {activeRoom.description && (
              <span className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'} max-w-[200px] truncate`}>
                — {activeRoom.description}
              </span>
            )}
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <NotificationBell />

          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => toggleTheme()}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User switcher */}
          <UserSwitcher />

          {/* User avatar — click to open profile */}
          {user && (
            <button
              id="profile-btn"
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              title="View profile"
            >
              <Avatar username={user.username} avatar={user.avatar} size="sm" />
              <span className="hidden md:block text-sm font-medium">{user.username}</span>
            </button>
          )}

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-red-500/20 text-dark-muted hover:text-red-400'
                : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
            }`}
            aria-label="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default Navbar;
