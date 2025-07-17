import Razorpay from 'razorpay';
import { Manufacturer } from '../models/manufacturer.js';
import { PaymentRecord } from '../models/paymentRecord.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createOrder = async (req, res) => {
  try {
    const { amount, manufacturerId, planType } = req.body;
    if (amount > 500000) { // 5 lakhs in INR
      return res.status(400).json({ 
        message: 'Amount exceeds maximum limit'
      });
    }
    // Validate manufacturerId
    if (!mongoose.Types.ObjectId.isValid(manufacturerId)) {
      return res.status(400).json({ 
        message: 'Invalid manufacturer ID format'
      });
    }

    // Verify manufacturer exists
    const manufacturer = await Manufacturer.findById(manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ 
        message: 'Manufacturer not found'
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create a pending payment record
    await PaymentRecord.create({
      manufacturerId,
      razorpayOrderId: order.id,
      razorpayPaymentId: 'pending', // Add a placeholder
      amount,
      planType,
      status: 'pending'
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message 
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Update payment record
    const paymentRecord = await PaymentRecord.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        razorpayPaymentId: razorpay_payment_id,
        status: 'successful'
      },
      { new: true }
    );

    if (!paymentRecord) {
      return res.status(404).json({ 
        message: 'Payment record not found'
      });
    }

    // Update manufacturer status and ispaid field
    await Manufacturer.findByIdAndUpdate(
      paymentRecord.manufacturerId,
      { 
        status: 'approved',
        'documents.ispaid': true  // Update the ispaid field
      }
    );

    res.json({ 
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const { manufacturerId } = req.params;

    // Validate manufacturerId
    if (!mongoose.Types.ObjectId.isValid(manufacturerId)) {
      return res.status(400).json({ 
        message: 'Invalid manufacturer ID format'
      });
    }

    const payments = await PaymentRecord.find({ manufacturerId })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch payment details',
      error: error.message 
    });
  }
};