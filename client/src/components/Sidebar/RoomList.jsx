import { useContext, useState, useEffect } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const RoomList = () => {
  const { rooms, setRooms, activeRoom, setActiveRoom, clearUnread, unreadCounts, theme, setRoomMessages } = useContext(ChatContext);
  const { socket } = useSocket();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const isDark = theme === 'dark';

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

  const handleJoinRoom = (room) => {
    if (activeRoom?._id === room._id) return;

    // Leave current room
    if (activeRoom && socket) {
      socket.emit('leave_room', {
        roomId: activeRoom._id,
        userId: user._id,
      });
    }

    // Join new room
    if (socket) {
      socket.emit('join_room', {
        roomId: room._id,
        userId: user._id,
      });
    }

    setActiveRoom(room);
    clearUnread(room._id);
    setRoomMessages([]);
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
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="room-search"
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all input-focus-ring ${
              isDark
                ? 'bg-white/5 border border-white/10 text-white placeholder-white/30'
                : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredRooms.map((room) => (
          <button
            key={room._id}
            id={`room-${room.name}`}
            onClick={() => handleJoinRoom(room)}
            className={`w-full text-left px-3 py-3 rounded-xl mb-1 transition-all group ${
              activeRoom?._id === room._id
                ? isDark
                  ? 'bg-dark-accent/20 text-white'
                  : 'bg-light-accent/10 text-light-accent'
                : isDark
                  ? 'hover:bg-white/5 text-dark-muted hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-lg ${activeRoom?._id === room._id ? '' : 'opacity-60 group-hover:opacity-100'}`}>
                  #
                </span>
                <span className="font-medium truncate">{room.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCounts[room._id] > 0 && (
                  <span className="bg-dark-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCounts[room._id] > 9 ? '9+' : unreadCounts[room._id]}
                  </span>
                )}
                <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-gray-400'}`}>
                  {room.members?.length || 0}
                  <span className="ml-1">👤</span>
                </span>
              </div>
            </div>
            {room.description && (
              <p className={`text-xs mt-1 truncate ${isDark ? 'text-dark-muted/60' : 'text-gray-400'}`}>
                {room.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Create room */}
      <div className={`p-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        {showCreate ? (
          <form onSubmit={handleCreateRoom} className="space-y-2">
            <input
              id="new-room-name"
              type="text"
              placeholder="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              required
              className={`w-full px-3 py-2 rounded-lg text-sm input-focus-ring ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />
            <input
              id="new-room-desc"
              type="text"
              placeholder="Description (optional)"
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm input-focus-ring ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-all"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            id="create-room-btn"
            onClick={() => setShowCreate(true)}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-white/5 text-dark-muted hover:bg-white/10 hover:text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Room
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomList;
