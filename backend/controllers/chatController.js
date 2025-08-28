import { ChatRoom, Message } from '../models/chat.js';
import Product from '../models/product.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create or get existing chat room
export const createOrGetChatRoom = async (req, res) => {
  try {
    const { productId, userId, userType, userName, userEmail } = req.body;

    // Validate required fields
    if (!productId || !userId || !userType || !userName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate ObjectId format for productId
    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Convert userId to ObjectId if it's a valid format, otherwise generate a new one
    let userObjectId;
    if (isValidObjectId(userId)) {
      userObjectId = userId;
    } else {
      // For demo purposes, generate a consistent ObjectId based on the string
      // In production, you should have proper user authentication with real ObjectIds
      userObjectId = new mongoose.Types.ObjectId();
      console.log(`Generated new ObjectId ${userObjectId} for user: ${userId}`);
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if chat room already exists for this product and user
    let chatRoom = await ChatRoom.findOne({
      product: productId,
      'participants.userId': userObjectId
    });

    if (chatRoom) {
      // Update participant info if changed
      const participantIndex = chatRoom.participants.findIndex(p => p.userId.toString() === userObjectId.toString());
      if (participantIndex !== -1) {
        chatRoom.participants[participantIndex].name = userName;
        chatRoom.participants[participantIndex].email = userEmail;
        await chatRoom.save();
      }

      return res.status(200).json({
        success: true,
        chatRoom: chatRoom
      });
    }

    // Create new chat room with both participants
    const participants = [
      {
        userId: userObjectId,
        userType: userType,
        name: userName,
        email: userEmail
      }
    ];

    // Add manufacturer as participant
    if (userType === 'wholeseller') {
      // Generate or use a consistent manufacturer ObjectId
      const manufacturerObjectId = new mongoose.Types.ObjectId();
      participants.push({
        userId: manufacturerObjectId,
        userType: 'manufacturer',
        name: product.manufacturer || 'Manufacturer',
        email: product.manufacturerEmail || 'manufacturer@example.com'
      });
    }

    chatRoom = new ChatRoom({
      participants: participants,
      product: productId,
      productName: product.name,
      manufacturerName: product.manufacturer || 'Manufacturer'
    });

    await chatRoom.save();

    res.status(201).json({
      success: true,
      chatRoom: chatRoom
    });

  } catch (error) {
    console.error('Error creating/getting chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's chat rooms
export const getUserChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;

    // Validate userId format
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const chatRooms = await ChatRoom.find({
      'participants.userId': userId,
      isActive: true
    })
    .populate('product', 'name images price')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chatRooms: chatRooms
    });

  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get messages for a chat room
export const getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate chatRoomId format
    if (!isValidObjectId(chatRoomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat room ID format'
      });
    }

    const messages = await Message.find({ chatRoom: chatRoomId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      messages: messages.reverse() // Reverse to show oldest first
    });

  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Send text message
export const sendMessage = async (req, res) => {
  try {
    const { chatRoomId, senderId, senderType, senderName, content } = req.body;

    if (!chatRoomId || !senderId || !senderType || !senderName || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate ObjectId formats
    if (!isValidObjectId(chatRoomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat room ID format'
      });
    }

    // Convert senderId to ObjectId if needed
    let senderObjectId;
    if (isValidObjectId(senderId)) {
      senderObjectId = senderId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender ID format'
      });
    }

    // Verify chat room exists and user is participant
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    const isParticipant = chatRoom.participants.some(p => 
      p.userId.toString() === senderObjectId.toString() && p.userType === senderType
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Create message
    const message = new Message({
      chatRoom: chatRoomId,
      sender: {
        userId: senderObjectId,
        userType: senderType,
        name: senderName
      },
      messageType: 'text',
      content: content
    });

    await message.save();

    // Update chat room's last message
    chatRoom.lastMessage = {
      message: content,
      timestamp: new Date(),
      sender: senderName
    };
    await chatRoom.save();

    // Emit to socket.io if available
    if (req.io) {
      req.io.to(chatRoomId).emit('new-message', message);
    }

    res.status(201).json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Send image message
export const sendImageMessage = async (req, res) => {
  try {
    const { chatRoomId, senderId, senderType, senderName, caption } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    if (!chatRoomId || !senderId || !senderType || !senderName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate ObjectId formats
    if (!isValidObjectId(chatRoomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat room ID format'
      });
    }

    let senderObjectId;
    if (isValidObjectId(senderId)) {
      senderObjectId = senderId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid sender ID format'
      });
    }

    // Verify chat room exists and user is participant
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    const isParticipant = chatRoom.participants.some(p => 
      p.userId.toString() === senderObjectId.toString() && p.userType === senderType
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    const imageUrl = `/uploads/chat-images/${req.file.filename}`;

    // Create message
    const message = new Message({
      chatRoom: chatRoomId,
      sender: {
        userId: senderObjectId,
        userType: senderType,
        name: senderName
      },
      messageType: 'image',
      content: caption || 'Image',
      imageUrl: imageUrl
    });

    await message.save();

    // Update chat room's last message
    chatRoom.lastMessage = {
      message: caption || 'Sent an image',
      timestamp: new Date(),
      sender: senderName
    };
    await chatRoom.save();

    // Emit to socket.io if available
    if (req.io) {
      req.io.to(chatRoomId).emit('new-message', message);
    }

    res.status(201).json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Error sending image message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;

    // Validate ObjectId formats
    if (!isValidObjectId(chatRoomId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    await Message.updateMany(
      { 
        chatRoom: chatRoomId,
        'sender.userId': { $ne: userId },
        isRead: false
      },
      { 
        $set: { isRead: true },
        $push: { readBy: { userId: userId, readAt: new Date() } }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export { upload };