import mongoose from 'mongoose';

const loanProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: String,
    website: String,
    logo: String,
    description: String,
    established: Number,
    
    loanProducts: [{
      name: String,
      minAmount: Number,
      maxAmount: Number,
      interestRate: Number,
      tenureMonths: Number,
      currency: { type: String, default: 'INR' },
      processingFee: Number,
      eligibility: String,
    }],
    
    coverage: {
      type: String,
      enum: ['Global', 'Asia-Pacific', 'Europe', 'Americas', 'India-Specific'],
      default: 'India-Specific',
    },
    
    approvalTime: String, // e.g., "24-48 hours"
    disburseTime: String, // e.g., "3-5 days"
    
    rating: { type: Number, default: 4, min: 0, max: 5 },
    approvalRate: { type: Number, default: 85, min: 0, max: 100 },
    
    features: [String], // e.g., ["Flexible Repayment", "No Collateral", "Online Process"]
    
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    
    submittedBy: {
      name: String,
      email: String,
      phone: String,
      designation: String,
    },
    
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    applicationsReceived: { type: Number, default: 0 },
    highlight: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const LoanProvider = 
  mongoose.models.LoanProvider || 
  mongoose.model('LoanProvider', loanProviderSchema);
