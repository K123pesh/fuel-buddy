import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testCollections = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-buddy');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Available collections:');
    collections.forEach(col => console.log('   - ' + col.name));
    
    const db = mongoose.connection.db;
    console.log('\n--- Collection Document Counts ---');
    
    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments();
        console.log(`✅ ${col.name}: ${count} documents`);
      } catch (error) {
        console.log(`❌ ${col.name}: Error - ${error.message}`);
      }
    }
    
    console.log('\n--- Testing CRUD Operations ---');
    
    // Test reading from each collection
    for (const col of collections) {
      try {
        const sampleDocs = await db.collection(col.name).find().limit(1).toArray();
        if (sampleDocs.length > 0) {
          console.log(`✅ ${col.name}: Read successful`);
          console.log(`   Sample:`, JSON.stringify(sampleDocs[0], null, 2));
        } else {
          console.log(`✅ ${col.name}: Read successful (empty collection)`);
        }
      } catch (error) {
        console.log(`❌ ${col.name}: Read failed - ${error.message}`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Collection testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testCollections();