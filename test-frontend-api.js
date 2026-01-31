// Test script to check if frontend API calls work
const testFrontendAPI = async () => {
  console.log('Testing frontend API calls...');

  try {
    // Test sessions API
    console.log('Testing sessions API...');
    const sessionsResponse = await fetch('/api/super-admin/sessions');
    const sessionsData = await sessionsResponse.json();
    console.log('Sessions API response:', sessionsData);

    // Test faculties API
    console.log('Testing faculties API...');
    const facultiesResponse = await fetch('/api/super-admin/faculties');
    const facultiesData = await facultiesResponse.json();
    console.log('Faculties API response:', facultiesData);

  } catch (error) {
    console.error('Error testing APIs:', error);
  }
};

// Only run in browser environment
if (typeof window !== 'undefined') {
  testFrontendAPI();
} else {
  console.log('This script should be run in the browser console');
}
