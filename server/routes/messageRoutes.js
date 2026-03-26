const express = require('express');
const router = express.Router();
const { getMessages, deleteMessage, clearRoomMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Get messages for a room
router.get('/:roomId', protect, getMessages);

// Delete a single message (own only)
router.delete('/:id', protect, deleteMessage);

// Clear all messages in a room
router.delete('/room/:roomId', protect, clearRoomMessages);

module.exports = router;
