import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number,
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'credit_card', 'debit_card', 'upi'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    description: String,
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'completed'],
      default: 'none',
    },
    refundAmount: Number,
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);