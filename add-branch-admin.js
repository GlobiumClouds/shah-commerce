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
      authToken = response.data.data?.accessToken || response.data.data?.token;
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
async function createBranch() {
  console.log('\n🏫 Creating test branch...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/super-admin/branches`, {
      name: 'Test Branch Karachi',
      code: 'TBK001',
      address: '123 Main Street, Karachi, Pakistan',
      contact: '+92-300-1234567',
      adminId: null,
      settings: {
        timezone: 'Asia/Karachi',
        currency: 'PKR'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Branch created successfully!');
      console.log('📋 Branch Details:');
      console.log(`   Name: ${response.data.data.name}`);
      console.log(`   Code: ${response.data.data.code}`);
      console.log(`   Address: ${response.data.data.address}`);
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
 * Register branch admin
 */
async function registerBranchAdmin(branchId) {
  console.log('\n👤 Registering branch admin...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      fullName: 'Ahmed Khan',
      email: 'branchadmin@karachi.com',
      password: 'BranchAdmin@123',
      phone: '+92-300-1234567',
      role: 'branch_admin',
      branchId: branchId
    });

    if (response.data.success) {
      console.log('✅ Branch admin registered successfully!');
      console.log('📋 Branch Admin Details:');
      console.log(`   Name: ${response.data.data.fullName}`);
      console.log(`   Email: ${response.data.data.email}`);
      console.log(`   Role: ${response.data.data.role}`);
      console.log(`   Branch ID: ${response.data.data.branchId}`);
      return response.data.data;
    } else {
      console.log('❌ Failed to register branch admin:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Register branch admin error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Get all branches to verify
 */
async function getAllBranches() {
  console.log('\n📋 Fetching all branches to verify...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/branches`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Retrieved branches successfully!');
      console.log(`📊 Total branches: ${response.data.data.length}`);
      response.data.data.forEach((branch, index) => {
        console.log(`   ${index + 1}. ${branch.name} (${branch.code}) - ${branch.address}`);
      });
      return response.data.data;
    } else {
      console.log('❌ Failed to get branches:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Get branches error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Super Admin Login and Branch Admin Addition Script');
  console.log('=' .repeat(60));

  // Step 1: Login as super admin
  const loginSuccess = await loginSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Script failed: Could not login as super admin');
    return;
  }

  // Step 2: Create branch
  const branch = await createBranch();
  if (!branch) {
    console.log('❌ Script failed: Could not create branch');
    return;
  }

  // Step 3: Register branch admin
  const branchAdmin = await registerBranchAdmin(branch._id);
  if (!branchAdmin) {
    console.log('❌ Script failed: Could not register branch admin');
    return;
  }

  // Step 4: Verify by getting all branches
  await getAllBranches();

  console.log('\n🎉 Script completed successfully!');
  console.log('=' .repeat(60));
  console.log('\n📋 Summary:');
  console.log(`Branch: ${branch.name} (${branch.code})`);
  console.log(`Branch Admin: ${branchAdmin.fullName} (${branchAdmin.email})`);
  console.log(`Password: BranchAdmin@123`);
}

// Run the script
main().catch(console.error);
