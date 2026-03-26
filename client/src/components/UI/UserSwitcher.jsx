import { useState, useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Avatar from './Avatar';

const UserSwitcher = () => {
  const { theme } = useContext(ChatContext);
  const { user, switchUser, savedAccounts } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const isDark = theme === 'dark';

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all users when dropdown opens
  useEffect(() => {
    if (isOpen && allUsers.length === 0) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const { data } = await api.get('/users');
          setAllUsers(data);
        } catch (err) {
          console.error('Failed to fetch users:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleSwitch = async (account) => {
    if (account._id === user?._id) return;

    // Check if we have a saved token for this account
    const saved = savedAccounts.find((a) => a._id === account._id);
    if (saved) {
      switchUser(saved.token, saved);
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="user-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-all ${
          isDark ? 'hover:bg-white/10 text-dark-muted hover:text-white' : 'hover:bg-gray-100 text-gray-600'
        }`}
        title="Switch user (testing mode)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl border z-50 animate-slide-up ${
          isDark ? 'bg-dark-sidebar border-white/10' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Switch Account
            </p>
            <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
              Testing mode — login with another account first
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {savedAccounts.length === 0 ? (
              <p className={`px-4 py-4 text-sm text-center ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                Login with other accounts to enable switching. Each login is saved here.
              </p>
            ) : (
              savedAccounts.map((account) => (
                <button
                  key={account._id}
                  onClick={() => handleSwitch(account)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    account._id === user?._id
                      ? isDark
                        ? 'bg-dark-accent/20 text-white'
                        : 'bg-light-accent/10 text-light-accent'
                      : isDark
                        ? 'hover:bg-white/5 text-white'
                        : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <Avatar username={account.username} avatar={account.avatar} size="sm" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{account.username}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                      {account.email}
                    </p>
                  </div>
                  {account._id === user?._id && (
                    <span className="text-xs gradient-accent text-white px-2 py-0.5 rounded-full">Active</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
