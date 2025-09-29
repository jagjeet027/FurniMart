import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Storage Solutions',
      'Office Furniture',
      'Living Room',
      'Bedroom',
      'Outdoor',
      'Lighting',
      'Decor',
      'Custom Design',
      'Innovation',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    publicId: String
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: {
      type: String,
      enum: ['user', 'manufacturer', 'admin']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: {
      type: String,
      enum: ['user', 'manufacturer', 'admin']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, { timestamps: true });

// Indexes for better performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ 'likes.userId': 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
