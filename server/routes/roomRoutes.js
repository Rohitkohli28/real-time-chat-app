const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  getRoomById,
  joinRoom,
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.get('/:id', protect, getRoomById);
router.post('/:id/join', protect, joinRoom);

module.exports = router;
