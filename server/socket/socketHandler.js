const User = require('../models/User');
const Message = require('../models/Message');
const roomHandler = require('./roomHandler');
const { verifyAccessToken, verifyRefreshToken } = require('../utils/tokens');

// Track online users: Map<socketId, { userId, username, avatar }>
const onlineUsers = new Map();
// Track which rooms each socket is in: Map<socketId, Set<roomId>>
const userRooms = new Map();

const socketHandler = (io) => {
  const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const key = parts.shift()?.trim();
      if (key) list[key] = decodeURIComponent(parts.join('='));
    });

    return list;
  };

  const authenticateWithRefreshToken = async (refreshToken) => {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.refreshToken !== refreshToken) {
      return null;
    }

    return user;
  };

  const rejectSocket = (next, message, code) => {
    const error = new Error(message);
    error.data = { code };
    return next(error);
  };

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      let token = cookies.accessToken;

      if (!token) {
        token = socket.handshake.auth?.token;
      }

      if (!token && socket.handshake.headers.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      let user = null;

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          user = await User.findById(decoded.id).select('-password');
        } catch (accessError) {
          console.log(`[socket] Access token unavailable or expired: ${accessError.message}`);
          try {
            user = await authenticateWithRefreshToken(token);
          } catch (refreshError) {
            console.log(`[socket] Handshake token is not a valid refresh token: ${refreshError.message}`);
          }
        }
      }

      if (!user && cookies.refreshToken) {
        user = await authenticateWithRefreshToken(cookies.refreshToken);
      }

      if (!user && socket.handshake.auth?.refreshToken) {
        user = await authenticateWithRefreshToken(socket.handshake.auth.refreshToken);
      }

      if (!token && !cookies.refreshToken && !socket.handshake.auth?.refreshToken) {
        console.log('[socket] Connection rejected: no token found');
        return rejectSocket(next, 'Authentication token missing', 'NO_TOKEN');
      }

      if (!user) {
        console.log('[socket] Connection rejected: user not found or refresh token invalid');
        return rejectSocket(next, 'Authentication failed', 'AUTH_FAILED');
      }

      socket.user = user;
      console.log(`[socket] Authenticated ${user.email}`);
      next();
    } catch (error) {
      console.log('[socket] Connection rejected:', error.message);
      rejectSocket(next, 'Authentication failed', 'AUTH_FAILED');
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`[socket] User connected: ${user.username} (${socket.id})`);

    onlineUsers.set(socket.id, {
      userId: user._id.toString(),
      username: user.username,
      avatar: user.avatar,
    });
    userRooms.set(socket.id, new Set());

    await User.findByIdAndUpdate(user._id, { isOnline: true });

    const broadcastOnlineUsers = () => {
      const users = Array.from(onlineUsers.values());
      const unique = [...new Map(users.map((u) => [u.userId, u])).values()];
      io.emit('online_users', unique);
    };

    broadcastOnlineUsers();
    roomHandler(io, socket);

    socket.on('join_room', () => {
      // Actual join_room handling is registered in roomHandler.
    });

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

        for (const [sid, userData] of onlineUsers.entries()) {
          const theirRooms = userRooms.get(sid) || new Set();
          if (userData.userId !== user._id.toString() && !theirRooms.has(roomId)) {
            io.to(sid).emit('new_notification', {
              type: 'message',
              roomId,
              roomName: '',
              sender: user.username,
              content: content.substring(0, 50),
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('[socket] Failed to send message:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('send_voice_message', async ({ audioData, roomId }) => {
      try {
        const message = await Message.create({
          content: 'Voice message',
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

        for (const [sid, userData] of onlineUsers.entries()) {
          const theirRooms = userRooms.get(sid) || new Set();
          if (userData.userId !== user._id.toString() && !theirRooms.has(roomId)) {
            io.to(sid).emit('new_notification', {
              type: 'voice',
              roomId,
              roomName: '',
              sender: user.username,
              content: 'Voice message',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('[socket] Failed to send voice message:', error.message);
        socket.emit('error', { message: 'Failed to send voice message' });
      }
    });

    socket.on('profile_updated', (profileData) => {
      const userData = onlineUsers.get(socket.id);
      if (userData) {
        if (profileData.username) userData.username = profileData.username;
        if (profileData.avatar !== undefined) userData.avatar = profileData.avatar;
        onlineUsers.set(socket.id, userData);
      }

      io.emit('user_profile_updated', {
        userId: user._id,
        username: profileData.username || user.username,
        avatar: profileData.avatar !== undefined ? profileData.avatar : user.avatar,
        bio: profileData.bio || '',
      });

      broadcastOnlineUsers();
    });

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
        console.error('[socket] Mark read error:', error.message);
      }
    });

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
        console.error('[socket] Failed to delete message:', error.message);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    socket.on('clear_chat', async ({ roomId }) => {
      try {
        await Message.deleteMany({ room: roomId });
        io.to(roomId).emit('chat_cleared', { roomId, clearedBy: user.username });
        console.log(`[socket] Chat cleared in room ${roomId} by ${user.username}`);
      } catch (error) {
        console.error('[socket] Failed to clear chat:', error.message);
        socket.emit('error', { message: 'Failed to clear chat' });
      }
    });

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

    socket.on('disconnect', async () => {
      console.log(`[socket] User disconnected: ${user.username} (${socket.id})`);
      onlineUsers.delete(socket.id);
      userRooms.delete(socket.id);

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
