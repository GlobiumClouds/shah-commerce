const http = require('http');

// Test script to fetch branches and delete one
let authToken = null;

function login(callback) {
  console.log('🔑 Logging in as Super Admin...');

  const loginData = JSON.stringify({
    email: 'superadmin@easeacademy.com',
    password: 'SuperAdmin@123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success && response.data.token) {
          authToken = response.data.token;
          console.log('✅ Login successful!');
          callback();
        } else {
          console.log('❌ Login failed:', response.message);
        }
      } catch (e) {
        console.log('❌ Login error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Login request error:', e.message);
  });

  req.write(loginData);
  req.end();
}

function fetchBranches(callback) {
  console.log('\n📋 Fetching branches...');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/super-admin/branches',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('✅ Branches fetched successfully!');
          const branches = response.data.branches || [];
          console.log(`📊 Found ${branches.length} branches:`);

          branches.forEach((branch, index) => {
            console.log(`${index + 1}. ${branch.name} (ID: ${branch._id}) - ${branch.code}`);
          });

          if (branches.length > 0) {
            // Ask user which branch to delete
            console.log('\n🗑️  Attempting to delete the first branch...');
            deleteBranch(branches[0]._id);
          } else {
            console.log('❌ No branches found to delete');
          }
        } else {
          console.log('❌ Failed to fetch branches:', response.message);
        }
      } catch (e) {
        console.log('❌ Error parsing response:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Fetch request error:', e.message);
  });

  req.end();
}

function deleteBranch(branchId) {
  console.log(`\n🗑️  Deleting branch with ID: ${branchId}`);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/super-admin/branches/${branchId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`✅ Status: ${res.statusCode}`);
        if (response.success) {
          console.log('✅ Branch deleted successfully!');
          console.log('📊 Response:', response.message);
        } else {
          console.log('❌ Failed to delete branch:', response.message);
        }
      } catch (e) {
        console.log('❌ Error parsing delete response:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Delete request error:', e.message);
  });

  req.end();
}

// Run the test
console.log('🚀 Starting Branch Fetch and Delete Test\n');
console.log('=' .repeat(50));

login(() => {
  setTimeout(fetchBranches, 1000);
});
