import { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import AudioRecorder from './AudioRecorder';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { activeRoom, theme } = useContext(ChatContext);
  const { socket } = useSocket();
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (socket && activeRoom) {
      socket.emit('typing', { roomId: activeRoom._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

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

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🚀', '✨', '⚡'];

  if (!activeRoom) return null;

  return (
    <div className="p-3 sm:p-4 border-t border-white/10 bg-white/5 backdrop-blur-md relative z-20 shrink-0">
      {/* Quick Emoji Bar Toggle Drawer */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="flex gap-1.5 p-2 mb-2 rounded-2xl glass-card border border-white/10 w-fit backdrop-blur-xl shadow-xl"
          >
            {emojis.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                whileHover={{ scale: 1.25, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMessage((prev) => prev + emoji)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-sm transition-all"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form id="message-form" onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Emoji Bar Toggle Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`p-2.5 rounded-xl glass-pill transition-all ${
            showEmojiPicker ? 'text-pink-400 border-pink-500/40 bg-pink-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Quick Emojis"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>

        {/* Input Textarea Container */}
        <div className="flex-1 relative">
          <textarea
            id="message-input"
            ref={inputRef}
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${activeRoom.name}...`}
            rows={1}
            className="w-full px-4 py-3 rounded-2xl glass-input text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none resize-none"
            style={{ minHeight: '46px', maxHeight: '120px' }}
          />
        </div>

        {/* Voice recorder button */}
        <AudioRecorder activeRoom={activeRoom} />

        {/* Gradient Send button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          id="send-btn"
          type="submit"
          disabled={!message.trim()}
          className="px-5 py-3 rounded-2xl gradient-accent text-white font-extrabold text-xs sm:text-sm
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none
                     flex items-center gap-2 shadow-glow-accent transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </motion.button>
      </form>
    </div>
  );
};

export default MessageInput;
