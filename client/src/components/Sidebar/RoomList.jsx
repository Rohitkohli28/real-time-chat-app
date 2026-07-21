import { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const RoomList = () => {
  const { rooms, setRooms, activeRoom, setActiveRoom, clearUnread, unreadCounts, theme, setRoomMessages, setSidebarOpen } = useContext(ChatContext);
  const { socket } = useSocket();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get('/rooms');
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };
    fetchRooms();
  }, [setRooms]);

  // Global Ctrl+K / Cmd+K listener to focus room search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('room-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleJoinRoom = (room) => {
    if (activeRoom?._id === room._id) return;

    if (activeRoom && socket) {
      socket.emit('leave_room', {
        roomId: activeRoom._id,
        userId: user._id,
      });
    }

    if (socket) {
      socket.emit('join_room', {
        roomId: room._id,
        userId: user._id,
      });
    }

    setActiveRoom(room);
    clearUnread(room._id);
    setRoomMessages([]);
    
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/rooms', {
        name: newRoomName,
        description: newRoomDesc,
      });
      setRooms((prev) => [...prev, data]);
      setNewRoomName('');
      setNewRoomDesc('');
      setShowCreate(false);
      handleJoinRoom(data);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Floating Glass Search */}
      <div className="pt-2 px-1">
        <div className="relative group">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="room-search"
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-xl text-xs font-medium glass-input text-slate-100 placeholder-slate-400 outline-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-300 border border-white/10 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-1 space-y-1">
        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Channels ({filteredRooms.length})</span>
        </div>

        {filteredRooms.map((room) => {
          const isActive = activeRoom?._id === room._id;
          const unread = unreadCounts[room._id] || 0;

          return (
            <motion.button
              key={room._id}
              id={`room-${room.name}`}
              onClick={() => handleJoinRoom(room)}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-3 rounded-xl transition-all relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-transparent border border-pink-500/30 text-white shadow-glow-accent'
                  : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              {/* Active Room Indicator Light Bar */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full gradient-accent shadow-glow-accent"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive ? 'gradient-accent text-white shadow-md' : 'bg-white/5 text-slate-400 group-hover:text-pink-400'
                  }`}>
                    #
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs tracking-wide truncate block">{room.name}</span>
                    {room.description && (
                      <p className="text-[10px] text-slate-400 truncate opacity-70 group-hover:opacity-100 transition-opacity">
                        {room.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {unread > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="gradient-accent text-white text-[10px] rounded-full px-2 py-0.5 font-extrabold shadow-glow-accent"
                    >
                      {unread > 9 ? '9+' : unread}
                    </motion.span>
                  )}
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    {room.members?.length || 0} 👤
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Create Room Footer Form */}
      <div className="pt-2 border-t border-white/10 px-1">
        <AnimatePresence mode="wait">
          {showCreate ? (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onSubmit={handleCreateRoom} 
              className="space-y-2 p-3 rounded-xl glass-card border border-white/10"
            >
              <h4 className="text-xs font-bold text-slate-200">Create New Channel</h4>
              <input
                id="new-room-name"
                type="text"
                placeholder="Channel name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg text-xs glass-input text-slate-100 outline-none"
              />
              <input
                id="new-room-desc"
                type="text"
                placeholder="Description (optional)"
                value={newRoomDesc}
                onChange={(e) => setNewRoomDesc(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs glass-input text-slate-100 outline-none"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg gradient-accent text-white text-xs font-bold hover:opacity-90 transition-all shadow-glow-accent"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="create-room-btn"
              onClick={() => setShowCreate(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-dashed border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              <div className="w-5 h-5 rounded-md gradient-accent flex items-center justify-center text-white text-xs shadow-sm group-hover:rotate-90 transition-transform">
                +
              </div>
              Create Channel
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoomList;
