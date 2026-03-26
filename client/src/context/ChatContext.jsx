import { createContext, useState, useCallback } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('chatapp_theme') || 'dark');
  const [unreadCounts, setUnreadCounts] = useState({});

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const setRoomMessages = useCallback((msgs) => {
    setMessages(msgs);
  }, []);

  const removeMessage = useCallback((messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, isDeleted: true, content: 'This message has been deleted' }
          : m
      )
    );
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleTheme = useCallback((mode) => {
    const newTheme = mode || (theme === 'dark' ? 'light' : 'dark');
    setTheme(newTheme);
    localStorage.setItem('chatapp_theme', newTheme);
  }, [theme]);

  const incrementUnread = useCallback((roomId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1,
    }));
  }, []);

  const clearUnread = useCallback((roomId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: 0,
    }));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        setRooms,
        activeRoom,
        setActiveRoom,
        messages,
        setMessages,
        addMessage,
        setRoomMessages,
        removeMessage,
        typingUsers,
        setTypingUsers,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        theme,
        toggleTheme,
        unreadCounts,
        incrementUnread,
        clearUnread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
