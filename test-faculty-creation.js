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
 * Test faculty creation
 */
async function testFacultyCreation() {
  console.log('\n🏫 Testing faculty creation...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/super-admin/faculties`, {
      name: 'Test Faculty',
      code: 'TEST',
      description: 'Test faculty for verification'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Faculty created successfully!');
      console.log('📋 Faculty Details:');
      console.log(`   Name: ${response.data.data.name}`);
      console.log(`   Code: ${response.data.data.code}`);
      console.log(`   Description: ${response.data.data.description}`);
      console.log(`   ID: ${response.data.data._id}`);
      return response.data.data;
    } else {
      console.log('❌ Failed to create faculty:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Faculty creation error:', error.response?.data?.message || error.message);
    console.log('❌ Status code:', error.response?.status);
    return null;
  }
}

/**
 * Get all faculties to verify
 */
async function getAllFaculties() {
  console.log('\n📋 Fetching all faculties to verify...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/faculties`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Retrieved faculties successfully!');
      console.log(`📊 Total faculties: ${response.data.data.length}`);
      response.data.data.forEach((faculty, index) => {
        console.log(`   ${index + 1}. ${faculty.name} (${faculty.code}) - ID: ${faculty._id}`);
      });
      return response.data.data;
    } else {
      console.log('❌ Failed to get faculties:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Get faculties error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Testing Faculty Creation API');
  console.log('=' .repeat(50));

  // Step 1: Login as super admin
  const loginSuccess = await loginSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Test failed: Could not login as super admin');
    return;
  }

  // Step 2: Test faculty creation
  const faculty = await testFacultyCreation();
  if (!faculty) {
    console.log('❌ Test failed: Could not create faculty');
    return;
  }

  // Step 3: Verify by getting all faculties
  await getAllFaculties();

  console.log('\n🎉 Faculty creation test completed successfully!');
  console.log('=' .repeat(50));
}

// Run the test
main().catch(console.error);
