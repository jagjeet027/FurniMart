import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manufacturer',
    required: true,
    index: true
  },
  manufacturerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  manufacturerName: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  unreadCountUser: {
    type: Number,
    default: 0
  },
  unreadCountManufacturer: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique chat per user-manufacturer-product combination
chatSchema.index({ userId: 1, manufacturerId: 1, productId: 1 }, { unique: true });

// Index for efficient queries
chatSchema.index({ userId: 1, lastMessageAt: -1 });
chatSchema.index({ manufacturerUserId: 1, lastMessageAt: -1 });
chatSchema.index({ status: 1, lastMessageAt: -1 });

// TTL index to auto-delete chats after 30 days of last message
chatSchema.index({ lastMessageAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days = 2592000 seconds

// Update lastMessageAt before saving
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastMessageAt = Date.now();
  }
  next();
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

export default Chat;