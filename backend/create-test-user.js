import mongoose from 'mongoose';
import User from './models/User.js';

// Connect to MongoDB with longer timeout
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy', {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
});

async function createTestUser() {
    try {
        console.log('Connected to MongoDB');
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: 'testuser@example.com' });
        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            console.log('Updating password...');
            existingUser.password = 'MyPass123!';
            await existingUser.save();
            console.log('Password updated successfully!');
            return;
        }
        
        // Create new user with valid password
        const user = new User({
            email: 'testuser@example.com',
            password: 'MyPass123!', // This should meet the requirements
            full_name: 'Test User',
            phone: '+1234567890',
            address: '123 Test Street'
        });
        
        await user.save();
        console.log('Test user created successfully!');
        console.log('Email: testuser@example.com');
        console.log('Password: MyPass123!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

createTestUser();