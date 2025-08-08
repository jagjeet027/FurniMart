import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for guest orders
  },
  // Changed from 'items' to 'orderItems' to match frontend
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true,
      min: 20 
    },
    size: String,
    price: {
      type: Number,
      required: true
    },
    image: String
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    // Updated enum to match the PaymentRecord schema for consistency
    enum: ['credit_card', 'upi', 'netbanking', 'wallet', 'cod']
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    email: String
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: Date,
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  // Add guest customer info for non-authenticated orders
  guestCustomer: {
    name: String,
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
