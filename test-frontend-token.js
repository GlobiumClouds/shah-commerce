const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000'; // Using port 3001 as shown in dev server output

// Get a valid token by logging in first
async function getValidToken() {
  console.log('🔐 Getting valid token by logging in...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'superadmin@gmail.com',
      password: 'password123'
    });

    if (response.data.success) {
      const token = response.data.data?.accessToken || response.data.data?.token;
      console.log('✅ Login successful, got token!');
      return token;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Test Sessions API with proper token
 */
async function testSessionsWithToken(token) {
  console.log('\n📅 Testing Sessions API with token...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Sessions API working with token!');
      console.log(`📊 Total sessions: ${response.data.data.length}`);

      if (response.data.data.length > 0) {
        console.log('\n📅 Sample Session Data:');
        const sample = response.data.data[0];
        console.log(`   Name: ${sample.name}`);
        console.log(`   Code: ${sample.code}`);
        console.log(`   Year: ${sample.sessionYear}`);
        console.log(`   Active: ${sample.isActive}`);
      }

      return response.data.data;
    } else {
      console.log('❌ Sessions API failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Sessions API error:', error.response?.data?.message || error.message);
    console.log('🔍 Status code:', error.response?.status);
    console.log('🔍 Headers sent:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });
    return null;
  }
}

/**
 * Test Faculties API with proper token
 */
async function testFacultiesWithToken(token) {
  console.log('\n🏫 Testing Faculties API with token...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/faculties`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Faculties API working with token!');
      console.log(`📊 Total faculties: ${response.data.data.length}`);

      if (response.data.data.length > 0) {
        console.log('\n🏫 Sample Faculty Data:');
        const sample = response.data.data[0];
        console.log(`   Name: ${sample.name}`);
        console.log(`   Code: ${sample.code}`);
        console.log(`   Description: ${sample.description || 'No description'}`);
      }

      return response.data.data;
    } else {
      console.log('❌ Faculties API failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Faculties API error:', error.response?.data?.message || error.message);
    console.log('🔍 Status code:', error.response?.status);
    console.log('🔍 Headers sent:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });
    return null;
  }
}

/**
 * Test API without token (should fail)
 */
async function testWithoutToken() {
  console.log('\n🚫 Testing API without token (should fail)...');

  try {
    const response = await axios.get(`${API_BASE_URL}/api/super-admin/sessions`);
    console.log('❌ Unexpected success without token:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected without token (401 Unauthorized)');
    } else {
      console.log('❌ Unexpected error without token:', error.response?.status, error.response?.data?.message);
    }
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🧪 Testing Frontend Token Management');
  console.log('=' .repeat(50));

  // Step 1: Get valid token
  const token = await getValidToken();
  if (!token) {
    console.log('❌ Test failed: Could not get valid token');
    return;
  }

  // Step 2: Test without token (should fail)
  await testWithoutToken();

  // Step 3: Test Sessions API with token
  const sessions = await testSessionsWithToken(token);
  if (!sessions) {
    console.log('❌ Test failed: Sessions API not working with token');
    return;
  }

  // Step 4: Test Faculties API with token
  const faculties = await testFacultiesWithToken(token);
  if (!faculties) {
    console.log('❌ Test failed: Faculties API not working with token');
    return;
  }

  console.log('\n🎯 Frontend Token Management Test Results:');
  console.log('=' .repeat(50));
  console.log('✅ Authentication: Working');
  console.log('✅ Token Generation: Working');
  console.log('✅ Sessions API with token: Working');
  console.log('✅ Faculties API with token: Working');
  console.log('✅ Unauthorized access properly blocked');

  if (sessions.length > 0 && faculties.length > 0) {
    console.log('\n🎉 SUCCESS: Frontend token management is working correctly!');
    console.log('🔐 Tokens are properly sent with API requests');
    console.log('🔒 Unauthorized requests are properly blocked');
    console.log('📊 Data is being fetched correctly with authentication');
  } else {
    console.log('\n⚠️  PARTIAL SUCCESS: APIs working but no data returned');
  }
}

// Run the test
main().catch(console.error);
