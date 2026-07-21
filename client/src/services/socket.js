import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const createSocket = ({ accessToken, refreshToken } = {}) => {
  return io(SOCKET_URL, {
    auth: {
      token: accessToken,
      refreshToken,
    },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
};

export default createSocket;
