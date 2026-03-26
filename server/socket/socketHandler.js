const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const roomHandler = require('./roomHandler');

// Track online users: Map<socketId, { userId, username, avatar }>
const onlineUsers = new Map();
// Track which rooms each socket is in: Map<socketId, Set<roomId>>
const userRooms = new Map();

const socketHandler = (io) => {
  // Middleware: authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`🟢 User connected: ${user.username} (${socket.id})`);

    // Mark user as online
    onlineUsers.set(socket.id, {
      userId: user._id.toString(),
      username: user.username,
      avatar: user.avatar,
    });
    userRooms.set(socket.id, new Set());

    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // Broadcast online users
    const broadcastOnlineUsers = () => {
      const users = Array.from(onlineUsers.values());
      // Deduplicate by userId
      const unique = [...new Map(users.map((u) => [u.userId, u])).values()];
      io.emit('online_users', unique);
    };

    broadcastOnlineUsers();

    // Register room handlers
    roomHandler(io, socket);

    // Track room joins for notifications
    socket.on('join_room', () => {
      // The actual join_room logic is in roomHandler, but we also track here
      // We use a middleware-like approach by hooking into the socket.rooms
    });

    // Override the default join to track rooms
    const originalJoin = socket.join.bind(socket);
    socket.join = (room) => {
      userRooms.get(socket.id)?.add(room);
      return originalJoin(room);
    };

    const originalLeave = socket.leave.bind(socket);
    socket.leave = (room) => {
      userRooms.get(socket.id)?.delete(room);
      return originalLeave(room);
    };

    // Handle sending messages
    socket.on('send_message', async ({ content, roomId, type = 'text' }) => {
      try {
        const message = await Message.create({
          content,
          sender: user._id,
          room: roomId,
          type,
          readBy: [user._id],
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('readBy', 'username');

        io.to(roomId).emit('receive_message', populatedMessage);

        // Send notification to users NOT in this room
        const senderRooms = userRooms.get(socket.id) || new Set();
        for (const [sid, userData] of onlineUsers.entries()) {
          const theirRooms = userRooms.get(sid) || new Set();
          if (userData.userId !== user._id.toString() && !theirRooms.has(roomId)) {
            io.to(sid).emit('new_notification', {
              type: 'message',
              roomId,
              roomName: '', // Will be resolved on client
              sender: user.username,
              content: content.substring(0, 50),
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle voice messages
    socket.on('send_voice_message', async ({ audioData, roomId }) => {
      try {
        const message = await Message.create({
          content: '🎤 Voice message',
          audioUrl: audioData,
          sender: user._id,
          room: roomId,
          type: 'voice',
          readBy: [user._id],
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('readBy', 'username');

        io.to(roomId).emit('receive_message', populatedMessage);

        // Send notification to users NOT in this room
        for (const [sid, userData] of onlineUsers.entries()) {
          const theirRooms = userRooms.get(sid) || new Set();
          if (userData.userId !== user._id.toString() && !theirRooms.has(roomId)) {
            io.to(sid).emit('new_notification', {
              type: 'voice',
              roomId,
              roomName: '',
              sender: user.username,
              content: '🎤 Voice message',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send voice message' });
      }
    });

    // Handle profile updates broadcast
    socket.on('profile_updated', (profileData) => {
      // Update the onlineUsers map
      const userData = onlineUsers.get(socket.id);
      if (userData) {
        if (profileData.username) userData.username = profileData.username;
        if (profileData.avatar !== undefined) userData.avatar = profileData.avatar;
        onlineUsers.set(socket.id, userData);
      }

      // Broadcast to all connected clients
      io.emit('user_profile_updated', {
        userId: user._id,
        username: profileData.username || user.username,
        avatar: profileData.avatar !== undefined ? profileData.avatar : user.avatar,
        bio: profileData.bio || '',
      });

      broadcastOnlineUsers();
    });

    // Handle message read receipts
    socket.on('mark_read', async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { $addToSet: { readBy: user._id } },
          { new: true }
        ).populate('readBy', 'username');

        if (message) {
          io.to(message.room.toString()).emit('message_read', {
            messageId: message._id,
            readBy: message.readBy,
          });
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle message deletion
    socket.on('delete_message', async ({ messageId, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && message.sender.toString() === user._id.toString()) {
          message.isDeleted = true;
          message.content = 'This message has been deleted';
          message.audioUrl = '';
          await message.save();

          io.to(roomId).emit('message_deleted', { messageId });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle clear entire chat room
    socket.on('clear_chat', async ({ roomId }) => {
      try {
        // Delete all messages in the room from database
        await Message.deleteMany({ room: roomId });

        // Broadcast to all users in the room to clear their UI
        io.to(roomId).emit('chat_cleared', { roomId, clearedBy: user.username });
        console.log(`🧹 Chat cleared in room ${roomId} by ${user.username}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to clear chat' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('typing_status', {
        userId: user._id,
        username: user.username,
        isTyping: true,
      });
    });

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('typing_status', {
        userId: user._id,
        username: user.username,
        isTyping: false,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${user.username} (${socket.id})`);
      onlineUsers.delete(socket.id);
      userRooms.delete(socket.id);

      // Check if user has other active sockets
      const stillOnline = Array.from(onlineUsers.values()).some(
        (u) => u.userId === user._id.toString()
      );

      if (!stillOnline) {
        await User.findByIdAndUpdate(user._id, {
          isOnline: false,
          lastSeen: new Date(),
        });
      }

      broadcastOnlineUsers();
    });
  });
};

module.exports = socketHandler;
