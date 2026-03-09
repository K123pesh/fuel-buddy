import Order from './models/Order.js';
import User from './models/User.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testCashOnDelivery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    console.log('✅ Connected to MongoDB');

    // Find or create test user
    let testUser = await User.findOne({ email: 'codtest@example.com' });
    if (!testUser) {
      testUser = new User({
        email: 'codtest@example.com',
        password: 'password123',
        full_name: 'COD Test User',
        phone: '+1234567890',
        address: '456 COD Test Street'
      });
      await testUser.save();
      console.log('✅ Created COD test user');
    }

    // Create a cash on delivery order
    const codOrder = new Order({
      user: testUser._id,
      fuelStation: new mongoose.Types.ObjectId(),
      fuelType: 'diesel',
      quantity: 20,
      totalPrice: 85.00,
      deliveryAddress: '456 COD Test Street, Test City',
      deliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      specialInstructions: 'Please call before arrival',
      paymentMethod: 'cash_on_delivery',
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    const savedOrder = await codOrder.save();
    console.log('✅ Created COD order:', savedOrder._id);
    console.log('   Payment Method:', savedOrder.paymentMethod);
    console.log('   Total Price:', savedOrder.totalPrice);
    console.log('   Cash Collected:', savedOrder.cashOnDeliveryCollected);

    // Simulate cash collection
    console.log('\n🧪 Simulating cash collection...');
    const collectionAmount = 90.00; // Customer pays with $90
    
    // Update order to simulate cash collection
    const updatedOrder = await Order.findByIdAndUpdate(
      savedOrder._id,
      {
        cashOnDeliveryCollected: true,
        cashCollectionAmount: collectionAmount,
        paymentStatus: 'paid',
        status: 'delivered'
      },
      { new: true }
    );

    console.log('✅ Cash collected successfully!');
    console.log('   Amount Required: $', updatedOrder.totalPrice);
    console.log('   Amount Collected: $', updatedOrder.cashCollectionAmount);
    console.log('   Change Due: $', updatedOrder.cashCollectionAmount - updatedOrder.totalPrice);
    console.log('   Payment Status:', updatedOrder.paymentStatus);
    console.log('   Order Status:', updatedOrder.status);

    // Test finding pending COD orders
    console.log('\n🔍 Finding pending COD orders...');
    const pendingCodOrders = await Order.find({
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      status: { $in: ['confirmed', 'dispatched'] }
    });
    
    console.log(`✅ Found ${pendingCodOrders.length} pending COD orders`);

    console.log('\n🎉 Cash on delivery test completed successfully!');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error during COD test:', error.message);
    process.exit(1);
  }
};

testCashOnDelivery();
