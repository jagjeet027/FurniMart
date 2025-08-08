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
    // This stores the actual amount paid (e.g., 50% for advance payments)
    type: Number,
    required: true
  },
  totalAmount: {
    // This new field stores the full amount of the order
    type: Number,
    required: true
  },
  planType: {
    type: String,
    enum: ['full_payment', '50_percent_advance'],
    required: true
  },
  paymentMethod: {
    // Corrected to include all desired payment methods in the enum
    type: String,
    enum: ['credit_card', 'upi', 'netbanking', 'wallet', 'cod'],
    required: true,
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
