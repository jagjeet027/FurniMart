import { Manufacturer } from './models/manufacturer.js';
import { User } from './models/Users.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debugManufacturers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('=== CHECKING ALL MANUFACTURERS ===\n');
    
    // Get all manufacturers
    const allManufacturers = await Manufacturer.find({}).populate('userId', 'email name');
    
    console.log(`Total manufacturers in database: ${allManufacturers.length}\n`);
    
    allManufacturers.forEach((mfr, index) => {
      console.log(`${index + 1}. Manufacturer ID: ${mfr._id}`);
      console.log(`   User ID: ${mfr.userId._id}`);
      console.log(`   User Email: ${mfr.userId?.email || 'N/A'}`);
      console.log(`   Business Name: ${mfr.businessName}`);
      console.log(`   Status: ${mfr.status}`);
      console.log(`   Created: ${mfr.createdAt}\n`);
    });
    
    // Check for duplicates
    const userIds = allManufacturers.map(m => m.userId._id.toString());
    const duplicates = userIds.filter((id, index) => userIds.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
      console.log('⚠️  FOUND DUPLICATE USER IDs:');
      duplicates.forEach(id => console.log(`   ${id}`));
    } else {
      console.log('✅ No duplicate userId found');
    }
    
    // Check indexes
    console.log('\n=== INDEXES ===');
    const indexes = await Manufacturer.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

debugManufacturers();