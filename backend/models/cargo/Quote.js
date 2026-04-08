
import mongoose from "mongoose";
const quoteSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    premium: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    coverage: {
      amount: Number,
      currency: String,
    },
    deductible: Number,
    validUntil: Date,
    termsAndConditions: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    companyRating: Number,
    claimSettlement: String,
    serviceTier: String,
    description: String,
  },
  { timestamps: true }
);

export const Quote = mongoose.model('Quote', quoteSchema);