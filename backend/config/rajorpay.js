// src/config/razorpay.js - DEBUG VERSION

import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ DEBUG: Check where .env should be
const possibleEnvLocations = [
  path.resolve(__dirname, '../../.env'),  // Root level
  path.resolve(__dirname, '../.env'),     // Backend level
  path.resolve(process.cwd(), '.env'),    // Current working directory
];

console.log('\n🔍 DEBUGGING RAZORPAY SETUP:');
console.log('Current working directory:', process.cwd());
console.log('Script location:', __dirname);
console.log('\n📁 Checking .env file locations:');

possibleEnvLocations.forEach((loc) => {
  const exists = fs.existsSync(loc);
  console.log(`  ${exists ? '✅' : '❌'} ${loc}`);
});

console.log('\n📋 Environment Variables:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Present' : '❌ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Present' : '❌ Missing');
console.log('\n');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('❌ ERROR: Razorpay credentials missing in .env file');
  console.error('\n⚠️  SOLUTION:');
  console.error('1. Make sure your .env file is at the ROOT of your project:');
  console.error('   my-furniture-app/.env  ✅ CORRECT');
  console.error('   my-furniture-app/backend/.env  ❌ WRONG');
  console.error('\n2. Make sure your .env file contains:');
  console.error('   RAZORPAY_KEY_ID=rzp_test_...');
  console.error('   RAZORPAY_KEY_SECRET=...');
  console.error('\n3. Restart your server after fixing .env');
  throw new Error('Razorpay credentials missing in .env file');
}

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

console.log('✅ Razorpay initialized successfully');
console.log('   Key ID (first 20 chars):', RAZORPAY_KEY_ID.substring(0, 20) + '...');

export default razorpayInstance;