const Room = require('../models/Room');

// @desc    Get all public rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;

    const roomExists = await Room.findOne({ name: name.toLowerCase().replace(/\s+/g, '-') });
    if (roomExists) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const room = await Room.create({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      creator: req.user._id,
      members: [req.user._id],
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/:id/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is already a member
    if (room.members.includes(req.user._id)) {
      return res.json({ message: 'Already a member', room });
    }

    room.members.push(req.user._id);
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');

    res.json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRooms, createRoom, getRoomById, joinRoom };
