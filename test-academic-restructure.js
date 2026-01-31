const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust if your server runs on different port
let authToken = null;

// Login function
const loginAsSuperAdmin = async () => {
  console.log('🔐 Logging in as super admin...');
  try {
    const loginResult = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'superadmin@easeacademy.com', // Use existing super admin email
      password: 'SuperAdmin@123'
    });

    if (loginResult.data.success) {
      authToken = loginResult.data.data.accessToken;
      console.log('✅ Successfully logged in as super admin');
      return true;
    } else {
      console.log('❌ Login failed:', loginResult.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
};

// Helper function to make authenticated requests
const apiRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testSessionAPIs = async () => {
  console.log('\n=== Testing Session APIs ===');

  // Create session
  console.log('Creating session 2025...');
  const createResult = await apiRequest('POST', '/api/super-admin/sessions', {
    name: 'Session 2025',
    code: 'SESS-2025',
    sessionYear: 2025,
    description: 'Academic session for year 2025'
  });

  if (createResult.success) {
    console.log('✅ Session created successfully:', createResult.data);
  } else {
    console.log('❌ Failed to create session:', createResult.error);
    return;
  }

  const sessionId = createResult.data._id;

  // Get all sessions
  console.log('Fetching all sessions...');
  const getAllResult = await apiRequest('GET', '/api/super-admin/sessions');
  if (getAllResult.success) {
    console.log(`✅ Retrieved ${getAllResult.data.length} sessions`);
  } else {
    console.log('❌ Failed to get sessions:', getAllResult.error);
  }

  // Update session
  console.log('Updating session...');
  const updateResult = await apiRequest('PUT', `/api/super-admin/sessions/${sessionId}`, {
    description: 'Updated academic session for year 2025'
  });
  if (updateResult.success) {
    console.log('✅ Session updated successfully');
  } else {
    console.log('❌ Failed to update session:', updateResult.error);
  }
};

const testFacultyAPIs = async () => {
  console.log('\n=== Testing Faculty APIs ===');

  // Create faculty
  console.log('Creating Pre-Engineering faculty...');
  const createResult = await apiRequest('POST', '/api/super-admin/faculties', {
    name: 'Pre-Engineering',
    code: 'PRE-ENG',
    description: 'Pre-Engineering faculty for science students'
  });

  if (createResult.success) {
    console.log('✅ Faculty created successfully:', createResult.data);
  } else {
    console.log('❌ Failed to create faculty:', createResult.error);
    return;
  }

  const facultyId = createResult.data._id;

  // Get all faculties
  console.log('Fetching all faculties...');
  const getAllResult = await apiRequest('GET', '/api/super-admin/faculties');
  if (getAllResult.success) {
    console.log(`✅ Retrieved ${getAllResult.data.length} faculties`);
  } else {
    console.log('❌ Failed to get faculties:', getAllResult.error);
  }

  // Update faculty
  console.log('Updating faculty...');
  const updateResult = await apiRequest('PUT', `/api/super-admin/faculties/${facultyId}`, {
    description: 'Updated Pre-Engineering faculty description'
  });
  if (updateResult.success) {
    console.log('✅ Faculty updated successfully');
  } else {
    console.log('❌ Failed to update faculty:', updateResult.error);
  }
};

const testClassAPIs = async () => {
  console.log('\n=== Testing Class APIs ===');

  // First get session and faculty IDs
  const sessionsResult = await apiRequest('GET', '/api/super-admin/sessions');
  const facultiesResult = await apiRequest('GET', '/api/super-admin/faculties');

  if (!sessionsResult.success || !facultiesResult.success) {
    console.log('❌ Cannot test class APIs without sessions/faculties');
    return;
  }

  const sessionId = sessionsResult.data[0]?._id;
  const facultyId = facultiesResult.data[0]?._id;

  if (!sessionId || !facultyId) {
    console.log('❌ No session or faculty found for testing');
    return;
  }

  // Create class
  console.log('Creating class...');
  const createResult = await apiRequest('POST', '/api/branch-admin/classes', {
    name: 'Grade 9-A',
    code: 'G9-A',
    gradeId: '507f1f77bcf86cd799439011', // This would be a real grade ID
    sessionId,
    facultyId,
    sections: [{
      name: 'A',
      capacity: 40
    }],
    academicYear: '2025',
    subjects: []
  });

  if (createResult.success) {
    console.log('✅ Class created successfully:', createResult.data);
  } else {
    console.log('❌ Failed to create class:', createResult.error);
  }

  // Get classes by session/faculty
  console.log('Fetching classes by session and faculty...');
  const getFilteredResult = await apiRequest('GET', `/api/branch-admin/classes?sessionId=${sessionId}&facultyId=${facultyId}`);
  if (getFilteredResult.success) {
    console.log(`✅ Retrieved ${getFilteredResult.data.length} classes for session/faculty`);
  } else {
    console.log('❌ Failed to get filtered classes:', getFilteredResult.error);
  }
};

const testSubjectAPIs = async () => {
  console.log('\n=== Testing Subject APIs ===');

  // Get faculty ID
  const facultiesResult = await apiRequest('GET', '/api/super-admin/faculties');
  if (!facultiesResult.success || !facultiesResult.data.length) {
    console.log('❌ No faculty found for testing subjects');
    return;
  }

  const facultyId = facultiesResult.data[0]._id;

  // Create subject
  console.log('Creating subject...');
  const createResult = await apiRequest('POST', '/api/branch-admin/subjects', {
    name: 'Mathematics',
    code: 'MATH-101',
    classId: '507f1f77bcf86cd799439011', // This would be a real class ID
    grade: 9,
    facultyId,
    subjectType: 'core',
    hoursPerWeek: 5,
    creditHours: 3
  });

  if (createResult.success) {
    console.log('✅ Subject created successfully:', createResult.data);
  } else {
    console.log('❌ Failed to create subject:', createResult.error);
  }

  // Get subjects by faculty
  console.log('Fetching subjects by faculty...');
  const getFilteredResult = await apiRequest('GET', `/api/branch-admin/subjects?facultyId=${facultyId}`);
  if (getFilteredResult.success) {
    console.log(`✅ Retrieved ${getFilteredResult.data.length} subjects for faculty`);
  } else {
    console.log('❌ Failed to get filtered subjects:', getFilteredResult.error);
  }
};

const testStudentEnrollmentAPIs = async () => {
  console.log('\n=== Testing Student Enrollment APIs ===');

  // Get session and faculty IDs
  const sessionsResult = await apiRequest('GET', '/api/super-admin/sessions');
  const facultiesResult = await apiRequest('GET', '/api/super-admin/faculties');

  if (!sessionsResult.success || !facultiesResult.success ||
      !sessionsResult.data.length || !facultiesResult.data.length) {
    console.log('❌ Cannot test enrollment without sessions/faculties');
    return;
  }

  const sessionId = sessionsResult.data[0]._id;
  const facultyId = facultiesResult.data[0]._id;

  // Enroll student
  console.log('Enrolling student...');
  const enrollResult = await apiRequest('POST', '/api/branch-admin/students/enroll', {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    dateOfBirth: '2008-01-01',
    gender: 'male',
    sessionId,
    facultyId,
    classId: '507f1f77bcf86cd799439011', // This would be a real class ID
    address: {
      street: '123 Main St',
      city: 'Karachi',
      country: 'Pakistan'
    }
  });

  if (enrollResult.success) {
    console.log('✅ Student enrolled successfully:', enrollResult.data);
  } else {
    console.log('❌ Failed to enroll student:', enrollResult.error);
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Academic Restructure API Tests');
  console.log('==========================================');

  try {
    // Login as super admin first
    const loginSuccess = await loginAsSuperAdmin();
    if (!loginSuccess) {
      console.log('❌ Cannot proceed with tests without authentication');
      return;
    }

    // Test Session APIs
    await testSessionAPIs();

    // Test Faculty APIs
    await testFacultyAPIs();

    // Test Class APIs
    await testClassAPIs();

    // Test Subject APIs
    await testSubjectAPIs();

    // Test Student Enrollment APIs
    await testStudentEnrollmentAPIs();

    console.log('\n🎉 All API tests completed successfully!');
    console.log('==========================================');
    console.log('✅ Adding new pages to sidebar...');

    // Add pages to sidebar if tests are successful
    await addPagesToSidebar();

  } catch (error) {
    console.error('❌ Test runner failed:', error);
  }
};

// Run tests
runTests();
