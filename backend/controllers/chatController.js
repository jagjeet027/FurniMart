import { ChatRoom, Message } from '../models/chat.js';
import Product from '../models/product.js';
import { User } from '../models/Users.js';
import { Manufacturer } from '../models/manufacturer.js';
import mongoose from 'mongoose';

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create or get existing chat room - FIXED VERSION
export const createOrGetChatRoom = async (req, res) => {
  try {
    const { productId, userId, userType, userName, userEmail, productName, manufacturerId, manufacturerName } = req.body;

    console.log('Creating chat room with data:', req.body);

    // Validate required fields
    if (!productId || !userId || !userType || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, userId, userType, userName'
      });
    }

    // Validate ObjectId format for productId
    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    // Validate ObjectId format for userId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Get product details to find manufacturer
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // FIXED: Handle manufacturer info stored as strings in Product model
    let actualManufacturerId = manufacturerId || product.manufacturer;
    const actualManufacturerName = manufacturerName || product.manufacturerInfo || 'Manufacturer';

    // Validate manufacturer ID exists
    if (!actualManufacturerId) {
      return res.status(400).json({
        success: false,
        message: 'Manufacturer information not found for this product'
      });
    }

    // FIXED: Since your products store manufacturer as string, we'll create a virtual manufacturer ObjectId
    // This approach doesn't require a separate Manufacturer collection
    let manufacturerObjectId;
    
    if (isValidObjectId(actualManufacturerId)) {
      // If it's already a valid ObjectId, use it
      manufacturerObjectId = new mongoose.Types.ObjectId(actualManufacturerId);
    } else {
      // If it's a string (like "Jaggie brand"), create a consistent ObjectId from it
      // This ensures the same manufacturer name always gets the same ObjectId
      const crypto = await import('crypto');
      const hash = crypto.createHash('md5').update(actualManufacturerId).digest('hex');
      // Take first 24 chars of hash to create a valid ObjectId
      const objectIdString = hash.substring(0, 24);
      manufacturerObjectId = new mongoose.Types.ObjectId(objectIdString);
    }
    
    // Convert string IDs to Mongoose ObjectIds for the query
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // FIXED: Check if chat room already exists between this user and manufacturer for this product
    let chatRoom = await ChatRoom.findOne({
      product: new mongoose.Types.ObjectId(productId),
      participants: {
        $all: [
          { $elemMatch: { userId: userObjectId, userType: userType } },
          { $elemMatch: { userId: manufacturerObjectId, userType: 'manufacturer' } }
        ]
      }
    });

    if (chatRoom) {
      console.log('Existing chat room found:', chatRoom._id);
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
        email: userEmail || 'user@example.com'
      },
      {
        userId: manufacturerObjectId,
        userType: 'manufacturer',
        name: actualManufacturerName,
        email: 'manufacturer@example.com'
      }
    ];

    chatRoom = new ChatRoom({
      participants: participants,
      product: new mongoose.Types.ObjectId(productId),
      productName: productName || product.name,
      manufacturerName: actualManufacturerName,
      unreadCount: new Map(),
      isActive: true
    });

    await chatRoom.save();
    console.log('New chat room created:', chatRoom._id);

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

// Get manufacturer's chat rooms - FIXED
export const getManufacturerChatRooms = async (req, res) => {
  try {
    const { manufacturerId } = req.params;

    console.log('Getting chat rooms for manufacturer:', manufacturerId);

    // FIXED: Handle both ObjectId and string manufacturer identifiers
    let manufacturerObjectId;
    
    if (isValidObjectId(manufacturerId)) {
      manufacturerObjectId = new mongoose.Types.ObjectId(manufacturerId);
    } else {
      // Create consistent ObjectId from string manufacturer name
      const crypto = await import('crypto');
      const hash = crypto.createHash('md5').update(manufacturerId).digest('hex');
      const objectIdString = hash.substring(0, 24);
      manufacturerObjectId = new mongoose.Types.ObjectId(objectIdString);
    }

    const chatRooms = await ChatRoom.find({
      participants: {
        $elemMatch: {
          userId: manufacturerObjectId,
          userType: 'manufacturer'
        }
      },
      isActive: true
    })
    .populate('product', 'name images price')
    .sort({ updatedAt: -1 });

    // Add last message and unread count for each chat room
    const chatRoomsWithDetails = await Promise.all(
      chatRooms.map(async (room) => {
        // Get last message
        const lastMessage = await Message.findOne({ chatRoom: room._id })
          .sort({ createdAt: -1 })
          .select('content sender createdAt');

        // Get unread count for this manufacturer
        const unreadCount = await Message.countDocuments({
          chatRoom: room._id,
          'sender.userId': { $ne: manufacturerObjectId },
          deliveryStatus: { $ne: 'read' }
        });

        const roomObj = room.toObject();
        if (lastMessage) {
          roomObj.lastMessage = {
            message: lastMessage.content,
            sender: lastMessage.sender.name,
            timestamp: lastMessage.createdAt
          };
        }
        
        // FIXED: Properly handle unreadCount as a regular object instead of Map
        roomObj.unreadCount = { [manufacturerId]: unreadCount };
        
        return roomObj;
      })
    );

    console.log(`Found ${chatRooms.length} chat rooms for manufacturer`);

    res.status(200).json({
      success: true,
      chatRooms: chatRoomsWithDetails
    });

  } catch (error) {
    console.error('Error getting manufacturer chat rooms:', error);
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

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const chatRooms = await ChatRoom.find({
      participants: {
        $elemMatch: {
          userId: new mongoose.Types.ObjectId(userId),
          userType: { $ne: 'manufacturer' }
        }
      },
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
      messages: messages.reverse() // Show oldest first
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

    console.log('Sending message:', req.body);

    if (!chatRoomId || !senderId || !senderType || !senderName || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!isValidObjectId(chatRoomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat room ID format'
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

    // FIXED: Better participant validation
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const isParticipant = chatRoom.participants.some(p => 
      p.userId.equals(senderObjectId) && p.userType === senderType
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
      content: content,
      deliveryStatus: 'sent',
      readBy: []
    });

    await message.save();

    // Update chat room's last message
    chatRoom.lastMessage = {
      message: content,
      timestamp: new Date(),
      sender: senderName
    };
    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    console.log('Message saved successfully:', message._id);

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

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;

    if (!isValidObjectId(chatRoomId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    const result = await Message.updateMany(
      { 
        chatRoom: chatRoomId,
        'sender.userId': { $ne: new mongoose.Types.ObjectId(userId) },
        deliveryStatus: { $ne: 'read' }
      },
      { 
        $set: { deliveryStatus: 'read' },
        $addToSet: { readBy: { userId: new mongoose.Types.ObjectId(userId), readAt: new Date() } }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
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