import { createContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { playNotificationSound, showBrowserNotification, requestNotificationPermission } from '../utils/notification';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  // Request browser notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Listen for notifications from socket
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', (notification) => {
      const newNotif = {
        ...notification,
        id: Date.now() + Math.random(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);

      // Play sound and show browser notification
      playNotificationSound();
      showBrowserNotification(
        `${notification.sender} in #${notification.roomName || 'chat'}`,
        notification.content
      );
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  const addNotification = useCallback((notification) => {
    const newNotif = {
      ...notification,
      id: Date.now() + Math.random(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        clearNotifications,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
