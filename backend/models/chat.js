import mongoose from 'mongoose';

// Chat Room Schema
const chatRoomSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['wholeseller', 'retailer', 'manufacturer', 'user']
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  manufacturerName: {
    type: String,
    required: true
  },
  lastMessage: {
    message: String,
    timestamp: Date,
    sender: String
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
chatRoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Message Schema
const messageSchema = new mongoose.Schema({
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userType: {
      type: String,
      required: true,
      enum: ['wholeseller', 'retailer', 'manufacturer', 'user']
    },
    name: {
      type: String,
      required: true
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text' || this.messageType === 'system';
    }
  },
  imageUrl: {
    type: String,
    required: function() {
      return this.messageType === 'image';
    }
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.messageType === 'file';
    }
  },
  fileName: {
    type: String,
    required: function() {
      return this.messageType === 'file';
    }
  },
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
messageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
chatRoomSchema.index({ 'participants.userId': 1, 'participants.userType': 1 });
chatRoomSchema.index({ product: 1 });
chatRoomSchema.index({ updatedAt: -1 });

messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ 'sender.userId': 1 });
messageSchema.index({ deliveryStatus: 1 });

// Export models
export const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);