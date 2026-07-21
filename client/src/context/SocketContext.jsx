import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    let isActive = true;

    if (user) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        if (!isActive) return;
        console.log('[socket] Connected:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('connect_error', async (err) => {
        if (!isActive) return;
        console.error('[socket] Connection error:', err.message, err.data || '');

        if (['NO_TOKEN', 'AUTH_FAILED'].includes(err.data?.code) || /auth/i.test(err.message)) {
          try {
            console.log('[socket] Attempting token refresh before reconnect...');
            const api = (await import('../services/api')).default;
            await api.post('/auth/refresh');
            console.log('[socket] Token refreshed. Reconnecting socket...');
            if (isActive) newSocket.connect();
          } catch (refreshErr) {
            console.error('[socket] Token refresh failed:', refreshErr.response?.data || refreshErr.message);
            setIsConnected(false);
            setConnectionError('Authentication failed. Please log in again.');
          }
        } else {
          setIsConnected(false);
          setConnectionError('Connection error. Retrying...');
        }
      });

      newSocket.on('disconnect', (reason) => {
        if (!isActive) return;
        console.log('[socket] Disconnected:', reason);
        setIsConnected(false);

        if (reason === 'io server disconnect') {
          setConnectionError('Server disconnected. Please refresh.');
        } else {
          setConnectionError('Connection lost. Reconnecting...');
        }
      });

      newSocket.on('reconnect', () => {
        if (!isActive) return;
        console.log('[socket] Reconnected');
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('online_users', (users) => {
        if (isActive) setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        isActive = false;
        newSocket.disconnect();
      };
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      isActive = false;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};
