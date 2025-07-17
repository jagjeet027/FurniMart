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
    },
    reviews: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 50,
    }
  },
  {
    timestamps: true,
  }
);
// ✅ Model ko overwrite hone se bachane ke liye check karna
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;