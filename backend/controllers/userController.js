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
      isAdmin: user.isAdmin || false,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { 
      id: user._id,
      email: user.email,
      isManufacturer: user.isManufacturer || false,
      isAdmin: user.isAdmin || false
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Update user with new refresh token
  user.refreshToken = refreshToken;
  user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // FIXED: Set refresh token as httpOnly cookie with proper settings
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Changed for CORS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/' // Ensure cookie is available for all paths
  };

  console.log('Setting refresh token cookie with options:', cookieOptions);
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Respond with tokens
  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,  // Include refresh token in response for debugging
    expiresIn: '1h',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      isManufacturer: user.isManufacturer || false,
      isAdmin: user.isAdmin || false
    }
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  try {
    console.log('=== REFRESH TOKEN REQUEST ===');
    console.log('All Cookies:', req.cookies);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    // FIXED: Try multiple ways to get the refresh token
    let token = req.cookies?.refreshToken || 
                req.body?.refreshToken || 
                req.headers['x-refresh-token'] ||
                (req.headers.authorization && req.headers.authorization.startsWith('Refresh ') 
                  ? req.headers.authorization.slice(8) : null);

    console.log('Extracted refresh token:', token ? 'Token present' : 'No token found');

    if (!token) {
      console.log('❌ No refresh token found in cookies, body, or headers');
      
      // Clear any invalid refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });
      
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token not found',
        debug: {
          cookiesPresent: !!req.cookies,
          bodyPresent: !!req.body,
          refreshTokenInBody: !!req.body?.refreshToken
        }
      });
    }

    console.log('🔍 Verifying refresh token...');

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log('✅ Token decoded:', { userId: decoded.id, email: decoded.email });

    // FIXED: Find user and validate refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: token,
      refreshTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      console.log('❌ User not found or refresh token expired/invalid');
      console.log('Expected token in DB:', user?.refreshToken);
      console.log('Received token:', token);
      
      // Clear the invalid refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      });
      
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired refresh token' 
      });
    }

    console.log('✅ User found, generating new access token...');

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        isManufacturer: user.isManufacturer || false,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // OPTIONAL: Generate new refresh token for rotation
    const newRefreshToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        isManufacturer: user.isManufacturer || false,
        isAdmin: user.isAdmin || false
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Update user with new refresh token
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Set new refresh token cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    };
    
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    console.log('✅ New access token generated successfully');

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken, // Include in response for debugging
      expiresIn: '1h'
    });
  } catch (error) {
    console.error('❌ Error refreshing token:', error.name, error.message);
    
    // Clear the invalid refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token has expired' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid refresh token format' 
      });
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid refresh token' 
      });
    }
  }
});

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isManufacturer: user.isManufacturer || false,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
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
  const user = await User.findById(req.user.id || req.userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update user role
  user.isManufacturer = true;

  // Save updated user
  const updatedUser = await user.save();

  res.json({
    success: true,
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isManufacturer: updatedUser.isManufacturer,
    }
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Get user from the request (assuming auth middleware sets req.user)
    const userId = req.user.id || req.userId;
    
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
    
    // Clear refresh token cookie with proper options
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    
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
  getUserProfile,
  updateUserToManufacturer,
  logoutUser 
};