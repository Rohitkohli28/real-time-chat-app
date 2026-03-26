import { useEffect, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatContext } from '../../context/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useNotification } from '../../hooks/useNotification';
import { parseVoiceCommand, fuzzyMatchRoom, VOICE_COMMANDS } from '../../utils/voiceCommands';

// Emoji mapping for voice commands
const EMOJI_MAP = {
  'thumbs up': '👍', like: '👍', heart: '❤️', fire: '🔥',
  clap: '👏', party: '🎉', smile: '😊', laugh: '😂',
  cry: '😢', thinking: '🤔',
};

const VoiceCommandHandler = () => {
  const {
    rooms, activeRoom, setActiveRoom, toggleSidebar, setSidebarOpen,
    toggleTheme, setRoomMessages, clearUnread, messages, theme,
  } = useContext(ChatContext);
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { clearNotifications } = useNotification();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Helper: switch to a specific room
  const switchToRoom = useCallback((room) => {
    if (activeRoom && socket) {
      socket.emit('leave_room', { roomId: activeRoom._id, userId: user._id });
    }
    if (socket) {
      socket.emit('join_room', { roomId: room._id, userId: user._id });
    }
    setActiveRoom(room);
    clearUnread(room._id);
    setRoomMessages([]);
  }, [activeRoom, socket, user, setActiveRoom, clearUnread, setRoomMessages]);

  const handleCommand = useCallback(
    (event) => {
      const { transcript } = event.detail;
      const result = parseVoiceCommand(transcript);

      if (!result) {
        showToast(`Unknown command: "${transcript}"`, 'error');
        return;
      }

      const { handler, data } = result;

      switch (handler) {
        // ═══ Messaging ═══
        case 'sendMessage':
          if (socket && activeRoom && data.text) {
            socket.emit('send_message', { content: data.text, roomId: activeRoom._id });
            showToast(`Sent: "${data.text}"`);
          } else {
            showToast('Join a room first', 'error');
          }
          break;

        case 'typeMessage':
          if (window.setChatMessage && data.text) {
            window.setChatMessage(data.text);
            showToast(`Typed: "${data.text}"`);
          }
          break;

        case 'sendCurrent':
          if (window.sendChatMessage) {
            window.sendChatMessage();
            showToast('Message sent');
          }
          break;

        case 'quickReply':
          if (socket && activeRoom && data.text) {
            socket.emit('send_message', { content: data.text, roomId: activeRoom._id });
            showToast(`Sent: "${data.text}"`);
          } else {
            showToast('Join a room first', 'error');
          }
          break;

        case 'sendEmoji':
          if (socket && activeRoom && data.emoji) {
            const emoji = EMOJI_MAP[data.emoji] || data.emoji;
            socket.emit('send_message', { content: emoji, roomId: activeRoom._id });
            showToast(`Sent ${emoji}`);
          } else {
            showToast('Join a room first', 'error');
          }
          break;

        case 'clearMessage':
          if (window.clearChatMessage) {
            window.clearChatMessage();
            showToast('Input cleared');
          }
          break;

        case 'deleteLastMessage':
          if (socket && activeRoom && user) {
            const myMessages = messages.filter(
              (m) => m.sender?._id === user._id && !m.isDeleted && m.type !== 'system'
            );
            if (myMessages.length > 0) {
              const lastMsg = myMessages[myMessages.length - 1];
              socket.emit('delete_message', { messageId: lastMsg._id, roomId: activeRoom._id });
              showToast('Last message deleted');
            } else {
              showToast('No messages to delete', 'error');
            }
          }
          break;

        // ═══ Room Navigation ═══
        case 'switchRoom':
          if (data.roomName) {
            const matched = fuzzyMatchRoom(data.roomName, rooms);
            if (matched) {
              switchToRoom(matched);
              showToast(`Switched to #${matched.name}`);
            } else {
              showToast(`Room "${data.roomName}" not found`, 'error');
            }
          }
          break;

        case 'nextRoom': {
          if (rooms.length === 0) break;
          const currentIdx = rooms.findIndex((r) => r._id === activeRoom?._id);
          const nextIdx = (currentIdx + 1) % rooms.length;
          switchToRoom(rooms[nextIdx]);
          showToast(`Switched to #${rooms[nextIdx].name}`);
          break;
        }

        case 'previousRoom': {
          if (rooms.length === 0) break;
          const curIdx = rooms.findIndex((r) => r._id === activeRoom?._id);
          const prevIdx = curIdx <= 0 ? rooms.length - 1 : curIdx - 1;
          switchToRoom(rooms[prevIdx]);
          showToast(`Switched to #${rooms[prevIdx].name}`);
          break;
        }

        case 'whatRoom':
          showToast(activeRoom ? `You're in #${activeRoom.name}` : 'No room selected', 'info');
          break;

        // ═══ Scrolling ═══
        case 'scrollUp':
          if (window.chatScrollUp) { window.chatScrollUp(); showToast('Scrolled up'); }
          break;

        case 'scrollDown':
          if (window.chatScrollDown) { window.chatScrollDown(); showToast('Scrolled down'); }
          break;

        case 'scrollTop':
          if (document.getElementById('chat-window')) {
            document.getElementById('chat-window').scrollTop = 0;
            showToast('Scrolled to top');
          }
          break;

        case 'scrollBottom':
          if (document.getElementById('chat-window')) {
            const el = document.getElementById('chat-window');
            el.scrollTop = el.scrollHeight;
            showToast('Scrolled to bottom');
          }
          break;

        // ═══ UI Controls ═══
        case 'toggleSidebar':
          toggleSidebar();
          showToast('Sidebar toggled');
          break;

        case 'showSidebar':
          setSidebarOpen(true);
          showToast('Sidebar opened');
          break;

        case 'hideSidebar':
          setSidebarOpen(false);
          showToast('Sidebar hidden');
          break;

        case 'darkMode':
          toggleTheme('dark');
          showToast('Dark mode enabled');
          break;

        case 'lightMode':
          toggleTheme('light');
          showToast('Light mode enabled');
          break;

        case 'toggleTheme':
          toggleTheme();
          showToast('Theme toggled');
          break;

        case 'openProfile':
          document.getElementById('profile-btn')?.click();
          showToast('Profile opened');
          break;

        case 'openNotifications':
          document.getElementById('notification-bell')?.click();
          showToast('Notifications opened');
          break;

        case 'clearNotifications':
          clearNotifications();
          showToast('Notifications cleared');
          break;

        case 'toggleMute':
          setIsMuted((prev) => !prev);
          showToast(isMuted ? 'Sounds unmuted 🔊' : 'Sounds muted 🔇');
          break;

        case 'focusInput':
          if (window.chatInputRef?.current) {
            window.chatInputRef.current.focus();
            showToast('Input focused');
          }
          break;

        // ═══ User Actions ═══
        case 'logout':
          logout();
          navigate('/login');
          showToast('Logged out');
          break;

        case 'whoIsOnline': {
          const names = onlineUsers.map((u) => u.username).join(', ');
          showToast(`${onlineUsers.length} online: ${names || 'none'}`, 'info');
          break;
        }

        case 'help': {
          // Group commands by category for nicer display
          const categories = {
            'Quick Send': ['say [text]', 'hello/hi/hey', 'yes/no/ok/thanks'],
            'Messages': ['send message [text]', 'type [text]', 'send', 'clear', 'undo'],
            'Rooms': ['go to [room]', 'next room', 'previous room', 'what room'],
            'UI': ['scroll up/down/top/bottom', 'toggle sidebar', 'dark/light mode', 'focus'],
            'Other': ['show profile', 'show notifications', 'mute/unmute', 'online', 'help'],
          };
          let helpText = '';
          for (const [cat, cmds] of Object.entries(categories)) {
            helpText += `${cat}: ${cmds.join(', ')}\n`;
          }
          showToast(helpText.trim(), 'info');
          break;
        }

        default:
          showToast(`Unknown handler: ${handler}`, 'error');
      }
    },
    [socket, activeRoom, user, rooms, messages, onlineUsers, isMuted, logout, navigate, toggleSidebar, setSidebarOpen, toggleTheme, showToast, setActiveRoom, clearUnread, setRoomMessages, switchToRoom, clearNotifications]
  );

  useEffect(() => {
    window.addEventListener('voiceCommand', handleCommand);
    return () => window.removeEventListener('voiceCommand', handleCommand);
  }, [handleCommand]);

  const isDark = theme === 'dark';

  // Toast UI
  if (!toast) return null;

  return (
    <div className={`fixed top-20 right-4 z-[60] max-w-sm toast-enter`}>
      <div
        className={`px-4 py-3 rounded-xl shadow-xl border ${
          toast.type === 'error'
            ? isDark
              ? 'bg-red-900/80 border-red-500/30 text-red-200'
              : 'bg-red-50 border-red-200 text-red-700'
            : toast.type === 'info'
              ? isDark
                ? 'bg-blue-900/80 border-blue-500/30 text-blue-200'
                : 'bg-blue-50 border-blue-200 text-blue-700'
              : isDark
                ? 'bg-green-900/80 border-green-500/30 text-green-200'
                : 'bg-green-50 border-green-200 text-green-700'
        }`}
      >
        <div className="flex items-start gap-2">
          <span className="text-sm mt-0.5">
            {toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}
          </span>
          <p className="text-sm whitespace-pre-line">{toast.message}</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommandHandler;
