import mongoose from 'mongoose';

// Models/paymentRecord.js
const paymentRecordSchema = new mongoose.Schema({
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manufacturer',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  planType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const PaymentRecord = mongoose.models.PaymentRecord || mongoose.model('PaymentRecord', paymentRecordSchema);

export { PaymentRecord };