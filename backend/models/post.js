import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['idea', 'requirement'],
    required: [true, 'Type is required'],
    index: true // Added index
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    default: 'General',
    index: true // Added index
  },
  files: [{
    url: String,
    filename: String,
    mimetype: String,
    size: Number,
    fileType: {
      type: String,
      enum: ['image', 'document']
    }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Added index
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
    index: true // Added index
  },
  quotationsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true // Added index
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ⚡ OPTIMIZED COMPOUND INDEXES for faster queries
postSchema.index({ isActive: 1, createdAt: -1 }); // Most common query
postSchema.index({ userId: 1, isActive: 1, createdAt: -1 }); // My posts
postSchema.index({ status: 1, isActive: 1, createdAt: -1 }); // Filter by status
postSchema.index({ type: 1, status: 1, isActive: 1 }); // Combined filters
postSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual populate for author
postSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Static method to get posts with optimized queries
postSchema.statics.findActiveWithAuthor = function(filter = {}) {
  return this.find({ ...filter, isActive: true })
    .select('title type description category status userId quotationsCount createdAt updatedAt')
    .populate('userId', 'name email isManufacturer phone')
    .lean();
};

export const Post = mongoose.model('Post', postSchema);
