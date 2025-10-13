import asyncHandler from 'express-async-handler';
import Chat from '../models/Chat.js';
import Product from '../models/product.js';
import { Manufacturer } from '../models/manufacturer.js';
import { User } from '../models/Users.js';

// @desc    Create or get existing chat
// @route   POST /api/chats
// @access  Private
export const createChat = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    console.log('=== CREATE CHAT REQUEST ===');
    console.log('User ID:', userId);
    console.log('Product ID:', productId);

    // Validate product exists
    const product = await Product.findById(productId)
      .populate('manufacturerId')
      .populate('uploadedBy');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is trying to chat with their own product
    if (product.uploadedBy._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot chat about your own product'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIXED: Check if chat already exists - use findOne with exact match
    let chat = await Chat.findOne({
      userId: userId,
      manufacturerId: product.manufacturerId._id,
      productId: productId
    }).populate('productId', 'name images price');

    if (chat) {
      console.log('✅ Existing chat found:', chat._id);
      return res.status(200).json({
        success: true,
        message: 'Chat retrieved successfully',
        data: chat
      });
    }

    // FIXED: Create new chat with proper error handling
    try {
      chat = new Chat({
        productId,
        productName: product.name,
        userId,
        userName: user.name,
        manufacturerId: product.manufacturerId._id,
        manufacturerUserId: product.uploadedBy._id,
        manufacturerName: product.manufacturerId.businessName,
        messages: [],
        status: 'active'
      });

      await chat.save();
      console.log('✅ New chat created:', chat._id);

      // Populate the product details before sending response
      chat = await Chat.findById(chat._id).populate('productId', 'name images price');

      res.status(201).json({
        success: true,
        message: 'Chat created successfully',
        data: chat
      });
    } catch (saveError) {
      // Handle race condition - another request might have created the chat
      if (saveError.code === 11000) {
        console.log('⚠️ Chat was created by another request, fetching existing chat');
        
        chat = await Chat.findOne({
          userId: userId,
          manufacturerId: product.manufacturerId._id,
          productId: productId
        }).populate('productId', 'name images price');

        if (chat) {
          return res.status(200).json({
            success: true,
            message: 'Chat retrieved successfully',
            data: chat
          });
        }
      }
      throw saveError;
    }

  } catch (error) {
    console.error('❌ Error creating chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Send message in chat
// @route   POST /api/chats/:chatId/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    console.log('=== SEND MESSAGE ===');
    console.log('Chat ID:', chatId);
    console.log('User ID:', userId);
    console.log('Message:', message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Find chat and verify user is part of it
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      console.log('❌ Chat not found');
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    console.log('Chat Details:');
    console.log('- Chat User ID:', chat.userId.toString());
    console.log('- Manufacturer User ID:', chat.manufacturerUserId.toString());
    console.log('- Current User ID:', userId);

    // FIXED: Convert ObjectId to string properly for comparison
    const chatUserId = chat.userId.toString();
    const chatManufacturerId = chat.manufacturerUserId.toString();
    const currentUserId = userId.toString();

    const isUser = chatUserId === currentUserId;
    const isManufacturer = chatManufacturerId === currentUserId;

    console.log('Authorization Check:');
    console.log('- Is User:', isUser);
    console.log('- Is Manufacturer:', isManufacturer);

    if (!isUser && !isManufacturer) {
      console.log('❌ User not authorized');
      console.log('Debug Info:', {
        chatUserId,
        chatManufacturerId,
        currentUserId,
        userIdType: typeof chatUserId,
        currentUserIdType: typeof currentUserId
      });
      
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages in this chat',
        debug: process.env.NODE_ENV === 'development' ? {
          chatUserId,
          chatManufacturerId,
          currentUserId
        } : undefined
      });
    }

    // Get sender name
    const sender = await User.findById(userId);
    
    if (!sender) {
      console.log('❌ Sender not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User authorized as:', isUser ? 'User' : 'Manufacturer');
    
    // Add message
    chat.messages.push({
      senderId: userId,
      senderName: sender.name,
      message: message.trim(),
      isRead: false
    });

    // Update unread count
    if (isUser) {
      chat.unreadCountManufacturer += 1;
    } else {
      chat.unreadCountUser += 1;
    }

    chat.lastMessageAt = Date.now();
    await chat.save();

    console.log('✅ Message sent successfully');

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: chat
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get chat by ID
// @route   GET /api/chats/:chatId
// @access  Private
export const getChatById = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    console.log('=== GET CHAT BY ID ===');
    console.log('Chat ID:', chatId);
    console.log('User ID:', userId);

    const chat = await Chat.findById(chatId)
      .populate('productId', 'name images price')
      .populate('userId', 'name email')
      .populate('manufacturerUserId', 'name email');

    if (!chat) {
      console.log('❌ Chat not found');
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // FIXED: Convert ObjectId to string properly for comparison
    const chatUserId = chat.userId._id.toString();
    const chatManufacturerId = chat.manufacturerUserId._id.toString();
    const currentUserId = userId.toString();

    const isUser = chatUserId === currentUserId;
    const isManufacturer = chatManufacturerId === currentUserId;

    console.log('Authorization Check:');
    console.log('- Is User:', isUser);
    console.log('- Is Manufacturer:', isManufacturer);

    if (!isUser && !isManufacturer) {
      console.log('❌ Access denied');
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        debug: process.env.NODE_ENV === 'development' ? {
          chatUserId,
          chatManufacturerId,
          currentUserId
        } : undefined
      });
    }

    console.log('✅ Access granted as:', isUser ? 'User' : 'Manufacturer');

    // Mark messages as read
    let needsSave = false;
    
    if (isUser && chat.unreadCountUser > 0) {
      chat.messages.forEach(msg => {
        if (msg.senderId.toString() !== currentUserId && !msg.isRead) {
          msg.isRead = true;
        }
      });
      chat.unreadCountUser = 0;
      needsSave = true;
    } else if (isManufacturer && chat.unreadCountManufacturer > 0) {
      chat.messages.forEach(msg => {
        if (msg.senderId.toString() !== currentUserId && !msg.isRead) {
          msg.isRead = true;
        }
      });
      chat.unreadCountManufacturer = 0;
      needsSave = true;
    }

    if (needsSave) {
      await chat.save();
      console.log('✅ Messages marked as read');
    }

    res.status(200).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('❌ Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all chats for user
// @route   GET /api/chats/user
// @access  Private
export const getUserChats = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { status = 'active' } = req.query;

    console.log('=== GET USER CHATS ===');
    console.log('User ID:', userId);

    const chats = await Chat.find({
      userId,
      status
    })
      .populate('productId', 'name images price')
      .sort({ lastMessageAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });

  } catch (error) {
    console.error('❌ Error fetching user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all chats for manufacturer
// @route   GET /api/chats/manufacturer
// @access  Private (Manufacturer)
export const getManufacturerChats = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const { status = 'active' } = req.query;

    console.log('=== GET MANUFACTURER CHATS ===');
    console.log('Manufacturer User ID:', userId);

    const chats = await Chat.find({
      manufacturerUserId: userId,
      status
    })
      .populate('productId', 'name images price')
      .populate('userId', 'name email')
      .sort({ lastMessageAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });

  } catch (error) {
    console.error('❌ Error fetching manufacturer chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete chat
// @route   DELETE /api/chats/:chatId
// @access  Private
export const deleteChat = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Only user who initiated chat can delete it
    if (chat.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the user who initiated the chat can delete it'
      });
    }

    await Chat.findByIdAndDelete(chatId);

    console.log('✅ Chat deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/chats/unread/count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    let totalUnread = 0;

    if (user.isManufacturer) {
      const chats = await Chat.find({
        manufacturerUserId: userId,
        status: 'active'
      });
      totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCountManufacturer, 0);
    } else {
      const chats = await Chat.find({
        userId,
        status: 'active'
      });
      totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCountUser, 0);
    }

    res.status(200).json({
      success: true,
      data: { unreadCount: totalUnread }
    });

  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});