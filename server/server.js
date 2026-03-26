require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

// Import models for seeding
const Room = require('./models/Room');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Online users endpoint
app.get('/api/users/online', async (req, res) => {
  try {
    const users = await User.find({ isOnline: true }).select('username avatar isOnline lastSeen');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.io
socketHandler(io);

// Seed default rooms
const seedRooms = async () => {
  const defaultRooms = [
    { name: 'general', description: 'General discussion for everyone' },
    { name: 'tech-talk', description: 'Talk about technology and programming' },
    { name: 'random', description: 'Random conversations and fun' },
    { name: 'announcements', description: 'Important announcements and updates' },
  ];

  for (const room of defaultRooms) {
    const exists = await Room.findOne({ name: room.name });
    if (!exists) {
      await Room.create(room);
      console.log(`📌 Created default room: #${room.name}`);
    }
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedRooms();

  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
  });
};

startServer();
