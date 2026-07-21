import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import RoomList from './RoomList';
import OnlineUsers from './OnlineUsers';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, theme } = useContext(ChatContext);
  const [activeTab, setActiveTab] = useState('rooms');

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        id="sidebar"
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          fixed md:relative z-40 md:z-auto
          w-[280px] sm:w-[300px] h-full flex flex-col
          rounded-2xl glass-panel shadow-2xl border border-white/10 overflow-hidden shrink-0
        `}
      >
        {/* Navigation Tabs Header */}
        <div className="p-2 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex rounded-xl glass-card p-1 relative">
            <button
              id="rooms-tab"
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${
                activeTab === 'rooms' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💬 Channels</span>
            </button>
            <button
              id="online-tab"
              onClick={() => setActiveTab('online')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${
                activeTab === 'online' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🟢 Members</span>
            </button>

            {/* Sliding Pill Indicator */}
            <motion.div
              layout
              className="absolute inset-y-1 rounded-lg gradient-accent shadow-glow-accent z-0"
              initial={false}
              animate={{
                left: activeTab === 'rooms' ? '4px' : '50%',
                width: 'calc(50% - 4px)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>
        </div>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'rooms' ? <RoomList /> : <OnlineUsers />}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
