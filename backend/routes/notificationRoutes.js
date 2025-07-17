// Enhanced routes/notifications.js with debugging and error handling
import express from 'express';
import nodemailer from 'nodemailer';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure email transporter with better error handling
const createTransporter = () => {
  try {

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured in environment variables');
    }

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Add these options for better debugging
      debug: true,
      logger: true
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
};

// Test email configuration endpoint
router.get('/test-config', authenticateToken, async (req, res) => {
  try {
    const transporter = createTransporter();
    
    // Verify the transporter configuration
    await transporter.verify();
    
    res.json({
      success: true,
      message: 'Email configuration is valid'
    });
  } catch (error) {
    console.error('Email configuration test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed',
      error: error.message
    });
  }
});

// POST /api/notifications/email - Send status notification email
router.post('/email', authenticateToken, async (req, res) => {
  try {
    const { email, status, manufacturerId } = req.body;

    // Enhanced validation
    if (!email || !status || !manufacturerId) {
      console.log('Validation failed - Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Email, status, and manufacturerId are required',
        received: { email: !!email, status: !!status, manufacturerId: !!manufacturerId }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      console.log('Invalid status:', status);
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    console.log('Creating email transporter...');
    const transporter = createTransporter();

    // Create email content based on status
    let subject, message;
    
    if (status === 'approved') {
      subject = 'Manufacturer Registration Approved ✅';
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>Congratulations! 🎉</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #28a745;">Your Manufacturer Registration is Approved!</h2>
            <p>Dear Manufacturer,</p>
            <p>We are pleased to inform you that your manufacturer registration has been <strong>approved</strong>.</p>
            <p>You can now:</p>
            <ul>
              <li>Access your manufacturer dashboard</li>
              <li>List your products</li>
              <li>Connect with buyers</li>
              <li>Manage your business profile</li>
            </ul>
            <p>Thank you for joining our platform!</p>
            <div style="margin-top: 30px; padding: 15px; background: #e7f3ff; border-left: 4px solid #007bff;">
              <p><strong>Next Steps:</strong></p>
              <p>Login to your account and complete your business profile to start selling.</p>
            </div>
          </div>
          <div style="background: #343a40; color: white; padding: 15px; text-align: center;">
            <p>Best regards,<br>The Admin Team</p>
          </div>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = 'Manufacturer Registration Update ❌';
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 20px; text-align: center;">
            <h1>Registration Update</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #dc3545;">Registration Status Update</h2>
            <p>Dear Applicant,</p>
            <p>We have reviewed your manufacturer registration application, and unfortunately, we cannot approve it at this time.</p>
            <p>Common reasons for rejection include:</p>
            <ul>
              <li>Incomplete documentation</li>
              <li>Invalid business license</li>
              <li>Missing tax certificates</li>
              <li>Insufficient business information</li>
            </ul>
            <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
              <p><strong>You can reapply:</strong></p>
              <p>Please review your documents and information, then submit a new application.</p>
            </div>
          </div>
          <div style="background: #343a40; color: white; padding: 15px; text-align: center;">
            <p>Best regards,<br>The Admin Team</p>
          </div>
        </div>
      `;
    }

    console.log('Preparing email...');
    console.log('To:', email);
    console.log('Subject:', subject);

    // Send email with enhanced error handling
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: message,
      // Add these options for better delivery
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);

    res.json({
      success: true,
      message: 'Email notification sent successfully',
      messageId: info.messageId,
      response: info.response
    });

  } catch (error) {
    console.error('=== Email Notification Error ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    // Enhanced error response
    let errorMessage = 'Failed to send email notification';
    let statusCode = 500;

    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
      statusCode = 401;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error: Unable to connect to email server.';
      statusCode = 503;
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Invalid email message format.';
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    });
  }
});

// Test email sending endpoint
router.post('/test-email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for testing'
      });
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Test Email from Notification System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email from your notification system.</p>
          <p>If you receive this, your email configuration is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

export default router;