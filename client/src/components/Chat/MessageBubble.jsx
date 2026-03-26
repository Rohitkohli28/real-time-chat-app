import { useContext, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import Avatar from '../UI/Avatar';
import AudioPlayer from './AudioPlayer';
import { formatTime } from '../../utils/formatTime';

const MessageBubble = ({ message, isOwn, onDelete }) => {
  const { theme } = useContext(ChatContext);
  const [showActions, setShowActions] = useState(false);
  const isDark = theme === 'dark';

  // System message
  if (message.type === 'system') {
    return (
      <div className="flex justify-center animate-fade-in">
        <span className={`text-xs px-3 py-1 rounded-full ${
          isDark ? 'bg-white/5 text-dark-muted' : 'bg-gray-200 text-gray-500'
        }`}>
          {message.content}
        </span>
      </div>
    );
  }

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
        <div className={`px-4 py-2 rounded-2xl text-sm italic ${
          isDark ? 'bg-white/5 text-dark-muted' : 'bg-gray-100 text-gray-400'
        }`}>
          🗑️ This message has been deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar (only for others) */}
        {!isOwn && (
          <div className="flex-shrink-0 mt-auto">
            <Avatar
              username={message.sender?.username || '?'}
              avatar={message.sender?.avatar}
              size="sm"
            />
          </div>
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name (only for others) */}
          {!isOwn && (
            <span className={`text-xs font-medium mb-1 ml-1 ${
              isDark ? 'text-dark-muted' : 'text-gray-500'
            }`}>
              {message.sender?.username || 'Unknown'}
            </span>
          )}

          {/* Message bubble */}
          <div className="relative group">
            <div
              className={`px-4 py-2.5 rounded-2xl relative ${
                isOwn
                  ? `gradient-accent text-white message-own ${
                      isDark ? '' : ''
                    }`
                  : `${
                      isDark ? 'bg-dark-bubble text-white' : 'bg-light-bubble text-gray-800'
                    } message-other`
              }`}
            >
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.type === 'voice' && message.audioUrl ? (
                  <AudioPlayer audioUrl={message.audioUrl} />
                ) : (
                  message.content
                )}
              </p>
            </div>

            {/* Delete button (own messages only) */}
            {isOwn && showActions && (
              <button
                onClick={() => onDelete(message._id)}
                className={`absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                  isDark ? 'hover:bg-white/10 text-dark-muted hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                }`}
                title="Delete message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Timestamp + Read receipts */}
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
            <span className={`text-[10px] ${isDark ? 'text-dark-muted/60' : 'text-gray-400'}`}>
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              <span className={`text-[10px] ${message.readBy?.length > 1 ? 'text-blue-400' : isDark ? 'text-dark-muted/60' : 'text-gray-400'}`}>
                {message.readBy?.length > 1 ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
