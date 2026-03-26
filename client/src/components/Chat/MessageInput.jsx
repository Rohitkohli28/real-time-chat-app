import { useState, useContext, useRef, useEffect } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import AudioRecorder from './AudioRecorder';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const { activeRoom, theme } = useContext(ChatContext);
  const { socket } = useSocket();
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isDark = theme === 'dark';

  // Expose input ref globally for voice commands
  useEffect(() => {
    window.chatInputRef = inputRef;
    window.setChatMessage = (text) => {
      setMessage(text);
    };
    window.clearChatMessage = () => {
      setMessage('');
    };
    window.sendChatMessage = () => {
      if (message.trim() && socket && activeRoom) {
        socket.emit('send_message', {
          content: message.trim(),
          roomId: activeRoom._id,
        });
        setMessage('');
      }
    };
  }, [message, socket, activeRoom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !activeRoom) return;

    socket.emit('send_message', {
      content: message.trim(),
      roomId: activeRoom._id,
    });

    socket.emit('stop_typing', { roomId: activeRoom._id });
    setMessage('');
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (socket && activeRoom) {
      socket.emit('typing', { roomId: activeRoom._id });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { roomId: activeRoom._id });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Emoji quick-add
  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👀'];

  if (!activeRoom) return null;

  return (
    <div className={`p-4 border-t ${isDark ? 'bg-dark-sidebar border-white/10' : 'bg-white border-gray-200'}`}>
      {/* Emoji bar */}
      <div className="flex gap-1 mb-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => setMessage((prev) => prev + emoji)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110 ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <form id="message-form" onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            id="message-input"
            ref={inputRef}
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${activeRoom.name}...`}
            rows={1}
            className={`w-full px-4 py-3 rounded-xl border resize-none transition-all input-focus-ring ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
            }`}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Audio recorder button */}
        <AudioRecorder activeRoom={activeRoom} />

        <button
          id="send-btn"
          type="submit"
          disabled={!message.trim()}
          className="px-5 py-3 rounded-xl gradient-accent text-white font-medium
                     hover:opacity-90 transition-all transform hover:scale-105
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                     flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
