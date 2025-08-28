import express from 'express';
import {
  createOrGetChatRoom,
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  sendImageMessage,
  markMessagesAsRead,
  upload
} from '../controllers/chatController.js';

const router = express.Router();

// Create or get chat room
router.post('/room', createOrGetChatRoom);

// Get user's chat rooms
router.get('/rooms/:userId', getUserChatRooms);

// Get messages for a chat room
router.get('/messages/:chatRoomId', getChatMessages);

// Send text message
router.post('/message', sendMessage);

// Send image message
router.post('/message/image', upload.single('image'), sendImageMessage);

// Mark messages as read
router.patch('/messages/read', markMessagesAsRead);

export default router;