import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (token && user) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
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

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
        setIsConnected(false);
        setConnectionError(err.message === 'Authentication error'
          ? 'Authentication failed. Please log in again.'
          : 'Connection error. Retrying...');
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
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};
