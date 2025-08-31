import express from 'express';
import {
  createOrGetChatRoom,
  getUserChatRooms,
  getManufacturerChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead
} from '../controllers/chatController.js';

const router = express.Router();

// Create or get chat room
router.post('/room', createOrGetChatRoom);

// Get user's chat rooms
router.get('/user/:userId/rooms', getUserChatRooms);

// Get manufacturer's chat rooms
router.get('/manufacturer/:manufacturerId/rooms', getManufacturerChatRooms);

// Get messages for a chat room
router.get('/messages/:chatRoomId', getChatMessages);

// Send message
router.post('/message', sendMessage);

// Mark messages as read
router.post('/messages/read', markMessagesAsRead);

export default router;