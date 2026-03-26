# 🚀 ChatApp — Real-Time Chat with Voice Commands

A full-stack real-time chat application with voice command support, built with React, Node.js, Socket.io, and MongoDB.

---

## 📋 Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **MongoDB** 6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Git** ([download](https://git-scm.com/))
- Modern browser with **microphone** support (Chrome, Edge recommended for Web Speech API)

---

## 📁 Project Structure

```
ChatApp/
├── client/           # React Frontend (Vite)
│   ├── src/
│   │   ├── components/   # UI, Auth, Chat, Sidebar, Voice
│   │   ├── context/      # AuthContext, ChatContext, SocketContext
│   │   ├── hooks/        # useAuth, useSocket, useVoice
│   │   ├── pages/        # Home, Login, Register, Chat
│   │   ├── services/     # API (Axios), Socket.io client
│   │   └── utils/        # formatTime, voiceCommands
│   └── ...
├── server/           # Node.js Backend (Express)
│   ├── config/       # MongoDB connection
│   ├── controllers/  # Auth, Room, Message controllers
│   ├── middleware/    # JWT auth, error handling
│   ├── models/       # User, Room, Message (Mongoose)
│   ├── routes/       # REST API routes
│   ├── socket/       # Socket.io event handlers
│   └── server.js     # Entry point
└── README.md
```

---

## ⚙️ Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ChatApp

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run in Development

```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start the server
cd server
npm run dev

# Terminal 3: Start the client
cd client
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 🎤 Voice Commands

Click the **microphone button** (bottom-right) and speak:

| Category | Command | Action |
|----------|---------|--------|
| **Messaging** | "send message hello world" | Sends "hello world" |
| | "clear message" | Clears input field |
| | "delete last message" | Deletes your last message |
| **Navigation** | "go to general" | Switches to #general |
| | "switch room tech talk" | Switches to #tech-talk |
| **UI** | "scroll up / down" | Scrolls chat |
| | "toggle sidebar" | Show/hide sidebar |
| | "dark mode" / "light mode" | Switch theme |
| **Actions** | "log out" | Logs out |
| | "who is online" | Shows online count |
| | "help" | Lists all commands |

> **Note:** Voice commands require Chrome/Edge and microphone permission. Confidence threshold is 0.7.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (auth) |
| GET | `/api/rooms` | Get all public rooms (auth) |
| POST | `/api/rooms` | Create new room (auth) |
| GET | `/api/rooms/:id` | Get room details (auth) |
| POST | `/api/rooms/:id/join` | Join a room (auth) |
| GET | `/api/messages/:roomId` | Get last 50 messages (auth) |
| DELETE | `/api/messages/:id` | Delete own message (auth) |
| GET | `/api/users/online` | Get online users |

---

## 🎨 Themes

- **Dark Mode** (default): Deep navy with crimson accents (`#1a1a2e`, `#e94560`)
- **Light Mode**: Clean white with purple accents (`#f5f5f5`, `#6c63ff`)

Toggle via the navbar button or say **"dark mode"** / **"light mode"**.

---

## 🚢 Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set root directory to `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add environment variables (use MongoDB Atlas URI)

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Set root directory to `client`
3. Framework Preset: **Vite**
4. Add environment variables pointing to your Render backend URL

---

## ✨ Features

- ✅ JWT authentication (register, login, auto-login)
- ✅ Real-time messaging via Socket.io
- ✅ Chat rooms with create/join/leave
- ✅ Typing indicators
- ✅ Read receipts (✓ sent, ✓✓ read)
- ✅ Message deletion (own messages)
- ✅ Emoji support
- ✅ Online user tracking
- ✅ Voice commands (15+ commands)
- ✅ Dark/Light themes
- ✅ Mobile responsive
- ✅ Default rooms auto-seeded

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Node.js, Express 4 |
| Real-time | Socket.io 4 |
| Database | MongoDB, Mongoose 7 |
| Auth | JWT, bcryptjs |
| Voice | Web Speech API |
| Routing | React Router v6 |
| State | Context API |
| HTTP | Axios |

---

## 📌 Known Limitations

- Voice commands require **Chrome/Edge** (Firefox/Safari have limited Web Speech API support)
- MongoDB must be running locally (or use Atlas connection string)
- No file/image uploads (text-only messages)
- No private/direct messaging (public rooms only)
- No message editing (only deletion)

---

## 🚀 Suggested Next Features

- 📷 Image/file message attachments
- 🔔 Push notifications
- 👤 Direct messaging (1:1)
- ✏️ Message editing
- 🔍 Message search
- 📊 User profiles with bio
- 🌐 i18n / multi-language support

---

**Built with ❤️ using React, Node.js, Socket.io, and MongoDB**
