const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

const SUPER_ADMIN_EMAIL = 'superadmin@gmail.com';
const SUPER_ADMIN_PASSWORD = 'password123';

let authToken = null;

/**
 * Login as Super Admin
 */
async function loginSuperAdmin() {
  console.log('🔐 Logging in as Super Admin...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    });

    if (response.data.success) {
      authToken = response.data.data?.token || response.data.data?.accessToken;
      console.log('✅ Login successful!');
      console.log(`🔑 Token: ${authToken ? authToken.substring(0, 50) + '...' : 'No token received'}`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Create a test branch
 */
async function createTestBranch() {
  console.log('\n🏫 Creating test branch...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/super-admin/branches`, {
      name: 'Test Branch',
      code: 'TEST001',
      address: 'Test Address, Islamabad',
      contact: '+923001234567',
      adminId: null,
      settings: {}
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Test branch created successfully!');
      return response.data.data;
    } else {
      console.log('❌ Failed to create branch:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Create branch error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Register test users
 */
async function registerTestUsers(branchId) {
  console.log('\n👥 Registering test users...');

  const testUsers = [
    {
      fullName: 'Branch Admin',
      email: 'branchadmin@gmail.com',
      password: '123456',
      phone: '+923001234567',
      role: 'branch_admin',
      branchId: branchId
    },
    {
      fullName: 'Teacher User',
      email: 'teacher@gmail.com',
      password: '12345',
      phone: '+923001234568',
      role: 'teacher',
      branchId: branchId
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`📝 Registering: ${user.fullName} (${user.email})`);

      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, user);

      if (response.data.success) {
        console.log(`✅ Successfully registered: ${user.email}\n`);
      } else {
        console.log(`❌ Failed to register ${user.email}:`, response.data.message, '\n');
      }
    } catch (error) {
      console.log(`❌ Error registering ${user.email}:`, error.response?.data?.message || error.message, '\n');
    }
  }
}

/**
 * Main setup function
 */
async function setupTestUsers() {
  console.log('🚀 Setting up test users...');
  console.log('=' .repeat(50));

  // Step 1: Login as super admin
  const loginSuccess = await loginSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Setup failed: Could not login as super admin');
    return;
  }

  // Step 2: Create test branch
  const branch = await createTestBranch();
  if (!branch) {
    console.log('❌ Setup failed: Could not create test branch');
    return;
  }

  // Step 3: Register test users
  await registerTestUsers(branch._id);

  console.log('🎉 Setup completed successfully!');
  console.log('=' .repeat(50));
  console.log('\n📋 Test Accounts:');
  console.log('Super Admin: superadmin@gmail.com / password123');
  console.log('Branch Admin: branchadmin@gmail.com / 123456');
  console.log('Teacher: teacher@gmail.com / 12345');
}

// Run the setup
setupTestUsers().catch(console.error);
