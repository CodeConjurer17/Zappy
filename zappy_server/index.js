require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes per IP
  message: { error: 'too many requests, please try again later' }
});

app.use(cors({
  origin: 'https://zappy.gasparici.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(limiter);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect()
  .then(() => console.log('PostgreSQL connected!'))
  .catch(err => console.error('Database connection error:', err));

app.locals.db = pool;

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const friendRoutes = require('./routes/friends');
const authMiddleware = require('./middleware/auth');

app.use('/auth', authRoutes);
app.use('/messages', authMiddleware, messageRoutes);
app.use('/friends', authMiddleware, friendRoutes);

app.get('/health', (req, res) => res.json({ status: 'Zappy server running!' }));

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('user joined:', userId);
  });

  socket.on('send_message', (data) => {
    const { toUserId, message } = data;
    const recipientSocketId = onlineUsers.get(toUserId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', message);
    }
  });

  socket.on('friend_request', (data) => {
    const { toUserId } = data;
    const recipientSocketId = onlineUsers.get(toUserId.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('friend_request_received');
    }
  });

  socket.on('friend_accepted', (data) => {
    const { toUserId } = data;
    const recipientSocketId = onlineUsers.get(toUserId.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('friend_accepted');
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) onlineUsers.delete(userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Zappy server running on port ${PORT}`);
});