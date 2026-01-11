const http = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Test credentials
const credentials = {
  branchAdmin: { email: 'branchadmin@easeacademy.com', password: 'BranchAdmin@123' },
  parent: { email: 'arshayn@example.com', password: 'password123' }
};

// Function to make authenticated API request
function makeAuthenticatedRequest(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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
  try {
    console.log(`🔑 Logging in as ${email}...`);

    const response = await makeAuthenticatedRequest('/api/auth/login', 'POST', { email, password });

    if (response.statusCode === 200 && response.data.success && response.data.data && response.data.data.accessToken) {
      console.log(`✅ Successfully logged in as ${email}`);
      return response.data.data.accessToken;
    } else {
      console.log(`❌ Login failed for ${email}:`, response.data.message || response.data);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error logging in as ${email}:`, error.message);
    return null;
  }
}

// Function to add a test book as branch admin
async function addTestBook(token) {
  try {
    console.log('📚 Adding test book to library...');

    const bookData = {
      title: 'Test Book for Library Check',
      author: 'Test Author',
      category: 'Fiction',
      totalCopies: 5,
      description: 'This is a test book to verify library functionality'
    };

    const response = await makeAuthenticatedRequest('/api/branch-admin/library/books', 'POST', bookData, token);

    if (response.statusCode === 201 && response.data.success) {
      console.log('✅ Test book added successfully');
      console.log('📖 Book ID:', response.data.data._id);
      return response.data.data._id;
    } else {
      console.log('❌ Failed to add test book:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error adding test book:', error.message);
    return null;
  }
}

// Function to get parent's children
async function getParentChildren(token) {
  try {
    console.log('👨‍👩‍👧‍👦 Getting parent profile...');

    const response = await makeAuthenticatedRequest('/api/parent/profile', 'GET', null, token);

    if (response.statusCode === 200 && response.data.success) {
      const children = response.data.data.parentProfile.children;
      console.log(`✅ Found ${children.length} children`);
      children.forEach((child, index) => {
        console.log(`   ${index + 1}. ${child.name} (ID: ${child.id})`);
      });
      return children;
    } else {
      console.log('❌ Failed to get parent profile:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting parent profile:', error.message);
    return [];
  }
}

// Function to check library for a child
async function checkChildLibrary(token, childId) {
  try {
    console.log(`📚 Checking library for child ID: ${childId}...`);

    const response = await makeAuthenticatedRequest(`/api/parent/${childId}/library`, 'GET', null, token);

    if (response.statusCode === 200 && response.data.success) {
      const availableBooks = response.data.data.availableBooks;
      console.log(`✅ Library check successful. Found ${availableBooks.length} available books`);

      // Check if our test book is there
      const testBook = availableBooks.find(book => book.title === 'Test Book for Library Check');
      if (testBook) {
        console.log('🎉 SUCCESS: Test book found in child\'s library!');
        console.log('📖 Book details:', {
          title: testBook.title,
          author: testBook.author,
          availableCopies: testBook.availableCopies,
          totalCopies: testBook.totalCopies
        });
        return true;
      } else {
        console.log('❌ FAILURE: Test book NOT found in child\'s library');
        console.log('📚 Available books:');
        availableBooks.forEach(book => {
          console.log(`   - ${book.title} by ${book.author}`);
        });
        return false;
      }
    } else {
      console.log('❌ Failed to check child library:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking child library:', error.message);
    return false;
  }
}

// Main test function
async function testLibraryFlow() {
  console.log('🚀 Testing Library Flow: Branch Admin -> Parent Child Library\n');

  try {
    // Step 1: Login as branch admin and add a test book
    console.log('=== STEP 1: Branch Admin Adds Book ===');
    const branchAdminToken = await loginAndGetToken(credentials.branchAdmin.email, credentials.branchAdmin.password);
    if (!branchAdminToken) {
      console.log('❌ Cannot proceed without branch admin token');
      return;
    }

    const bookId = await addTestBook(branchAdminToken);
    if (!bookId) {
      console.log('❌ Cannot proceed without test book');
      return;
    }

    // Step 2: Login as parent and check library
    console.log('\n=== STEP 2: Parent Checks Child Library ===');
    const parentToken = await loginAndGetToken(credentials.parent.email, credentials.parent.password);
    if (!parentToken) {
      console.log('❌ Cannot proceed without parent token');
      return;
    }

    const children = await getParentChildren(parentToken);
    if (children.length === 0) {
      console.log('❌ Parent has no children');
      return;
    }

    // Check library for first child
    const firstChild = children[0];
    const bookFound = await checkChildLibrary(parentToken, firstChild.id);

    // Final result
    console.log('\n=== TEST RESULT ===');
    if (bookFound) {
      console.log('✅ PASS: Books added by branch admin are visible in parent\'s child library');
    } else {
      console.log('❌ FAIL: Books added by branch admin are NOT visible in parent\'s child library');
    }

  } catch (error) {
    console.error('❌ Unexpected error during test:', error.message);
  }
}

// Run the test
testLibraryFlow();
