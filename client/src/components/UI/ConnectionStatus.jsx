import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';

const ConnectionStatus = () => {
  const { theme } = useContext(ChatContext);
  const { isConnected, connectionError } = useSocket();

  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center relative z-40"
        >
          <div className="px-4 py-2 rounded-full glass-card border border-rose-500/30 bg-rose-950/60 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span>{connectionError || 'Connection lost. Reconnecting...'}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
