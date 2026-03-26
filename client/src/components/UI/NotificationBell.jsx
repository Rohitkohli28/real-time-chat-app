import { useState, useContext, useRef, useEffect } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useNotification } from '../../hooks/useNotification';
import { useSocket } from '../../hooks/useSocket';

const NotificationBell = () => {
  const { theme, rooms, setActiveRoom, clearUnread, setRoomMessages } = useContext(ChatContext);
  const { notifications, unreadCount, markAllRead } = useNotification();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleNotificationClick = (notif) => {
    // Find and switch to the room
    const room = rooms.find((r) => r._id === notif.roomId);
    if (room && socket) {
      setActiveRoom(room);
      clearUnread(room._id);
      setRoomMessages([]);
      socket.emit('join_room', { roomId: room._id, userId: '' });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notification-bell"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllRead();
          }
        }}
        className={`relative p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl border z-50 animate-slide-up ${
          isDark ? 'bg-dark-sidebar border-white/10' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-4 py-3 border-b font-medium text-sm ${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-gray-800'}`}>
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div className={`px-4 py-8 text-center text-sm ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 20).map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left px-4 py-3 border-b transition-colors ${
                  isDark
                    ? `border-white/5 hover:bg-white/5 ${notif.read ? 'opacity-60' : ''}`
                    : `border-gray-100 hover:bg-gray-50 ${notif.read ? 'opacity-60' : ''}`
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">
                    {notif.type === 'voice' ? '🎤' : '💬'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {notif.sender}
                    </p>
                    <p className={`text-xs truncate ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
                      {notif.content}
                    </p>
                    <p className={`text-[10px] mt-1 ${isDark ? 'text-dark-muted/60' : 'text-gray-400'}`}>
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
