import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('savedAccounts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveAccount = (accountData) => {
    if (!accountData || !accountData._id || !accountData.refreshToken) return;
    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a._id !== accountData._id);
      const updated = [
        ...filtered,
        {
          _id: accountData._id,
          username: accountData.username,
          email: accountData.email,
          avatar: accountData.avatar,
          token: accountData.refreshToken, // Testing-only switch token.
        },
      ];
      localStorage.setItem('savedAccounts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAuthSuccess = (data) => {
    if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
    if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data);
    saveAccount(data);
  };

  // Auto-login on page refresh by checking cookie via /auth/me
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
      console.warn('[auth] Session expired. Clearing current user.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    console.debug('[auth] Login successful');
    handleAuthSuccess(data);
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
    handleAuthSuccess(data);
    return data;
  };
  
  const googleLogin = async (token) => {
    const { data } = await api.post('/auth/google', { token });
    console.debug('[auth] Google login successful');
    handleAuthSuccess(data);
    return data;
  };

  const guestLogin = async (username) => {
    const { data } = await api.post('/auth/guest', { username });
    console.debug('[auth] Guest login successful');
    handleAuthSuccess(data);
    return data;
  };

  const switchUser = async (token) => {
    const { data } = await api.post('/auth/switch', { token });
    console.debug('[auth] Account switch successful');
    handleAuthSuccess(data);
    return data;
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch(e) {
      console.warn('[auth] Logout request failed; clearing local state anyway', e.response?.data || e.message);
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
      value={{ user, loading, login, register, verifyEmail, googleLogin, guestLogin, logout, updateUser, switchUser, savedAccounts }}
    >
      {children}
    </AuthContext.Provider>
  );
};
