import { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';

const ConnectionStatus = () => {
  const { theme } = useContext(ChatContext);
  const { isConnected, connectionError } = useSocket();
  const isDark = theme === 'dark';

  if (isConnected) return null;

  return (
    <div className={`w-full px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 ${
      isDark
        ? 'bg-red-900/80 text-red-200 border-b border-red-500/30'
        : 'bg-red-50 text-red-700 border-b border-red-200'
    }`}>
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span>
        {connectionError || 'Connection lost. Reconnecting...'}
      </span>
    </div>
  );
};

export default ConnectionStatus;
