import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration with better error handling
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  console.log('📧 Email config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user,
    hasPassword: !!config.auth.pass
  });

  return nodemailer.createTransport(config);
};

const emailTemplates = {
  approved: {
    subject: 'Congratulations! Your Furnimart Registration is Approved ✅',
    html: (businessName) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to Furnimart!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; color: #2d3748; margin-bottom: 20px;">
            Dear ${businessName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            Congratulations! 🎊 Your manufacturer registration has been <strong>approved</strong>. 
            You are now officially a member of the Furnimart family.
          </p>
          
          <div style="background: #f7fafc; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #2d3748;">As an approved manufacturer, you can now:</p>
            <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
              <li style="margin: 8px 0;">Access your manufacturer dashboard</li>
              <li style="margin: 8px 0;">List and manage your products</li>
              <li style="margin: 8px 0;">Receive orders from customers</li>
              <li style="margin: 8px 0;">Access all premium features</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            Get started by logging into your account and setting up your product catalog.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold;
                      display: inline-block;">
              Login to Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #718096; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            Questions? Contact us at <a href="mailto:support@furnimart.com" style="color: #667eea;">support@furnimart.com</a>
          </p>
          
          <p style="font-size: 16px; color: #2d3748; margin-top: 20px;">
            Best regards,<br>
            <strong>The Furnimart Team</strong>
          </p>
        </div>
      </div>
    `
  },
  
  rejected: {
    subject: 'Update Regarding Your Furnimart Registration',
    html: (businessName) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Registration Status Update</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; color: #2d3748; margin-bottom: 20px;">
            Dear ${businessName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            Thank you for your interest in joining Furnimart as a manufacturer.
          </p>
          
          <div style="background: #fff5f5; padding: 20px; border-left: 4px solid #fc8181; margin: 20px 0;">
            <p style="margin: 0; color: #742a2a;">
              After careful review of your application, we regret to inform you that we are 
              unable to approve your registration at this time.
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            This decision may be due to incomplete documentation, information that doesn't meet 
            our current requirements, or other factors.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            If you would like to:
          </p>
          <ul style="color: #4a5568; line-height: 1.8;">
            <li>Understand the specific reason for this decision</li>
            <li>Submit a new application with additional information</li>
            <li>Discuss any concerns or questions</li>
          </ul>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            Please contact our support team at:<br>
            <a href="mailto:support@furnimart.com" style="color: #667eea; font-weight: bold;">support@furnimart.com</a>
          </p>
          
          <p style="font-size: 14px; color: #718096; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            We appreciate your interest in Furnimart and wish you success in your business endeavors.
          </p>
          
          <p style="font-size: 16px; color: #2d3748; margin-top: 20px;">
            Best regards,<br>
            <strong>The Furnimart Team</strong>
          </p>
        </div>
      </div>
    `
  }
};

export const sendStatusEmail = async (recipientEmail, status, manufacturerId) => {
  try {
    // Validate inputs
    if (!recipientEmail || !status) {
      throw new Error('Recipient email and status are required');
    }

    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured in .env file');
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env');
    }

    const template = emailTemplates[status.toLowerCase()];
    
    if (!template) {
      throw new Error(`Invalid status: ${status}. Must be 'approved' or 'rejected'`);
    }

    const transporter = createTransporter();

    // Get manufacturer name for personalization
    const businessName = 'Manufacturer'; // You can pass this as parameter if needed

    const mailOptions = {
      from: `"Furnimart Team" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: template.subject,
      html: template.html(businessName)
    };

    console.log('📧 Sending email to:', recipientEmail);
    console.log('📧 Subject:', template.subject);

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);

    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    };

  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD');
    } else if (error.code === 'ECONNECTION') {
      console.error('   Connection failed. Check EMAIL_HOST and EMAIL_PORT');
    }
    
    throw error;
  }
};

// Verify email configuration on startup
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    return false;
  }
};