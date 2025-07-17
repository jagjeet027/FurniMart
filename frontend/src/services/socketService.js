// socketService.js
import io from 'socket.io-client';

export const  socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"], // Polling bhi enable rakho
  withCredentials: true,
});
// export const socket = io(SOCKET_URL, {
//   reconnection: true,
//   reconnectionDelay: 1000,
//   reconnectionDelayMax: 5000,
//   reconnectionAttempts: 5
// });

socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected to socket server after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});