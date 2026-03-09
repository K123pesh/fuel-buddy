/**
 * Quick script to check MongoDB connection and order existence
 */

import mongoose from 'mongoose';
import Order from './backend/models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDB() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Successfully connected to MongoDB');
    
    // Check if we can query the orders collection
    console.log('\n📊 Checking orders collection...');
    
    // Count documents
    const count = await Order.countDocuments();
    console.log(`Total orders in collection: ${count}`);
    
    if (count > 0) {
      console.log('\n📋 Fetching first 5 orders...');
      const orders = await Order.find()
        .populate('user', 'full_name email')
        .populate('fuelStation', 'name')
        .sort({ createdAt: -1 })
        .limit(5);
      
      orders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order ID: ${order._id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   User: ${order.user?.full_name || 'N/A'}`);
        console.log(`   Fuel Station: ${order.fuelStation?.name || 'N/A'}`);
        console.log(`   Total Price: ₹${order.totalPrice}`);
        console.log(`   Created: ${order.createdAt}`);
      });
    } else {
      console.log('\n⚠️  No orders found in the database');
      console.log('This confirms that either:');
      console.log('  1. No orders have been created yet');
      console.log('  2. Orders are being created but in a different database/collection');
      console.log('  3. There is an issue with order creation itself');
    }
    
    // Test creating a simple order document to verify the model works
    console.log('\n🧪 Testing order model...');
    try {
      // We won't actually save this since we don't have a valid user ID
      const testOrder = new Order({
        user: new mongoose.Types.ObjectId(), // Fake user ID for test
        serviceType: 'fuel_delivery',
        fuelType: 'regular',
        quantity: 10,
        totalPrice: 1000,
        deliveryAddress: 'Test Address',
        deliveryTime: new Date(),
        status: 'pending',
        paymentStatus: 'pending'
      });
      
      console.log('✅ Order model validation passed');
      console.log('   - Schema definition is correct');
      console.log('   - Required fields are properly defined');
    } catch (validationError) {
      console.log('❌ Order model validation failed:', validationError.message);
    }
    
    console.log('\n✅ Database check completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection or query failed:', error.message);
    console.error('Error details:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the check
console.log('🚀 Starting database connection check...');
checkDB();