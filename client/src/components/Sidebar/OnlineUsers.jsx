import { useContext } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { ChatContext } from '../../context/ChatContext';
import Avatar from '../UI/Avatar';

const OnlineUsers = () => {
  const { onlineUsers } = useSocket();
  const { theme } = useContext(ChatContext);
  const isDark = theme === 'dark';

  return (
    <div className="p-3">
      <div className={`flex items-center gap-2 mb-3 ${isDark ? 'text-dark-muted' : 'text-gray-500'}`}>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">
          Online — {onlineUsers.length}
        </span>
      </div>

      <div className="space-y-1">
        {onlineUsers.length === 0 ? (
          <p className={`text-sm text-center py-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`}>
            No users online
          </p>
        ) : (
          onlineUsers.map((u) => (
            <div
              key={u.userId}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
              }`}
            >
              <Avatar username={u.username} avatar={u.avatar} size="sm" isOnline={true} />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {u.username}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
