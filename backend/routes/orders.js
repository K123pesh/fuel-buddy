import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import User from '../models/User.js';
import FuelStation from '../models/FuelStation.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

// Get all orders for a user
router.get('/', asyncHandler(async (req, res) => {
  const { userId } = req.query;
  
  let filter = {};
  if (userId) {
    filter.user = userId;
  }
  
  const orders = await Order.find(filter)
    .populate('user', 'full_name email phone')
    .populate('fuelStation', 'name address phone')
    .sort({ createdAt: -1 });
    
  res.json(orders);
}));

// Create a new order
router.post('/', asyncHandler(async (req, res) => {
  console.log('Order creation endpoint hit');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
  const {
    serviceType,
    fuelStation,
    fuelType,
    quantity,
    totalPrice,
    deliveryAddress,
    deliveryTime,
    specialInstructions,
    paymentMethod = 'cash_on_delivery'
  } = req.body;

  // Get token and authenticate user manually
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No authorization header or wrong format for order creation');
    return res.status(401).json({ message: 'Authentication required. Please login to place an order' });
  }
  
  const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '
  if (!token) {
    console.log('No token extracted for order creation');
    return res.status(401).json({ message: 'Authentication required. Please login to place an order' });
  }

  let authenticatedUser;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    authenticatedUser = await User.findById(decoded.id);
    if (!authenticatedUser) {
      return res.status(401).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Validate required fields
  if (!serviceType || !totalPrice || !deliveryAddress || !deliveryTime) {
    return res.status(400).json({ 
      message: 'Missing required fields: serviceType, totalPrice, deliveryAddress, deliveryTime' 
    });
  }

  // Validate service type
  if (serviceType !== 'fuel_delivery') {
    return res.status(400).json({ message: 'Invalid service type' });
  }

  // Validate fuel delivery specific fields
  if (serviceType === 'fuel_delivery') {
    if (!fuelType || !quantity) {
      return res.status(400).json({ 
        message: 'Missing required fields for fuel delivery: fuelType, quantity' 
      });
    }
    
    if (!['regular', 'premium', 'diesel'].includes(fuelType)) {
      return res.status(400).json({ message: 'Invalid fuel type. Must be regular, premium, or diesel' });
    }
    
    // fuelStation is optional - if not provided, we'll assign a default one
    if (!fuelStation) {
      console.log('No fuel station provided, will use default assignment');
    }
  }

  // Validate payment method
  if (!['cash_on_delivery', 'card', 'wallet'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  // Create new order
  const order = new Order({
    user: authenticatedUser._id,
    serviceType,
    fuelStation: fuelStation || null,
    fuelType,
    quantity,
    totalPrice,
    currency: 'INR',
    deliveryAddress,
    deliveryTime: new Date(deliveryTime),
    specialInstructions: specialInstructions || '',
    paymentMethod,
    status: 'pending',
    paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending'
  });

  const savedOrder = await order.save();
  console.log('Order saved successfully:', savedOrder);
  
  // Populate references for response
  await savedOrder.populate('user', 'full_name email phone');
  await savedOrder.populate('fuelStation', 'name address phone');

  console.log('Order populated and ready to send:', savedOrder);
  res.status(201).json(savedOrder);
} catch (error) {
  console.error('Order creation error:', error);
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  res.status(500).json({ 
    message: error.message || 'Something went wrong!',
    error: error.name 
  });
}
}));

// Get a specific order by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'full_name email phone')
    .populate('fuelStation', 'name address phone');
    
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
    
  res.json(order);
}));

// Update order status
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('user', 'full_name email phone')
   .populate('fuelStation', 'name address phone');
   
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  res.json(order);
}));

// Update payment status
router.put('/:id/payment', asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  
  if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid payment status' });
  }
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus },
    { new: true, runValidators: true }
  ).populate('user', 'full_name email phone')
   .populate('fuelStation', 'name address phone');
   
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  res.json(order);
}));

// Collect cash on delivery
router.put('/:id/collect-cash', asyncHandler(async (req, res) => {
  const { amountCollected } = req.body;
  
  const order = await Order.findById(req.params.id);
   
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  if (order.paymentMethod !== 'cash_on_delivery') {
    return res.status(400).json({ message: 'This order is not cash on delivery' });
  }
  
  if (order.cashOnDeliveryCollected) {
    return res.status(400).json({ message: 'Cash already collected for this order' });
  }
  
  if (amountCollected < order.totalPrice) {
    return res.status(400).json({ 
      message: `Insufficient amount. Required: $${order.totalPrice}, Collected: $${amountCollected}` 
    });
  }
  
  // Update order with cash collection details
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      cashOnDeliveryCollected: true,
      cashCollectionAmount: amountCollected,
      paymentStatus: 'paid',
      status: 'delivered'
    },
    { new: true, runValidators: true }
  ).populate('user', 'full_name email phone')
   .populate('fuelStation', 'name address phone');
   
  res.json({
    message: 'Cash collected successfully',
    order: updatedOrder,
    change: amountCollected - order.totalPrice
  });
}));

// Get cash on delivery orders
router.get('/cash-on-delivery/pending', asyncHandler(async (req, res) => {
  const orders = await Order.find({
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    status: { $in: ['confirmed', 'dispatched'] }
  })
    .populate('user', 'full_name email phone')
    .populate('fuelStation', 'name address phone')
    .sort({ createdAt: -1 });
    
  res.json(orders);
}));

export default router;
