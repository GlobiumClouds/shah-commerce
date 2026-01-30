const http = require('http');

// Super Admin credentials
const SUPER_ADMIN_EMAIL = 'superadmin@gmail.com';
const SUPER_ADMIN_PASSWORD = 'password123';

// Server configuration
const HOST = 'localhost';
const PORT = 3000;

let authToken = null;

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Login as Super Admin
 */
async function loginSuperAdmin() {
  console.log('🔐 Logging in as Super Admin...');

  const options = {
    hostname: HOST,
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    });

    if (response.status === 200 && response.data.success) {
      authToken = response.data.data?.token || response.data.token;
      console.log('✅ Login successful!');
      console.log(`🔑 Token: ${authToken ? authToken.substring(0, 50) + '...' : 'No token received'}`);
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message || 'Unknown error');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

/**
 * Fetch all branches
 */
async function fetchBranches() {
  console.log('\n📋 Fetching all branches...');

  const options = {
    hostname: HOST,
    port: PORT,
    path: '/api/super-admin/branches',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  try {
    const response = await makeRequest(options);

    if (response.status === 200 && response.data.success) {
      const branches = response.data.data.branches || [];
      console.log(`✅ Found ${branches.length} branches:`);

      branches.forEach((branch, index) => {
        console.log(`  ${index + 1}. ${branch.name} (${branch.code}) - ID: ${branch._id}`);
      });

      return branches;
    } else {
      console.log('❌ Failed to fetch branches:', response.data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.log('❌ Fetch branches error:', error.message);
    return [];
  }
}

/**
 * Delete a branch
 */
async function deleteBranch(branchId, branchName) {
  console.log(`\n🗑️  Deleting branch: ${branchName} (ID: ${branchId})`);

  const options = {
    hostname: HOST,
    port: PORT,
    path: `/api/super-admin/branches/${branchId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  try {
    const response = await makeRequest(options);

    if (response.status === 200 && response.data.success) {
      console.log('✅ Branch deleted successfully!');
      return true;
    } else {
      console.log('❌ Failed to delete branch:', response.data.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Delete branch error:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTest() {
  console.log('🚀 Super Admin Branch Management Test');
  console.log('=' .repeat(50));

  // Step 1: Login
  const loginSuccess = await loginSuperAdmin();
  if (!loginSuccess) {
    console.log('❌ Test failed: Could not login as super admin');
    return;
  }

  // Step 2: Fetch branches
  const branches = await fetchBranches();
  if (branches.length === 0) {
    console.log('❌ Test failed: No branches found');
    return;
  }

  // Step 3: Delete the first branch (or you can modify to delete a specific one)
  const branchToDelete = branches[0]; // Delete the first branch
  const deleteSuccess = await deleteBranch(branchToDelete._id, branchToDelete.name);

  if (deleteSuccess) {
    console.log('\n🎉 Test completed successfully!');
    console.log(`✅ Deleted branch: ${branchToDelete.name}`);
  } else {
    console.log('\n❌ Test failed: Could not delete branch');
  }

  console.log('=' .repeat(50));
}

// Run the test
runTest().catch(console.error);
