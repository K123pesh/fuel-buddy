import Order from './models/Order.js';
import User from './models/User.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testOrderCreation = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB');

    // Check if any users exist, if not create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '+1234567890',
        address: '123 Test Street'
      });
      await testUser.save();
      console.log('✅ Created test user');
    }

    // Create a test order
    const testOrder = new Order({
      user: testUser._id,
      fuelStation: new mongoose.Types.ObjectId(), // Will be replaced with actual fuel station ID
      fuelType: 'regular',
      quantity: 10,
      totalPrice: 45.50,
      deliveryAddress: '123 Test Street, Test City',
      deliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      specialInstructions: 'Please deliver to the front door',
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedOrder = await testOrder.save();
    console.log('✅ Created test order:', savedOrder._id);

    // Verify the order was saved
    const retrievedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'full_name email');
    
    console.log('✅ Retrieved order:', {
      id: retrievedOrder._id,
      user: retrievedOrder.user.full_name,
      fuelType: retrievedOrder.fuelType,
      quantity: retrievedOrder.quantity,
      totalPrice: retrievedOrder.totalPrice,
      status: retrievedOrder.status
    });

    console.log('✅ Order creation test completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
  }
};

testOrderCreation();
