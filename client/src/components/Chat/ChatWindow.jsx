import { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const { messages, activeRoom, addMessage, setRoomMessages, removeMessage, typingUsers, setTypingUsers, incrementUnread, theme } = useContext(ChatContext);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isDark = theme === 'dark';
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Expose scroll functions globally for voice commands
  useEffect(() => {
    window.chatScrollUp = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop -= 300;
      }
    };
    window.chatScrollDown = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop += 300;
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room_history', (history) => {
      setRoomMessages(history);
    });

    socket.on('receive_message', (message) => {
      addMessage(message);
      // Increment unread if message is for a different room
      if (activeRoom && message.room !== activeRoom._id) {
        incrementUnread(message.room);
      }
    });

    socket.on('message_deleted', ({ messageId }) => {
      removeMessage(messageId);
    });

    // Listen for chat cleared event
    socket.on('chat_cleared', ({ roomId, clearedBy }) => {
      if (activeRoom && roomId === activeRoom._id) {
        setRoomMessages([]);
      }
    });

    socket.on('typing_status', ({ userId, username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.find((u) => u.userId === userId)) {
            return [...prev, { userId, username }];
          }
          return prev;
        } else {
          return prev.filter((u) => u.userId !== userId);
        }
      });
    });

    socket.on('user_joined', ({ userId }) => {
      // Add system message
      addMessage({
        _id: `sys-${Date.now()}`,
        content: 'A user joined the room',
        type: 'system',
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('user_left', ({ userId }) => {
      addMessage({
        _id: `sys-${Date.now()}`,
        content: 'A user left the room',
        type: 'system',
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      socket.off('room_history');
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('chat_cleared');
      socket.off('typing_status');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket, activeRoom]);

  if (!activeRoom) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-dark-chat' : 'bg-light-chat'}`}>
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 gradient-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Welcome to ChatApp
          </h3>
          <p className={`${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
            Select a room from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="chat-window"
      ref={chatContainerRef}
      className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-4 ${isDark ? 'bg-dark-chat' : 'bg-light-chat'}`}
    >
      {/* Room header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
          isDark ? 'bg-white/5 text-dark-muted' : 'bg-gray-200 text-gray-500'
        }`}>
          <span>Welcome to #{activeRoom.name}</span>
          {activeRoom.description && (
            <span className="opacity-60">— {activeRoom.description}</span>
          )}
        </div>

        {/* Clear Chat button */}
        <div className="mt-2">
          <button
            id="clear-chat-btn"
            onClick={() => setShowClearConfirm(true)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
              isDark
                ? 'bg-white/5 text-dark-muted hover:bg-red-500/20 hover:text-red-400'
                : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
            title="Clear all messages in this room"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Chat
          </button>
        </div>
      </div>

      {/* Clear Chat Confirmation Dialog */}
      {showClearConfirm && (
        <div className="flex justify-center mb-4">
          <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border animate-slide-up ${
            isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
          }`}>
            <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
              Delete all messages in #{activeRoom.name}?
            </span>
            <button
              onClick={() => {
                if (socket && activeRoom) {
                  socket.emit('clear_chat', { roomId: activeRoom._id });
                }
                setShowClearConfirm(false);
              }}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Yes, Clear
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={message.sender?._id === user?._id}
          onDelete={(id) => {
            if (socket && activeRoom) {
              socket.emit('delete_message', { messageId: id, roomId: activeRoom._id });
            }
          }}
        />
      ))}

      {/* Typing indicator */}
      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
