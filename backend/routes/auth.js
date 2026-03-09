import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Register user
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, full_name, phone, address } = req.body;

  // Validate required fields
  if (!email || !password || !full_name) {
    return res.status(400).json({ 
      message: 'Please provide email, password, and full name' 
    });
  }
  
  // Validate password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ 
      message: 'User with this email already exists' 
    });
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    full_name,
    phone: phone || '',
    address: address || ''
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      user_id: user._id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      role: user.role
    },
    token
  });
}));

// Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Please provide email and password' 
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ 
      message: 'Invalid email or password' 
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ 
      message: 'Invalid email or password' 
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    message: 'Login successful',
    user: {
      user_id: user._id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      role: user.role
    },
    token
  });
}));

// Get user profile
router.get('/profile', protect, asyncHandler(async (req, res) => {
  res.json({
    user_id: req.user._id,
    email: req.user.email,
    full_name: req.user.full_name,
    phone: req.user.phone,
    address: req.user.address,
    role: req.user.role
  });
}));

// Update user profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { full_name, phone, address } = req.body;
  
  // Validate input
  if (!full_name) {
    return res.status(400).json({ 
      message: 'Full name is required' 
    });
  }
  
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    
    const updatedUser = await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        user_id: updatedUser._id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error: ' + error.message });
    } else if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid user ID format' });
    } else {
      res.status(500).json({ message: 'Failed to update profile due to server error' });
    }
  }
}));

// Get current user (for token validation)
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user_id: user._id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      role: user.role
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}));

export default router;
