import { io } from 'socket.io-client';
import { SERVER_URL } from './config';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (userId) => {
  if (socket) socket.disconnect();
  socket = io(SERVER_URL, { transports: ['websocket'] });
  socket.on('connect', () => {
    socket.emit('join', userId.toString());
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};