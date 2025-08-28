import mongoose from "mongoose";

// Chat Room Schema
const chatRoomSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userType: {
      type: String,
      enum: ['wholeseller', 'manufacturer'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    message: String,
    timestamp: Date,
    sender: String
  }
}, {
  timestamps: true
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
      enum: ['wholeseller', 'manufacturer'],
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
chatRoomSchema.index({ 'participants.userId': 1 });
chatRoomSchema.index({ product: 1 });
chatRoomSchema.index({ createdAt: -1 });

messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ 'sender.userId': 1 });

const ChatRoom = mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export { ChatRoom, Message };