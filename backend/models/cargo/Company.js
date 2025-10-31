// models/cargo/Company.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide company name'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide company email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact number'],
    },
    website: {
      type: String,
      required: [true, 'Please provide website URL'],
      match: [/^https?:\/\/.+/, 'Please provide a valid URL starting with http/https'],
    },
    description: {
      type: String,
      trim: true,
    },
    established: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    logo: String,
    coverage: {
      type: String,
      enum: ['Global', 'Asia-Pacific', 'Europe', 'Americas', 'India-Specific'],
      default: 'Global',
    },
    maxCoverage: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'INR'],
        default: 'USD',
      },
    },
    claimSettlementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shipmentTypes: [
      {
        type: String,
        enum: ['Road', 'Rail', 'Ship', 'Air'],
      },
    ],
    cargoTypes: [String],
    routes: [String],
    pricing: {
      minPrice: Number,
      maxPrice: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    serviceTier: {
      type: String,
      enum: ['Standard', 'Premium', 'Premium Plus'],
      default: 'Standard',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
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
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    quotesGenerated: {
      type: Number,
      default: 0,
    },
    rejectionReason: String,
    verificationDocuments: [String],
    highlight: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);

