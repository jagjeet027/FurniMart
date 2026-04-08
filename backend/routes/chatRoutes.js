import express from 'express';
import { 
  createChat, 
  sendMessage, 
  getChatById, 
  getUserChats, 
  getManufacturerChats,
  deleteChat,
  getUnreadCount
} from '../controllers/chatController.js';
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// IMPORTANT: Specific routes MUST come before parameterized routes
// Get unread count - MUST be before /:chatId
router.get('/unread/count', getUnreadCount);

// Get user's chats - MUST be before /:chatId
router.get('/user', getUserChats);

// Get manufacturer's chats - MUST be before /:chatId
router.get('/manufacturer', getManufacturerChats);

// Create or get chat
router.post('/', createChat);

// Get specific chat by ID - parameterized route comes last
router.get('/:chatId', getChatById);

// Send message in chat
router.post('/:chatId/messages', sendMessage);

// Delete chat
router.delete('/:chatId', deleteChat);

export default router;