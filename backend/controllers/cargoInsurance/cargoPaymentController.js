import crypto from 'crypto';
import mongoose from 'mongoose';
import { Company } from '../../models/cargo/Company.js';
import { LoanProvider } from '../../models/cargo/LoanProvider.js';
import { Payment } from '../../models/cargo/Payment.js';

export const verifyCargoPayment = async (req, res) => {
  try {
    console.log('🔍 Received verification request');
    
    const { 
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentId,
      orderId,
      signature,
      companyId,
      type = 'insurance'
    } = req.body;

    // Normalize incoming data
    const paymentID = razorpay_payment_id || paymentId;
    const orderID = razorpay_order_id || orderId;
    const sig = razorpay_signature || signature;

    console.log('📋 Extracted data:', {
      paymentID: paymentID ? '✅ Got' : '❌ Missing',
      orderID: orderID ? '✅ Got' : '❌ Missing',
      sig: sig ? '✅ Got' : '❌ Missing',
      companyId: companyId ? '✅ Got' : '❌ Missing',
      type
    });

    // Validate all required fields
    if (!paymentID) {
      console.error('❌ Missing payment ID');
      return res.status(400).json({ 
        success: false,
        message: 'Payment ID is required'
      });
    }

    if (!orderID) {
      console.error('❌ Missing order ID');
      return res.status(400).json({ 
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!sig) {
      console.error('❌ Missing signature');
      return res.status(400).json({ 
        success: false,
        message: 'Signature is required'
      });
    }

    if (!companyId) {
      console.error('❌ Missing company ID');
      return res.status(400).json({ 
        success: false,
        message: 'Company ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.error('❌ Invalid company ID format');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid company ID format'
      });
    }

    // Verify signature
    console.log('🔐 Starting signature verification...');
    
    const body = `${orderID}|${paymentID}`;
    
    console.log('📝 Verifying with data:');
    console.log('  Order ID:', orderID);
    console.log('  Payment ID:', paymentID);
    console.log('  Body string:', body);

    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      console.error('❌ RAZORPAY_KEY_SECRET not set in environment');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Missing Razorpay secret'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    console.log('🔍 Signature comparison:');
    console.log('  Expected:', expectedSignature);
    console.log('  Received:', sig);
    console.log('  Match:', expectedSignature === sig);

    if (expectedSignature !== sig) {
      console.error('❌ Signature verification failed');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment signature - verification failed'
      });
    }

    console.log('✅ Signature verified successfully!');

    // Find company/provider
    console.log('🔍 Finding company:', companyId);
    
    const Model = type === 'loan' ? LoanProvider : Company;
    const company = await Model.findById(companyId);
    
    if (!company) {
      console.error(`❌ ${type} provider not found`);
      return res.status(404).json({ 
        success: false,
        message: `${type === 'loan' ? 'Loan Provider' : 'Company'} not found`
      });
    }

    console.log('✅ Company found:', company.name);

    const LISTING_FEE = type === 'loan' ? 20000 : 15000;

    // ✅ FIX: Declare payment variable at function scope
    // So it can be used in both try blocks
    let payment;

    try {
      console.log('💾 Saving payment record...');

      const paymentData = {
        companyId: companyId,
        orderId: orderID,
        paymentId: paymentID,
        signature: sig,
        amount: LISTING_FEE,
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'completed',
        description: `${type} provider listing fee`,
        refundStatus: 'none',
        type: type,
        verifiedAt: new Date()
      };

      console.log('📝 Payment data:', {
        ...paymentData,
        signature: paymentData.signature.substring(0, 10) + '...'
      });

      // ✅ FIX: Assign to the outer-scoped payment variable
      payment = await Payment.findOneAndUpdate(
        { 
          orderId: orderID,
          companyId: companyId
        },
        paymentData,
        { 
          new: true, 
          upsert: true,
          runValidators: true
        }
      );

      console.log('✅ Payment record saved:', payment._id);

    } catch (paymentDbError) {
      console.error('❌ Payment DB error:', paymentDbError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save payment record',
        error: paymentDbError.message,
        details: paymentDbError.errors
      });
    }

    // Update company status
    try {
      console.log('🔄 Updating company status...');

      const updatedCompany = await Model.findByIdAndUpdate(
        companyId,
        { 
          paymentStatus: 'completed',
          paymentId: paymentID,
          status: 'pending',
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true
        }
      );

      console.log('✅ Company status updated:', updatedCompany.status);

      // ✅ Now payment is defined and can be used here
      return res.status(200).json({ 
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment: {
            id: payment._id,
            orderId: payment.orderId,
            paymentId: payment.paymentId,
            amount: payment.amount,
            status: payment.status,
            type: payment.type
          },
          company: {
            id: updatedCompany._id,
            name: updatedCompany.name,
            paymentStatus: updatedCompany.paymentStatus,
            status: updatedCompany.status,
            type: type
          }
        }
      });

    } catch (companyUpdateError) {
      console.error('❌ Company update error:', companyUpdateError);
      return res.status(500).json({
        success: false,
        message: 'Payment verified but failed to update company status',
        error: companyUpdateError.message
      });
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ========== OTHER FUNCTIONS REMAIN SAME ==========

export const createListingOrder = async (req, res) => {
  try {
    const { companyId, type = 'insurance' } = req.body;
    const LISTING_FEE = type === 'loan' ? 20000 : 15000;

    if (!companyId) {
      return res.status(400).json({ 
        success: false,
        message: 'Company ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid company ID format'
      });
    }

    const Model = type === 'loan' ? LoanProvider : Company;
    const company = await Model.findById(companyId);
    
    if (!company) {
      return res.status(404).json({ 
        success: false,
        message: `${type === 'loan' ? 'Loan Provider' : 'Company'} not found`
      });
    }

    if (company.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this company'
      });
    }

    try {
      const typePrefix = type === 'loan' ? 'LON' : 'INS';
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      const receipt = `${typePrefix}_${timestamp}_${random}`;

      const options = {
        amount: LISTING_FEE * 100,
        currency: 'INR',
        receipt: receipt,
        notes: {
          companyId: companyId.toString(),
          companyName: company.name,
          type: `${type}_listing`
        }
      };

      if (!global.razorpay) {
        throw new Error('Razorpay not initialized');
      }

      const order = await global.razorpay.orders.create(options);

      console.log('✅ Order created:', order.id);

      return res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          companyName: company.name,
          companyId: companyId,
          type: type
        }
      });

    } catch (razorpayError) {
      console.error('❌ Razorpay error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: razorpayError.error?.description || razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID'
      });
    }

    const payments = await Payment.find({
      companyId: companyId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

export const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ orderId });

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
    console.error('❌ Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

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
        message: 'Only completed payments can be refunded'
      });
    }

    try {
      const refund = await global.razorpay.payments.refund(paymentId, {
        amount: amount ? amount * 100 : payment.amount * 100,
        notes: {
          reason: reason || 'Admin refund'
        }
      });

      payment.refundStatus = 'completed';
      payment.refundId = refund.id;
      await payment.save();

      return res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        }
      });

    } catch (razorpayRefundError) {
      console.error('❌ Razorpay refund error:', razorpayRefundError);
      return res.status(500).json({
        success: false,
        message: 'Refund failed',
        error: razorpayRefundError.message
      });
    }

  } catch (error) {
    console.error('❌ Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed',
      error: error.message
    });
  }
};