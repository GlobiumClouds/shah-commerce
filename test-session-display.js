const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testSessionDisplay() {
  console.log('🧪 Testing Session Display Issue');
  console.log('=' .repeat(50));

  try {
    // Step 1: Login as super admin
    console.log('🔐 Logging in as super admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'superadmin@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful, got token');

    // Step 2: Test sessions API
    console.log('\n📅 Testing Sessions API...');
    const sessionsResponse = await axios.get(`${API_BASE_URL}/api/super-admin/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Sessions API Response:');
    console.log('Status:', sessionsResponse.status);
    console.log('Success:', sessionsResponse.data.success);
    console.log('Data length:', sessionsResponse.data.data?.length || 0);

    if (sessionsResponse.data.success && sessionsResponse.data.data) {
      console.log('\n📋 Sessions Data:');
      sessionsResponse.data.data.forEach((session, index) => {
        console.log(`${index + 1}. ${session.name} (${session.sessionYear}) - ${session.isActive ? 'Active' : 'Inactive'}`);
      });
    }

    // Step 3: Test auth/me endpoint
    console.log('\n👤 Testing Auth Me endpoint...');
    const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Auth Me Response:');
    console.log('Success:', meResponse.data.success);
    if (meResponse.data.success) {
      console.log('User:', meResponse.data.data.email, '-', meResponse.data.data.role);
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
  }
}

testSessionDisplay();
