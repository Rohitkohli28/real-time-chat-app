import { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = () => {
  const { messages, activeRoom, addMessage, setRoomMessages, removeMessage, typingUsers, setTypingUsers, incrementUnread, theme } = useContext(ChatContext);
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  useEffect(() => {
    if (!socket) return;

    socket.on('room_history', (history) => {
      setRoomMessages(history);
    });

    socket.on('receive_message', (message) => {
      addMessage(message);
      if (activeRoom && message.room !== activeRoom._id) {
        incrementUnread(message.room);
      }
    });

    socket.on('message_deleted', ({ messageId }) => {
      removeMessage(messageId);
    });

    socket.on('chat_cleared', ({ roomId }) => {
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

    return () => {
      socket.off('room_history');
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('chat_cleared');
      socket.off('typing_status');
    };
  }, [socket, activeRoom]);

  // Empty state when no channel selected
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-transparent">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md relative z-10 glass-card p-8 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="w-20 h-20 rounded-3xl gradient-accent p-0.5 mx-auto mb-6 shadow-glow-accent">
            <div className="w-full h-full bg-slate-950/60 backdrop-blur-md rounded-[22px] flex items-center justify-center">
              <svg className="w-10 h-10 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
            Welcome to <span className="gradient-text">NexusChat</span>
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Select a channel from the left sidebar to connect with members, stream audio messages, and exchange real-time updates.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 glass-pill px-4 py-2 rounded-full w-fit mx-auto border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{onlineUsers.length} member(s) online right now</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
      {/* Sticky Channel Header Bar */}
      <div className="px-6 py-3.5 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-accent p-0.5 flex items-center justify-center text-white font-bold text-sm shadow-md">
            #
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-wide">{activeRoom.name}</h2>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                Active
              </span>
            </div>
            {activeRoom.description && (
              <p className="text-xs text-slate-400 truncate max-w-sm">{activeRoom.description}</p>
            )}
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-xl glass-pill text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs flex items-center gap-1.5"
            title="Clear Chat History"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal Banner */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-rose-950/80 border-b border-rose-500/30 backdrop-blur-md flex items-center justify-between px-6 z-20"
          >
            <span className="text-xs font-semibold text-rose-200">
              Clear all messages in #{activeRoom.name}? This action cannot be undone.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (socket && activeRoom) {
                    socket.emit('clear_chat', { roomId: activeRoom._id });
                  }
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Feed Area */}
      <div
        id="chat-window"
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative z-10"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-xs font-semibold">No messages in #{activeRoom.name} yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Send a message or voice note to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
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
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
