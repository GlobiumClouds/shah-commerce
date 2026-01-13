const http = require('http');

// Super Admin credentials
const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@easeacademy.com',
  password: 'SuperAdmin@123'
};

// Function to login and get token
function loginAndGetToken(credentials) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(credentials);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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

    req.write(data);
    req.end();
  });
}

// Test script for Super Admin Pending Fees API
async function testPendingFeesAPI() {
  console.log('🚀 Testing Super Admin Pending Fees API\n');
  console.log('=' .repeat(50));

  try {
    // First, login to get authentication token
    console.log('🔑 Logging in as Super Admin...');
    const loginResponse = await loginAndGetToken(SUPER_ADMIN_CREDENTIALS);

    if (loginResponse.statusCode !== 200 || !loginResponse.data.success) {
      console.log(`❌ Login failed: ${loginResponse.data.message || 'Unknown error'}`);
      console.log('🔍 Check if the server is running and credentials are correct');
      return;
    }

    const token = loginResponse.data.data.accessToken;
    const userData = loginResponse.data.data.user;
    console.log('✅ Successfully logged in and got token');
    console.log(`👤 User: ${userData.fullName} (${userData.email})`);
    console.log(`🔰 Role: ${userData.role}`);
    console.log(`🏢 Branch: ${userData.branchName || 'N/A'}`);

    // Now test the pending fees API with authentication
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/super-admin/pending-fees',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('\n🧪 Testing: Super Admin Pending Fees API');
    console.log('📝 Description: Fetch all pending fee payments across branches');
    console.log(`🔗 GET ${options.path}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📊 Response: ${response.success ? 'SUCCESS' : 'FAILED'}`);

          if (response.success) {
            console.log(`📈 Total pending payments: ${response.total || 0}`);
            console.log(`📋 Data received: ${Array.isArray(response.data) ? response.data.length : 'N/A'} items`);

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              console.log('\n📋 All pending payments:');
              response.data.forEach((payment, index) => {
                console.log(`${index + 1}. Student: ${payment.studentName}, Voucher: ${payment.voucherNumber}, Amount: ${payment.currency || 'PKR'} ${payment.amount}, Branch: ${payment.branchName}, Transaction ID: ${payment.transactionId}, Status: ${payment.status}, Payment Method: ${payment.paymentMethod}, Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
              });

              console.log('\n📋 Sample pending payment (first one):');
              const sample = response.data[0];
              console.log(`   - Payment ID: ${sample.paymentId}`);
              console.log(`   - Voucher: ${sample.voucherNumber}`);
              console.log(`   - Student: ${sample.studentName}`);
              console.log(`   - Branch: ${sample.branchName}`);
              console.log(`   - Amount: ${sample.currency || 'PKR'} ${sample.amount}`);
              console.log(`   - Status: ${sample.status}`);
              console.log(`   - Transaction ID: ${sample.transactionId}`);
              console.log(`   - Payment Method: ${sample.paymentMethod}`);
              console.log(`   - Payment Date: ${new Date(sample.paymentDate).toLocaleDateString()}`);
              console.log(`   - Class: ${sample.className}`);
              console.log(`   - Screenshot URL: ${sample.screenshotUrl || 'N/A'}`);
              console.log(`   - Voucher ID: ${sample.voucherId}`);

              console.log('\n✅ API is working correctly with real data!');
              console.log('🎯 Ready to implement in the frontend page.');
            } else {
              console.log('\n⚠️  No pending payments found in database.');
              console.log('💡 You may need to create test data first using test-super-admin-pending-fees.js');
            }
          } else {
            console.log(`❌ Error: ${response.message || 'Unknown error'}`);
            console.log('🔍 Check if the API is using mock data or if there are database issues.');
          }

          console.log('\n' + '=' .repeat(50));
          console.log('🎉 API Test completed!');

        } catch (e) {
          console.log(`❌ Status: ${res.statusCode}`);
          console.log(`📄 Raw Response: ${data.substring(0, 200)}...`);
          console.log(`🔍 JSON Parse Error: ${e.message}`);
          console.log('\n' + '=' .repeat(50));
          console.log('❌ API Test failed - Invalid JSON response');
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Network Error: ${e.message}`);
      console.log('🔍 Check if the server is running on localhost:3000');
      console.log('\n' + '=' .repeat(50));
      console.log('❌ API Test failed - Server not reachable');
    });

    req.setTimeout(15000, () => {
      console.log(`⏰ Timeout: Request took too long (15 seconds)`);
      req.destroy();
      console.log('🔍 Check if the database connection is working');
      console.log('\n' + '=' .repeat(50));
      console.log('❌ API Test failed - Timeout');
    });

    req.end();

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    console.log('\n' + '=' .repeat(50));
    console.log('❌ API Test failed - Unexpected error');
  }
}

// Run the test
testPendingFeesAPI();
