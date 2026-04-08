import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Valid email required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone required'],
    },
    website: {
      type: String,
      required: [true, 'Website required'],
      match: [/^https?:\/\/.+/, 'Valid URL required'],
    },
    description: String,
    established: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    coverage: {
      type: String,
      enum: ['Global', 'Asia-Pacific', 'Europe', 'Americas', 'India-Specific'],
      default: 'Global',
    },
    maxCoverage: {
      amount: { type: Number, required: true },
      currency: { type: String, enum: ['USD', 'EUR', 'INR'], default: 'USD' },
    },
    claimSettlementRate: { type: Number, default: 85, min: 0, max: 100 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    shipmentTypes: [
      { type: String, enum: ['Road', 'Rail', 'Ship', 'Air'] },
    ],
    cargoTypes: [String],
    routes: [String],
    serviceTier: {
      type: String,
      enum: ['Standard', 'Premium', 'Premium Plus'],
      default: 'Standard',
    },
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
    paymentId: String,
    submittedBy: {
      name: String,
      email: String,
      phone: String,
      designation: String,
    },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    quotesGenerated: { type: Number, default: 0 },
    rejectionReason: String,
    highlight: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);
