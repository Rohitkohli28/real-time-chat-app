import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chatapp_token'));
  const [loading, setLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chatapp_accounts') || '[]');
    } catch {
      return [];
    }
  });

  // Save account to multi-user list
  const saveAccount = (userData, userToken) => {
    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a._id !== userData._id);
      const updated = [
        ...filtered,
        {
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar || '',
          bio: userData.bio || '',
          token: userToken,
        },
      ];
      localStorage.setItem('chatapp_accounts', JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-login on page refresh
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Auto-login failed:', error);
          localStorage.removeItem('chatapp_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('chatapp_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data);
    saveAccount(data, data.token);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    localStorage.setItem('chatapp_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data);
    saveAccount(data, data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('chatapp_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Switch to a different saved account
  const switchUser = (newToken, userData) => {
    localStorage.setItem('chatapp_token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
  };

  // Update user data (after profile edit)
  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
    // Also update in saved accounts
    if (token) {
      saveAccount({ ...user, ...data }, token);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, switchUser, updateUser, savedAccounts }}
    >
      {children}
    </AuthContext.Provider>
  );
};
