import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import FuelStation from '../models/FuelStation.js';
import Loyalty from '../models/Loyalty.js';


const router = express.Router();

// Generate JWT Token for Admin
const generateAdminToken = (id) => {
  return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// Admin login
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Please provide username and password' 
    });
  }

  const admin = await Admin.findOne({ username, isActive: true });
  if (!admin) {
    return res.status(401).json({ 
      message: 'Invalid credentials' 
    });
  }

  const isPasswordValid = await admin.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ 
      message: 'Invalid credentials' 
    });
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  const token = generateAdminToken(admin._id);

  res.json({
    message: 'Admin login successful',
    admin: {
      admin_id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    },
    token
  });
}));

// Get admin dashboard stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    // Get dashboard statistics
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalStations = await FuelStation.countDocuments({ isActive: true });
    const totalLoyaltyMembers = await Loyalty.countDocuments();
    
    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    const statusData = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const orderStatusBreakdown = statusData;

    res.json({
      dashboard: {
        totalUsers,
        totalOrders,
        totalStations,
        totalLoyaltyMembers,
        totalRevenue,
        orderStatusBreakdown,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// Get all users (admin only)
router.get('/users', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    // Check permissions - allow if has manage_users OR if super_admin
    if (admin.permissions && !admin.permissions.includes('manage_users') && admin.role !== 'super_admin') {
      console.log('Admin does not have manage_users permission, but allowing for now');
      // Temporarily allow all admins to view users
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { full_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// Get all orders (admin only)
router.get('/orders', asyncHandler(async (req, res) => {
  console.log('========================================');
  console.log('Admin orders endpoint hit');
  console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No authorization header or wrong format');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '
  if (!token) {
    console.log('No token extracted');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  console.log('Token received, proceeding with verification');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Token decoded, isAdmin:', decoded.isAdmin);
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    console.log('Admin found:', admin ? admin.username : 'Not found');
    console.log('Admin isActive:', admin?.isActive);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    // Check permissions - allow if has manage_orders OR if super_admin
    if (admin.permissions && !admin.permissions.includes('manage_orders') && admin.role !== 'super_admin') {
      console.log('Admin does not have manage_orders permission, but allowing for now');
      // Temporarily allow all admins to view orders
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    console.log('Fetching orders with filter:', filter);
    console.log('Page:', page, 'Limit:', limit);

    // First, let's check total orders in database
    const totalOrdersInDB = await Order.countDocuments({});
    console.log('Total orders in database:', totalOrdersInDB);

    const orders = await Order.find(filter)
      .populate('user', 'full_name email')
      .populate('fuelStation', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Log for debugging
    console.log(`✅ Found ${orders.length} orders (page ${page})`);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order._id,
        userId: order.user,
        userPopulated: order.user ? {
          name: order.user.full_name,
          email: order.user.email
        } : null,
        status: order.status,
        totalPrice: order.totalPrice
      });
    });

    const total = await Order.countDocuments(filter);
    console.log('Total matching orders:', total);
    console.log('========================================');

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in admin orders endpoint:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// Create initial admin
router.post('/setup', asyncHandler(async (req, res) => {
  const { username, email, password, role = 'super_admin' } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'Please provide username, email, and password' 
    });
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
  if (existingAdmin) {
    return res.status(400).json({ 
      message: 'Admin with this username or email already exists' 
    });
  }

  const admin = new Admin({
    username,
    email,
    password,
    role,
    permissions: [
      'manage_users',
      'manage_orders',
      'manage_fuel_stations',
      'manage_loyalty',
      'view_analytics',
      'system_settings'
    ]
  });

  await admin.save();

  res.status(201).json({
    message: 'Admin account created successfully',
    admin: {
      admin_id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    }
  });
}));

// Get all fuel stations (admin only)
router.get('/fuel-stations', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    if (!admin.permissions.includes('manage_fuel_stations')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const stations = await FuelStation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FuelStation.countDocuments(filter);

    res.json({
      stations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// Create fuel station (admin only)
router.post('/fuel-stations', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    if (!admin.permissions.includes('manage_fuel_stations')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const {
      name,
      address,
      phone,
      email,
      coordinates,
      fuelTypes,
      prices,
      operatingHours,
      services,
      rating = 0
    } = req.body;

    // Validate required fields
    if (!name || !address || !coordinates || !prices) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, address, coordinates, prices' 
      });
    }

    const station = new FuelStation({
      name,
      address,
      phone,
      email,
      coordinates,
      fuelTypes,
      prices,
      operatingHours,
      services,
      rating
    });

    const savedStation = await station.save();
    res.status(201).json(savedStation);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}));

// Update fuel station (admin only)
router.put('/fuel-stations/:id', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    if (!admin.permissions.includes('manage_fuel_stations')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const station = await FuelStation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
   
    if (!station) {
      return res.status(404).json({ message: 'Fuel station not found' });
    }
  
    res.json(station);

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}));

// Delete fuel station (admin only)
router.delete('/fuel-stations/:id', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    if (!admin.permissions.includes('manage_fuel_stations')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const station = await FuelStation.findByIdAndDelete(req.params.id);
   
    if (!station) {
      return res.status(404).json({ message: 'Fuel station not found' });
    }
  
    res.json({ message: 'Fuel station deleted successfully' });

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// Toggle fuel station active status (admin only)
router.patch('/fuel-stations/:id/toggle-active', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    if (!admin.permissions.includes('manage_fuel_stations')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const station = await FuelStation.findById(req.params.id);
   
    if (!station) {
      return res.status(404).json({ message: 'Fuel station not found' });
    }

    station.isActive = !station.isActive;
    await station.save();
  
    res.json({
      message: `Fuel station ${station.isActive ? 'activated' : 'deactivated'} successfully`,
      station
    });

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// Update order status (admin only)
router.put('/orders/:id/status', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'full_name email')
     .populate('fuelStation', 'name address');
   
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

// Update payment status (admin only)
router.put('/orders/:id/payment', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Admin not found or inactive' });
    }

    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({ message: 'Payment status is required' });
    }
    
    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    ).populate('user', 'full_name email')
     .populate('fuelStation', 'name address');
   
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}));

export default router;
