import Razorpay from 'razorpay';
import { Company } from '../../models/cargo/Company.js';
import { Payment } from '../../models/cargo/Payment.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createListingOrder = async (req, res) => {
  try {
    const { companyId } = req.body;
    const LISTING_FEE = 15000; // ₹15,000 fixed fee for cargo insurance

    // Validate companyId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid company ID format'
      });
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found'
      });
    }

    // Check if company already paid
    if (company.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Company has already completed payment'
      });
    }

    // Create Razorpay order
    const options = {
      amount: LISTING_FEE * 100, // Convert to paise
      currency: 'INR',
      receipt: `cargo_listing_${companyId}_${Date.now()}`,
      notes: {
        companyId: companyId,
        companyName: company.name,
        type: 'cargo_insurance_listing'
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        companyName: company.name
      }
    });
  } catch (error) {
    console.error('❌ Cargo listing order creation failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verifyCargoPayment = async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      companyId
    } = req.body;

    // Validate inputs
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !companyId) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required payment details'
      });
    }

    // Validate companyId format
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid company ID format'
      });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid payment signature');
      return res.status(400).json({ 
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: 'Company not found'
      });
    }

    // Create or update payment record
    const payment = await Payment.findOneAndUpdate(
      { 
        companyId: companyId,
        orderId: razorpay_order_id
      },
      {
        companyId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: 15000,
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'completed',
        description: 'Cargo Insurance Company Listing Fee',
        refundStatus: 'none'
      },
      { new: true, upsert: true }
    );

    // Update company payment status
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { 
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`✅ Payment verified for company: ${updatedCompany.name}`);

    res.status(200).json({ 
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment,
        company: {
          id: updatedCompany._id,
          name: updatedCompany.name,
          paymentStatus: updatedCompany.paymentStatus,
          status: updatedCompany.status
        }
      }
    });
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== GET PAYMENT HISTORY FOR COMPANY ==========
export const getCompanyPaymentHistory = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Validate companyId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid company ID format'
      });
    }

    const payments = await Payment.find({ companyId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('❌ Failed to fetch payment history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== GET ALL PAYMENTS (ADMIN ONLY) ==========
export const getAllCargoPayments = async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(filter)
      .populate('companyId', 'name email status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: payments
    });
  } catch (error) {
    console.error('❌ Failed to fetch payments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== GET PAYMENT DETAILS BY ORDER ID ==========
export const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ orderId })
      .populate('companyId', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('❌ Failed to fetch payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== REFUND PAYMENT (ADMIN ONLY) ==========
export const refundCargoPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    // Process refund via Razorpay
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: payment.amount * 100, // Full refund
        notes: { reason: reason || 'Admin refund' }
      });

      // Update payment record
      const updatedPayment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          refundStatus: 'completed',
          refundAmount: payment.amount,
          status: 'refunded'
        },
        { new: true }
      );

      // Update company payment status
      await Company.findByIdAndUpdate(
        payment.companyId,
        { paymentStatus: 'failed' }
      );

      console.log(`✅ Refund processed for payment: ${paymentId}`);

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          payment: updatedPayment,
          razorpayRefund: refund
        }
      });
    } catch (razorpayError) {
      console.error('❌ Razorpay refund error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: 'Failed to process refund via Razorpay',
        error: razorpayError.message
      });
    }
  } catch (error) {
    console.error('❌ Refund processing failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process refund',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ========== GET PAYMENT STATISTICS (ADMIN ONLY) ==========
export const getPaymentStatistics = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    const refundedPayments = await Payment.countDocuments({ status: 'refunded' });

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paymentsByMethod = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        completedPayments,
        failedPayments,
        refundedPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        paymentsByMethod,
        revenueByMonth
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch payment statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
