import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    manufacturerInfo: {
      type: String,
      required: true,
    },
    // NEW: Reference to manufacturer document
    manufacturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
      required: true,
      index: true // For faster queries
    },
    // NEW: Track which user uploaded this product
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sizes: [String],
    features: [String],
    images: [String],
    imageUrl: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0
    },
    stock: {
      type: Number,
      default: 50,
      min: 0
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ manufacturerId: 1, createdAt: -1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ uploadedBy: 1 });

// Virtual to populate manufacturer details
productSchema.virtual('manufacturerDetails', {
  ref: 'Manufacturer',
  localField: 'manufacturerId',
  foreignField: '_id',
  justOne: true
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;