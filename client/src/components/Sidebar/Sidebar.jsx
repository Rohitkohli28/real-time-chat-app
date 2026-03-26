import { useContext, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import RoomList from './RoomList';
import OnlineUsers from './OnlineUsers';

const Sidebar = () => {
  const { sidebarOpen, theme } = useContext(ChatContext);
  const [activeTab, setActiveTab] = useState('rooms');
  const isDark = theme === 'dark';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => {}}
        />
      )}

      <aside
        id="sidebar"
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
          fixed md:relative z-40 md:z-auto
          w-[260px] h-full flex flex-col
          border-r
          ${isDark
            ? 'bg-dark-sidebar border-white/10'
            : 'bg-white border-gray-200'
          }
        `}
      >
        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <button
            id="rooms-tab"
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'rooms'
                ? isDark
                  ? 'text-dark-accent border-b-2 border-dark-accent'
                  : 'text-light-accent border-b-2 border-light-accent'
                : isDark
                  ? 'text-dark-muted hover:text-white'
                  : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            💬 Rooms
          </button>
          <button
            id="online-tab"
            onClick={() => setActiveTab('online')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'online'
                ? isDark
                  ? 'text-dark-accent border-b-2 border-dark-accent'
                  : 'text-light-accent border-b-2 border-light-accent'
                : isDark
                  ? 'text-dark-muted hover:text-white'
                  : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            🟢 Online
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'rooms' ? <RoomList /> : <OnlineUsers />}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
