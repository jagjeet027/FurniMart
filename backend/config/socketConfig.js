// socketConfig.js
import { Server } from 'socket.io';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    path: '/socket.io'
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('selectIssue', (key) => {
      // Handle issue selection
      const response = {
        issue: key,
        response: 'Your response here'
      };
      socket.emit('issueResponse', response);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};