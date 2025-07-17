import mongoose from 'mongoose';

const otpRequestSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' }
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes
  }
});

export const OtpRequest = mongoose.model('OtpRequest', otpRequestSchema);