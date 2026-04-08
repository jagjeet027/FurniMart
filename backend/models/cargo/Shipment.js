import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departureLocation: {
      country: {
        type: String,
        required: true,
      },
      port: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    arrivalLocation: {
      country: {
        type: String,
        required: true,
      },
      port: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    cargoType: {
      type: String,
      required: true,
    },
    cargoValue: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'tons'],
        default: 'kg',
      },
    },
    transportMode: {
      type: String,
      enum: ['Road', 'Rail', 'Ship', 'Air'],
      required: true,
    },
    expectedDeparture: Date,
    expectedArrival: Date,
    insuranceType: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'standard',
    },
    description: String,
    status: {
      type: String,
      enum: ['draft', 'active', 'quoted', 'completed', 'cancelled'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const Shipment = mongoose.model('Shipment', shipmentSchema);
