import { useContext } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { ChatContext } from '../../context/ChatContext';
import Avatar from '../UI/Avatar';

const OnlineUsers = () => {
  const { onlineUsers } = useSocket();
  const { theme } = useContext(ChatContext);

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Active Members ({onlineUsers.length})
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-center py-6 text-slate-400 glass-card rounded-xl">
            No other members online
          </p>
        ) : (
          onlineUsers.map((u, i) => (
            <motion.div
              key={u.userId || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01, x: 2 }}
              className="flex items-center gap-3 p-2 rounded-xl glass-card hover:border-emerald-500/30 transition-all cursor-pointer group"
            >
              <div className="relative">
                <Avatar username={u.username} avatar={u.avatar} size="sm" isOnline={true} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate block">
                  {u.username}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-medium">Online now</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
