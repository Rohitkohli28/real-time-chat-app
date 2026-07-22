import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

const REMEMBERED_ACCOUNTS_KEY = 'rememberedAccounts';
const MAX_SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days expiration for inactive sessions

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize remembered accounts, filtering out expired items (> 7 days inactive)
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const raw = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const now = Date.now();
      const valid = parsed.filter(
        (a) => a._id && a.provider !== 'guest' && (!a.lastActive || now - a.lastActive < MAX_SESSION_AGE_MS)
      );
      if (valid.length !== parsed.length) {
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(valid));
      }
      return valid;
    } catch (e) {
      return [];
    }
  });

  const saveAccount = (accountData, shouldRemember = false) => {
    if (!accountData || !accountData._id || !shouldRemember) return;
    // Strictly NEVER remember guest accounts
    if (accountData.provider === 'guest' || accountData.email?.endsWith('@guest.chatapp.local')) return;

    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a._id !== accountData._id);
      const updated = [
        ...filtered,
        {
          _id: accountData._id,
          username: accountData.username,
          email: accountData.email,
          avatar: accountData.avatar,
          provider: accountData.provider || 'local',
          lastActive: Date.now(),
        },
      ];
      localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedAccount = (id) => {
    setSavedAccounts((prev) => {
      const updated = prev.filter((a) => a._id !== id);
      if (updated.length > 0) {
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(updated));
      } else {
        localStorage.removeItem(REMEMBERED_ACCOUNTS_KEY);
      }
      return updated;
    });
  };

  const clearSavedAccounts = () => {
    localStorage.removeItem(REMEMBERED_ACCOUNTS_KEY);
    setSavedAccounts([]);
  };

  const handleAuthSuccess = (data, shouldRemember = false) => {
    if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
    if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data);
    if (shouldRemember) {
      saveAccount(data, true);
    }
  };

  // Auto-restore session via /auth/me cookie check
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
        console.debug('[auth] Session restored');
      } catch (error) {
        console.debug('[auth] No active session', error.response?.data || error.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      console.warn('[auth] Session expired. Clearing active user.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password });
    console.debug('[auth] Login successful');
    handleAuthSuccess(data, rememberMe);
    return data;
  };

  const register = async (username, email, password, phone) => {
    const { data } = await api.post('/auth/register', {
      username,
      email,
      password,
      phone,
    });
    return data;
  };

  const verifyEmail = async (email, otp) => {
    const { data } = await api.post('/auth/verify-email', { email, otp });
    console.debug('[auth] Email verification login successful');
    handleAuthSuccess(data, true);
    return data;
  };

  const googleLogin = async (token, rememberMe = false) => {
    const { data } = await api.post('/auth/google', { token });
    console.debug('[auth] Google login successful');
    handleAuthSuccess(data, rememberMe);
    return data;
  };

  const guestLogin = async (username) => {
    const { data } = await api.post('/auth/guest', { username });
    console.debug('[auth] Guest login successful (not remembered)');
    handleAuthSuccess(data, false); // Guest is never remembered
    return data;
  };

  const switchUser = async (targetUserId, password) => {
    const { data } = await api.post('/auth/switch', { targetUserId, password });
    console.debug('[auth] Account switch successful');
    handleAuthSuccess(data, true);
    return data;
  };

  const logout = async (options = {}) => {
    const { forgetAccount = false } = options;
    const currentUserId = user?._id;
    const isGuest = user?.provider === 'guest' || user?.email?.endsWith('@guest.chatapp.local');

    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('[auth] Logout request failed; clearing local state anyway', e.response?.data || e.message);
    }

    if (currentUserId && (forgetAccount || isGuest)) {
      removeSavedAccount(currentUserId);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        googleLogin,
        guestLogin,
        logout,
        updateUser,
        switchUser,
        savedAccounts,
        removeSavedAccount,
        clearSavedAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
