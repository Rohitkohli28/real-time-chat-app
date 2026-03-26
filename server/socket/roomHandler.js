const Message = require('../models/Message');
const Room = require('../models/Room');

const roomHandler = (io, socket) => {
  // Join a room
  socket.on('join_room', async ({ roomId, userId }) => {
    try {
      socket.join(roomId);

      // Add user to room members if not already
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { members: userId },
      });

      // Load last 50 messages
      const messages = await Message.find({
        room: roomId,
        isDeleted: false,
      })
        .populate('sender', 'username avatar')
        .populate('readBy', 'username')
        .sort({ createdAt: -1 })
        .limit(50);

      socket.emit('room_history', messages.reverse());

      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId,
        roomId,
        message: 'A user has joined the room',
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a room
  socket.on('leave_room', ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user_left', {
      userId,
      roomId,
      message: 'A user has left the room',
    });
  });
};

module.exports = roomHandler;
