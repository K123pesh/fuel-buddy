import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Use the MONGODB_URI from environment variables, with fallback
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy';
    
    console.log(`Using connection string: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Mask credentials in log
    
    const conn = await mongoose.connect(uri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database name: ${conn.connection.name}`);
    console.log(`✅ Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Close the connection after testing
    await mongoose.connection.close();
    console.log('✅ Connection test completed and closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();