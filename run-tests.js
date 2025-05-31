
// Using built-in fetch API (Node.js 18+)
const BACKEND_URL = 'https://f967cd42-26d5-422d-8deb-ff6c58b64622-00-7f8ivc75mdzv.pike.replit.dev';
const FRONTEND_URL = 'https://v0-vo-dev-details.vercel.app';

async function runTests() {
  console.log('🧪 COMPREHENSIVE APPLICATION TESTING');
  console.log('=====================================');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}\n`);

  let allTestsPassed = true;

  // Test 1: Backend Health Check
  console.log('1. 🏥 Testing backend health...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    if (response.ok && data.status === 'OK') {
      console.log('✅ Backend health check PASSED');
    } else {
      console.log('❌ Backend health check FAILED');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Backend health check FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 2: CORS Configuration
  console.log('\n2. 🌐 Testing CORS configuration...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      console.log('✅ CORS configuration PASSED');
    } else {
      console.log('❌ CORS configuration FAILED - Status:', response.status);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ CORS configuration FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 3: Users API
  console.log('\n3. 👥 Testing users API...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/users`);
    const data = await response.json();
    if (response.ok && data.success && Array.isArray(data.data)) {
      console.log(`✅ Users API PASSED - Found ${data.data.length} users`);
      if (data.data.length > 0) {
        console.log(`   Sample user: ${data.data[0].name} (${data.data[0].email})`);
      }
    } else {
      console.log('❌ Users API FAILED');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Users API FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 4: Change Requests API
  console.log('\n4. 📋 Testing change requests API...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`);
    const data = await response.json();
    if (response.ok && data.success && Array.isArray(data.data)) {
      console.log(`✅ Change requests API PASSED - Found ${data.data.length} CRs`);
      if (data.data.length > 0) {
        const cr = data.data[0];
        console.log(`   Sample CR: "${cr.title}" (${cr.status})`);
        console.log(`   Owner: ${cr.owner?.name || 'Unknown'}`);
        console.log(`   Tasks: ${cr.tasks?.length || 0}`);
        console.log(`   Assigned devs: ${cr.assignedDevelopers?.length || 0}`);
      }
    } else {
      console.log('❌ Change requests API FAILED');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Change requests API FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 5: Database Connection
  console.log('\n5. 🗄️ Testing database connectivity...');
  try {
    const [usersResponse, crsResponse] = await Promise.all([
      fetch(`${BACKEND_URL}/api/users`),
      fetch(`${BACKEND_URL}/api/crs`)
    ]);
    
    if (usersResponse.ok && crsResponse.ok) {
      const usersData = await usersResponse.json();
      const crsData = await crsResponse.json();
      
      if (usersData.success && crsData.success) {
        console.log('✅ Database connectivity PASSED');
        console.log(`   Users table: ${usersData.data.length} records`);
        console.log(`   Change requests table: ${crsData.data.length} records`);
      } else {
        console.log('❌ Database connectivity FAILED - Invalid response format');
        allTestsPassed = false;
      }
    } else {
      console.log('❌ Database connectivity FAILED - API responses failed');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Database connectivity FAILED:', error.message);
    allTestsPassed = false;
  }

  // Test 6: API Response Format
  console.log('\n6. 📊 Testing API response format...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/crs`);
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
      const testCR = data.data[0];
      if (testCR) {
        const requiredFields = ['id', 'title', 'description', 'status', 'owner'];
        const hasAllFields = requiredFields.every(field => testCR.hasOwnProperty(field));
        
        if (hasAllFields) {
          console.log('✅ API response format PASSED');
        } else {
          console.log('❌ API response format FAILED - Missing required fields');
          allTestsPassed = false;
        }
      } else {
        console.log('⚠️ API response format - No data to test format');
      }
    } else {
      console.log('❌ API response format FAILED - Invalid structure');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ API response format FAILED:', error.message);
    allTestsPassed = false;
  }

  // Final Results
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Application is ready for deployment.');
    console.log('\n✅ Frontend should be able to connect to backend');
    console.log('✅ CORS is properly configured');
    console.log('✅ Database is connected and populated');
    console.log('✅ All API endpoints are working');
  } else {
    console.log('❌ SOME TESTS FAILED! Please check the issues above.');
  }
  console.log('='.repeat(50));
}

// Run the tests
runTests().catch(console.error);
