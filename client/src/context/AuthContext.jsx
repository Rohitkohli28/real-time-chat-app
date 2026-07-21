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
    if (!accountData || !accountData._id || !accountData.token) return;
    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a._id !== accountData._id);
      const updated = [
        ...filtered,
        {
          _id: accountData._id,
          username: accountData.username,
          email: accountData.email,
          avatar: accountData.avatar,
          token: accountData.token, // Refresh token used as switch token
        },
      ];
      localStorage.setItem('savedAccounts', JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-login on page refresh by checking cookie via /auth/me
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    saveAccount(data);
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
    setUser(data);
    saveAccount(data);
    return data;
  };
  
  const googleLogin = async (token) => {
    const { data } = await api.post('/auth/google', { token });
    setUser(data);
    saveAccount(data);
    return data;
  };

  const switchUser = async (token) => {
    const { data } = await api.post('/auth/switch', { token });
    setUser(data);
    saveAccount(data);
    return data;
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch(e) {}
    setUser(null);
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, verifyEmail, googleLogin, logout, updateUser, switchUser, savedAccounts }}
    >
      {children}
    </AuthContext.Provider>
  );
};
