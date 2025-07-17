import asyncHandler from 'express-async-handler';
import { User } from "../models/Users.js";
import jwt from 'jsonwebtoken'
import { OtpRequest } from '../models/otpRequest.js';
import twilio from 'twilio';
import dotenv from 'dotenv';
import mongoose from 'mongoose'
dotenv.config();

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOTP = asyncHandler(async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OtpRequest.deleteMany({ phone: formattedPhone });

    // Create new OTP request
    const otpRequest = new OtpRequest({ 
      phone: formattedPhone, 
      otp, 
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
      isVerified: false
    });
    
    // Save the OTP request
    await otpRequest.save();

    // Send OTP via Twilio
    await twilioClient.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`OTP sent to ${formattedPhone}: ${otp}`);
    return res.status(200).json({ 
      message: 'OTP sent successfully!',
      // Only for development - remove in production
      developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log('Received OTP Verification Request:', {
      phone,
      otp
    });

    // Ensure phone is properly formatted
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    // Find the most recent OTP request for this phone number
    const otpRequest = await OtpRequest.findOne({ 
      phone: formattedPhone, 
      isVerified: false 
    });

    // Debug logging
    console.log('Found OTP Request:', otpRequest);

    // Check if OTP request exists
    if (!otpRequest) {
      console.log('No active OTP request found for phone:', formattedPhone);
      return res.status(400).json({ error: 'No active OTP request found' });
    }

    // Check if OTP has expired
    if (new Date() > otpRequest.expiresAt) {
      await OtpRequest.deleteOne({ phone: formattedPhone });
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Increment attempts
    otpRequest.attempts += 1;

    // Check maximum attempts
    if (otpRequest.attempts > 3) {
      await OtpRequest.deleteOne({ phone: formattedPhone });
      return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    // Debug logging for OTP comparison
    console.log('Stored OTP:', otpRequest.otp);
    console.log('Received OTP:', otp);

    // Verify OTP
    if (otpRequest.otp !== otp) {
      await otpRequest.save();
      return res.status(400).json({ 
        error: 'Invalid OTP',
        remainingAttempts: 3 - otpRequest.attempts
      });
    }

    // Mark as verified
    otpRequest.isVerified = true;
    await otpRequest.save();

    return res.status(200).json({ 
      message: 'OTP verified successfully!',
      canProceedToRegistration: true 
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'OTP verification failed', details: error.message });
  }
});

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = new User({
    name,
    email,
    phone,
    password,
  });

  await newUser.save();

  res.status(201).json({ message: 'User registered successfully' });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate tokens with more comprehensive payload
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      isManufacturer: user.isManufacturer || false,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { 
      id: user._id,
      email: user.email,
      isManufacturer: user.isManufacturer || false
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }  // Extended refresh token duration
  );

  // Update user with new refresh token
  user.refreshToken = refreshToken;
  user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Respond with tokens
  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,  // Include refresh token in response
    expiresIn: '1h',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      isManufacturer: user.isManufacturer || false
    }
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken,
      refreshTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      accessToken,
      expiresIn: '1h'
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// ADD THIS NEW FUNCTION - Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isManufacturer: user.isManufacturer || false,
      role: user.role || 'user',
      manufacturerProfile: user.manufacturerProfile || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user profile' 
    });
  }
});

const updateUserToManufacturer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update user role
  user.isManufacturer = true;

  // Save updated user
  const updatedUser = await user.save();

  res.json({
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isManufacturer: updatedUser.isManufacturer,
    manufacturerProfile: updatedUser.manufacturerProfile,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Get user from the request (assuming auth middleware sets req.user)
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }
    
    // Find the user and clear their refresh token
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Clear the refresh token and expiry
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    
    // Clear refresh token cookie if you're using cookies
    res.clearCookie('refreshToken');
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

export { 
  sendOTP, 
  verifyOTP, 
  registerUser, 
  loginUser, 
  refreshToken, 
  getUserProfile,  // ADD THIS EXPORT
  updateUserToManufacturer,
  logoutUser 
};