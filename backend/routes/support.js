import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to verify JWT token (similar to orders route)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all support tickets for a user
router.get('/tickets', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .populate('user', 'full_name email phone')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch support tickets' });
  }
}));

// Create a new support ticket
router.post('/tickets', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { subject, message, priority } = req.body;

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({ 
        message: 'Subject and message are required' 
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ 
        message: 'Invalid priority. Must be one of: low, medium, high, urgent' 
      });
    }

    // Create new support ticket
    const supportTicket = new SupportTicket({
      user: req.user._id,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'medium'
    });

    const savedTicket = await supportTicket.save();
    
    // Populate user info for response
    const populatedTicket = await SupportTicket.findById(savedTicket._id)
      .populate('user', 'full_name email phone');

    console.log(`Support ticket created: ${savedTicket._id} by user ${req.user._id}`);
    
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Failed to create support ticket' });
  }
}));

// Get a specific support ticket
router.get('/tickets/:id', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('user', 'full_name email phone');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Failed to fetch support ticket' });
  }
}));

// Middleware to verify admin JWT token
const authenticateAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if this is an admin token
    if (decoded.isAdmin) {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({ message: 'Invalid admin token' });
      }
      req.admin = admin;
    } else {
      return res.status(401).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    return res.status(401).json({ message: 'Invalid admin token' });
  }
};

// Admin routes for ticket management

// Get all support tickets (admin only)
router.get('/admin/tickets', authenticateAdminToken, asyncHandler(async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await SupportTicket.find(filter)
      .populate('user', 'full_name email phone')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportTicket.countDocuments(filter);

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    res.status(500).json({ message: 'Failed to fetch support tickets' });
  }
}));

// Update ticket status (admin only)
router.put('/admin/tickets/:id', authenticateAdminToken, asyncHandler(async (req, res) => {
  try {
    const { status, adminResponse, adminNotes } = req.body;

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: open, in_progress, resolved, closed' 
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Update ticket
    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse.trim();
    if (adminNotes) ticket.adminNotes = adminNotes.trim();
    
    // Set resolved info if status is resolved
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.admin._id;
    }

    const updatedTicket = await ticket.save();
    
    // Populate for response
    const populatedTicket = await SupportTicket.findById(updatedTicket._id)
      .populate('user', 'full_name email phone')
      .populate('resolvedBy', 'name email');

    console.log(`Support ticket ${req.params.id} updated by admin ${req.admin._id}`);

    res.json({
      message: 'Support ticket updated successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Failed to update support ticket' });
  }
}));

export default router;
