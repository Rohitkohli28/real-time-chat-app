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
    if (user) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('🟢 Socket connected:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('connect_error', async (err) => {
        console.error('❌ Socket connection error:', err.message);
        
        // If auth failed, try to refresh token and reconnect
        if (err.message === 'Authentication error' || err.message === 'User not found') {
          try {
            console.log('🔄 Attempting to refresh token for Socket...');
            // Import axios or api directly to make the call
            const api = (await import('../services/api')).default;
            await api.post('/auth/refresh');
            console.log('✅ Token refreshed. Reconnecting socket...');
            newSocket.connect();
          } catch (refreshErr) {
            console.error('❌ Token refresh failed for Socket:', refreshErr);
            setIsConnected(false);
            setConnectionError('Authentication failed. Please log in again.');
          }
        } else {
          setIsConnected(false);
          setConnectionError('Connection error. Retrying...');
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔴 Socket disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          setConnectionError('Server disconnected. Please refresh.');
        } else {
          setConnectionError('Connection lost. Reconnecting...');
        }
      });

      newSocket.on('reconnect', () => {
        console.log('🟢 Socket reconnected');
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};
