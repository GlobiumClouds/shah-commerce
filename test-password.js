const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the database connection and User model
const connectDB = require('./src/lib/database');
const User = require('./src/backend/models/User');

const SUPER_ADMIN_EMAIL = 'superadmin@gmail.com';
const SUPER_ADMIN_PASSWORD = 'password123';

async function testPassword() {
  try {
    // Connect to database using the same connection as the app
    await connectDB();

    console.log('🔍 Testing password verification...');

    // Find the super admin user
    const user = await User.findOne({ email: SUPER_ADMIN_EMAIL }).select('+passwordHash');
    if (!user) {
      console.log('❌ Super admin user not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('🔐 Password hash exists:', !!user.passwordHash);
    console.log('👤 User role:', user.role);
    console.log('✅ User active:', user.isActive);

    // Test password comparison
    const isValid = await user.comparePassword(SUPER_ADMIN_PASSWORD);
    console.log('🔑 Password valid:', isValid);

    if (!isValid) {
      console.log('❌ Password comparison failed. Let me check the hash manually...');

      // Manual bcrypt comparison
      const manualCheck = await bcrypt.compare(SUPER_ADMIN_PASSWORD, user.passwordHash);
      console.log('🔧 Manual bcrypt check:', manualCheck);

      // Check if password is already hashed
      const doubleHashCheck = await bcrypt.compare(await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10), user.passwordHash);
      console.log('🔄 Double hash check:', doubleHashCheck);

      // Show first 20 chars of hash for debugging
      console.log('🔍 Hash starts with:', user.passwordHash.substring(0, 20) + '...');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testPassword();
