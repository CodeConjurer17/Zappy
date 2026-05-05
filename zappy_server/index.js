require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect()
  .then(() => console.log('PostgreSQL connected!'))
  .catch(err => console.error('Database connection error:', err));

app.locals.db = pool;

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const friendRoutes = require('./routes/friends');

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);
app.use('/friends', friendRoutes);

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