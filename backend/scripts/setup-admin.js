import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');

async function setupAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.username);
            return;
        }

        // Create admin user
        const admin = new Admin({
            username: 'admin',
            email: 'admin@fuelbuddy.com',
            password: 'admin123',
            role: 'super_admin',
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
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Email: admin@fuelbuddy.com');

    } catch (error) {
        console.error('Error setting up admin:', error);
    } finally {
        mongoose.connection.close();
    }
}

setupAdmin();