// backend/models/Loan.js
import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  lender: {
    type: String,
    required: true,
    trim: true
  },
  lenderType: {
    type: String,
    enum: ['government', 'bank', 'nbfc', 'private', 'fintech', 'other'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['startup', 'sme', 'ngo', 'education', 'agriculture', 'personal', 'home', 'general'],
    required: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  interestRate: {
    type: String,
    required: true
  },
  loanAmount: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  repaymentTerm: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  processingFee: {
    type: String,
    default: '0%'
  },
  collateral: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  },
  benefits: [String],
  documents: [String],
  features: [String],
  eligibility: {
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 65 },
    minIncome: { type: Number, default: 0 },
    creditScoreMin: { type: Number, default: 0 },
    organizationType: [String],
    businessAge: { type: Number, default: 0 },
    sector: [String]
  },
  applicationUrl: {
    type: String,
    required: true
  },
  processingTime: {
    type: String,
    default: 'Variable'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  applicationCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexes for performance
LoanSchema.index({ country: 1, category: 1 });
LoanSchema.index({ lenderType: 1, applicationCount: -1 });
LoanSchema.index({ createdAt: -1 });

export default mongoose.model('Loan', LoanSchema);