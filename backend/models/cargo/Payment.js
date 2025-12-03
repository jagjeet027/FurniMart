import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema(
 {
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  signature: String,
  
  amount: {
    type: Number,
    required: true
  },
  
  currency: {
    type: String,
    default: 'INR'
  },
  
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  description: String,
  
  type: {
    type: String,
    enum: ['insurance', 'loan'],
    default: 'insurance'
  },
  
  refundStatus: {
    type: String,
    enum: ['none', 'partial', 'completed'],
    default: 'none'
  },
  
  refundId: String,
  refundAmount: Number,
  
  verifiedAt: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
);

export const Payment = mongoose.model('Payment', paymentSchema);