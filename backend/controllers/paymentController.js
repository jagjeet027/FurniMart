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
    // Destructure the new paymentMethod field from the request body
    const { amount, manufacturerId, planType, paymentMethod } = req.body;
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
    
    // Simple validation for paymentMethod
    if (!paymentMethod) {
        return res.status(400).json({
            message: 'Payment method is required'
        });
    }

    // Verify manufacturer exists
    const manufacturer = await Manufacturer.findById(manufacturerId);
    if (!manufacturer) {
      return res.status(404).json({ 
        message: 'Manufacturer not found'
      });
    }

    // Calculate the actual amount to be charged
    let paymentAmount = amount;
    if (planType === '50_percent_advance') {
      paymentAmount = amount * 0.5;
    }
    paymentAmount = parseFloat(paymentAmount.toFixed(2));

    // Handle different payment methods
    if (paymentMethod === 'cod') {
      // For Cash on Delivery, we don't need a Razorpay order.
      // We just create a pending payment record and return success.
      await PaymentRecord.create({
        manufacturerId,
        razorpayOrderId: 'N/A', // Placeholder for COD orders
        razorpayPaymentId: 'N/A', // Placeholder for COD orders
        amount: 0, // No payment is made online for COD
        planType,
        paymentMethod,
        status: 'pending'
      });

      return res.json({
        orderId: 'COD_' + Date.now(),
        message: 'Order created with Cash on Delivery'
      });
    }
    
    // For other online payment methods, proceed with Razorpay
    const options = {
      amount: paymentAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create a pending payment record for the online payment
    await PaymentRecord.create({
      manufacturerId,
      razorpayOrderId: order.id,
      razorpayPaymentId: 'pending', 
      amount: paymentAmount,
      planType,
      paymentMethod,
      status: 'pending'
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    // Enhanced error logging and response for debugging
    console.error('Order creation failed:', error);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message, // Return the error message to the client for better debugging
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Optionally show stack trace in dev
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

    // Find the payment record first
    const paymentRecord = await PaymentRecord.findOne({ razorpayOrderId: razorpay_order_id });

    if (!paymentRecord) {
      return res.status(404).json({ 
        message: 'Payment record not found'
      });
    }

    // Handle COD payments separately
    if (paymentRecord.paymentMethod === 'cod') {
        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully (COD order)'
        });
    }

    // Proceed with signature verification for online payments
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Update payment record after successful verification
    paymentRecord.razorpayPaymentId = razorpay_payment_id;
    paymentRecord.status = 'successful';
    await paymentRecord.save();

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