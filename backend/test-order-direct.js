// Test script to create an order directly in the database
// Run with: node backend/test-order-direct.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import User from './models/User.js';

dotenv.config({ path: './.env' });

async function testOrderCreation() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }
    console.log('✅ Found user:', user.full_name, user.email);

    // Create a test order
    const order = new Order({
      user: user._id,
      serviceType: 'fuel_delivery',
      fuelStation: null,
      fuelType: 'regular',
      quantity: 10,
      totalPrice: 1262,
      currency: 'INR',
      deliveryAddress: '123 Test Address, Mumbai, Maharashtra',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash_on_delivery',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      specialInstructions: 'Test order'
    });

    const savedOrder = await order.save();
    console.log('✅ Order saved successfully!');
    console.log('Order ID:', savedOrder._id);
    console.log('Order Status:', savedOrder.status);
    console.log('Order Total:', savedOrder.totalPrice);

    // Verify the order exists
    const foundOrder = await Order.findById(savedOrder._id);
    if (foundOrder) {
      console.log('✅ Order verified in database!');
      console.log('Found order:', foundOrder._id, foundOrder.status, foundOrder.totalPrice);
    } else {
      console.log('❌ Order not found in database!');
    }

    // List all orders
    const allOrders = await Order.find({});
    console.log('📊 Total orders in database:', allOrders.length);
    allOrders.forEach(o => {
      console.log('  - Order:', o._id, '| User:', o.user, '| Status:', o.status, '| Total:', o.totalPrice);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testOrderCreation();
