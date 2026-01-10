const http = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Common branch admin credentials to try
const branchAdminCredentials = [
  { email: 'branchadmin@easeacademy.com', password: 'BranchAdmin@123' },
  { email: 'branch@easeacademy.com', password: 'Branch@123' },
  { email: 'admin@branch.com', password: 'Admin@123' },
  { email: 'branch.admin@example.com', password: 'password123' },
  { email: 'admin@easeacademy.com', password: 'admin123' }
];

// Function to make HTTP request
function makeRequest(endpoint, method = 'GET', headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Function to login and get token
async function loginAndGetToken(email, password) {
  console.log(`🔑 Trying to login as: ${email}`);

  const response = await makeRequest('/api/auth/login', 'POST', {}, { email, password });

  if (response.statusCode !== 200 || !response.data.success) {
    console.log(`❌ Login failed: ${response.data.message || response.data}`);
    return null;
  }

  const token = response.data.data.accessToken;
  console.log('✅ Login successful!');
  return token;
}

// Function to test branch admin access
async function testBranchAdminAccess(token) {
  console.log('🏢 Testing branch admin pending fees access...');

  const response = await makeRequest('/api/branch-admin/pending-fees', 'GET', {
    'Authorization': `Bearer ${token}`
  });

  if (response.statusCode !== 200) {
    console.log(`❌ Branch admin access failed: ${response.data.message || response.data}`);
    return false;
  }

  const pendingFees = response.data.data || [];
  console.log(`✅ Branch admin access successful! Found ${pendingFees.length} pending fees.`);

  if (pendingFees.length > 0) {
    console.log('📄 Recent pending payments:');
    pendingFees.slice(0, 3).forEach((fee, index) => {
      console.log(`   ${index + 1}. ${fee.studentName} - PKR ${fee.amount} (${fee.status})`);
    });
  }

  return true;
}

// Main test function
async function testBranchAdminCredentials() {
  console.log('🚀 Testing Branch Admin Credentials\n');
  console.log('=' .repeat(50));

  for (const cred of branchAdminCredentials) {
    try {
      console.log(`\n👤 Testing credentials: ${cred.email} / ${cred.password}`);
      console.log('-'.repeat(50));

      const token = await loginAndGetToken(cred.email, cred.password);

      if (token) {
        const hasAccess = await testBranchAdminAccess(token);

        if (hasAccess) {
          console.log('\n🎉 SUCCESS! These credentials work:');
          console.log(`   Email: ${cred.email}`);
          console.log(`   Password: ${cred.password}`);
          console.log(`   Token: ${token}`);
          return { email: cred.email, password: cred.password, token };
        }
      }
    } catch (error) {
      console.log(`❌ Error testing ${cred.email}:`, error.message);
    }
  }

  console.log('\n❌ No working branch admin credentials found.');
  console.log('💡 You may need to:');
  console.log('   1. Create a branch admin account');
  console.log('   2. Check the database for existing branch admin credentials');
  console.log('   3. Reset branch admin password if needed');

  return null;
}

// Run the test
testBranchAdminCredentials();
