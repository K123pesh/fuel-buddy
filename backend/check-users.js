import mongoose from 'mongoose';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');

async function checkUsers() {
    try {
        const users = await User.find({});
        console.log('Users in database:');
        users.forEach(user => {
            console.log(`- Email: ${user.email}, Name: ${user.full_name}, Role: ${user.role}`);
        });
        
        if (users.length === 0) {
            console.log('No users found. Creating test user...');
            
            const testUser = new User({
                email: 'testuser@example.com',
                password: 'Test123!',
                full_name: 'Test User',
                phone: '+1234567890',
                address: '123 Test Street'
            });
            
            await testUser.save();
            console.log('Test user created successfully!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkUsers();