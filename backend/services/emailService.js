import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  logger: true,
  debug: true
});

const emailTemplates = {
  approved: {
    subject: 'Congratulations! Your Furnimart Registration is Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c5282;">Welcome to Furnimart!</h1>
        <p style="font-size: 16px; line-height: 1.5;">
          Congratulations! Your manufacturer registration has been approved. You are now officially a member of the Furnimart family.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          As an approved manufacturer, you can now:
          <ul>
            <li>Access your manufacturer dashboard</li>
            <li>List and manage your products</li>
            <li>Receive orders from customers</li>
            <li>Access all premium features</li>
          </ul>
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          If you have any questions, please don't hesitate to contact our support team.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          Best regards,<br>
          The Furnimart Team
        </p>
      </div>
    `
  },
  rejected: {
    subject: 'Update Regarding Your Furnimart Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c5282;">Registration Status Update</h1>
        <p style="font-size: 16px; line-height: 1.5;">
          Thank you for your interest in joining Furnimart as a manufacturer.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          After careful review of your application, we regret to inform you that we are unable to approve your registration at this time.
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          If you would like to understand the reason for this decision or wish to submit a new application with additional information, please contact our support team at:<br>
          <a href="mailto:support@furnimart.com">support@furnimart.com</a>
        </p>
        <p style="font-size: 16px; line-height: 1.5;">
          Best regards,<br>
          The Furnimart Team
        </p>
      </div>
    `
  }
};

export const sendStatusEmail = async (recipientEmail, status, orderId) => {
  try {
    const template = emailTemplates[status.toLowerCase()];
    
    if (!template) {
      throw new Error(`Invalid status: ${status}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};