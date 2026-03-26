const Message = require('../models/Message');

// @desc    Get messages for a room (last 50)
// @route   GET /api/messages/:roomId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      room: req.params.roomId,
      isDeleted: false,
    })
      .populate('sender', 'username avatar')
      .populate('readBy', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    // Return in chronological order
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a message (own only)
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.content = 'This message has been deleted';
    await message.save();

    res.json({ message: 'Message deleted', id: message._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all messages in a room
// @route   DELETE /api/messages/room/:roomId
// @access  Private
const clearRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Delete all messages in this room from database
    const result = await Message.deleteMany({ room: roomId });

    res.json({
      message: 'Chat cleared successfully',
      deletedCount: result.deletedCount,
      roomId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, deleteMessage, clearRoomMessages };
