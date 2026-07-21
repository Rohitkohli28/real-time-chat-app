import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import Avatar from '../UI/Avatar';
import AudioPlayer from './AudioPlayer';
import { formatTime } from '../../utils/formatTime';

const MessageBubble = ({ message, isOwn, onDelete }) => {
  const { theme } = useContext(ChatContext);
  const [showActions, setShowActions] = useState(false);

  // System message
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] font-medium px-3 py-1 rounded-full glass-pill text-slate-400 border border-white/5">
          {message.content}
        </span>
      </div>
    );
  }

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-1`}>
        <div className="px-4 py-2 rounded-2xl text-xs italic text-slate-400 glass-card border border-white/5">
          🗑️ Message deleted
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-1.5 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex gap-2.5 max-w-[85%] sm:max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar (for incoming messages) */}
        {!isOwn && (
          <div className="flex-shrink-0 mt-auto mb-1">
            <Avatar
              username={message.sender?.username || '?'}
              avatar={message.sender?.avatar}
              size="sm"
            />
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name */}
          {!isOwn && (
            <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1 tracking-wide">
              {message.sender?.username || 'Unknown'}
            </span>
          )}

          {/* Bubble container */}
          <div className="relative group/bubble">
            <div
              className={`px-4 py-2.5 rounded-2xl relative text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap ${
                isOwn
                  ? 'glass-bubble-user rounded-br-xs'
                  : 'glass-bubble-other rounded-bl-xs'
              }`}
            >
              {message.type === 'voice' && message.audioUrl ? (
                <AudioPlayer audioUrl={message.audioUrl} />
              ) : (
                message.content
              )}
            </div>

            {/* Action context menu (Delete) */}
            {isOwn && showActions && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onDelete(message._id)}
                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 border border-white/10 transition-all shadow-md"
                title="Delete message"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Timestamp and Read Receipts */}
          <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
            <span className="text-[10px] text-slate-400/80 font-medium">
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              <span className={`text-[10px] font-bold ${
                message.readBy?.length > 1 ? 'text-cyan-400' : 'text-slate-500'
              }`}>
                {message.readBy?.length > 1 ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
