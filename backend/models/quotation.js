// models/Quotation.js
import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Quotation message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  deliveryTime: {
    type: String,
    trim: true
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
quotationSchema.index({ postId: 1, createdAt: -1 });
quotationSchema.index({ manufacturerId: 1, createdAt: -1 });
quotationSchema.index({ status: 1 });

// Virtual populate for manufacturer details
quotationSchema.virtual('manufacturer', {
  ref: 'User',
  localField: 'manufacturerId',
  foreignField: '_id',
  justOne: true
});

export const Quotation = mongoose.model('Quotation', quotationSchema);