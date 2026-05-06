import { io } from 'socket.io-client';
import { SERVER_URL } from './config';

let socket = null;
let currentUserId = null;

export const getSocket = () => socket;

export const connectSocket = (userId) => {
  if (socket && socket.connected && currentUserId === userId) {
    console.log('connectSocket called for user:', userId);
    return socket;
  }

  if (socket) socket.disconnect();

  currentUserId = userId;
  socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('socket connected:', socket.id);
    socket.emit('join', userId.toString());
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });

  socket.on('reconnect', () => {
    console.log('socket reconnected');
    socket.emit('join', userId.toString());
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};