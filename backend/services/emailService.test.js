import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';
import { sendStatusEmail } from './emailService.js';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from the correct directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
console.log('Checking email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  throw new Error('Email credentials not found in environment variables');
}

const testEmailService = async () => {
  try {
    console.log('Testing approved email...');
    const result = await sendStatusEmail(
      'jaggie027@gmail.com',
      'rejected',
      'TEST123'
    );
    console.log('Test succeeded:', result);
  } catch (error) {
    console.log('Test failed:', error);
  }
};

testEmailService();