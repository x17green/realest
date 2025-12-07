#!/usr/bin/env node

/**
 * API Test Script for Waitlist Endpoints
 *
 * This script tests the waitlist API endpoints by making HTTP requests
 * to simulate how the frontend would interact with the API.
 *
 * Usage:
 *   node scripts/test-api.js [base-url]
 *
 * Example:
 *   node scripts/test-api.js http://localhost:3000
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Default base URL
const DEFAULT_BASE_URL = 'http://localhost:3000';

// Test data
const testUsers = [
  {
    email: 'api.test1@example.com',
    firstName: 'API',
    lastName: 'Tester1',
    phone: '+234801234567',
    source: 'api_test'
  },
  {
    email: 'api.test2@example.com',
    firstName: 'API',
    lastName: 'Tester2',
    source: 'api_test'
  },
  {
    email: 'invalid-email',
    firstName: 'Invalid',
    source: 'api_test'
  }
];

/**
 * Make HTTP request helper
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Waitlist-API-Test/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test GET /api/waitlist
 */
async function testGetEndpoint(baseUrl) {
  console.log('\n📋 Testing GET /api/waitlist...');

  try {
    const response = await makeRequest(`${baseUrl}/api/waitlist`);

    if (response.status === 200) {
      console.log('✅ GET endpoint working');
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      console.log(`⚠️  GET endpoint returned status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ GET endpoint failed:', error.message);
  }
}

/**
 * Test POST /api/waitlist with valid data
 */
async function testPostEndpoint(baseUrl, userData) {
  console.log(`\n📝 Testing POST /api/waitlist with ${userData.email}...`);

  try {
    const response = await makeRequest(`${baseUrl}/api/waitlist`, {
      method: 'POST',
      body: userData
    });

    if (response.status === 201) {
      console.log('✅ POST successful - User added to waitlist');
      console.log(`   Email: ${response.data.email}`);
      console.log(`   First Name: ${response.data.firstName}`);
    } else if (response.status === 200) {
      console.log('✅ POST successful - User already exists');
      console.log(`   Message: ${response.data.message}`);
    } else if (response.status === 400) {
      console.log('⚠️  POST validation error (expected for invalid data)');
      console.log(`   Error: ${response.data.error}`);
    } else if (response.status === 429) {
      console.log('⚠️  Rate limited (too many requests)');
      console.log(`   Error: ${response.data.error}`);
    } else {
      console.log(`❌ POST failed with status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    }

    return response;
  } catch (error) {
    console.error('❌ POST request failed:', error.message);
    return null;
  }
}

/**
 * Test GET /api/waitlist?email=xxx
 */
async function testEmailCheckEndpoint(baseUrl, email) {
  console.log(`\n🔍 Testing email check for ${email}...`);

  try {
    const encodedEmail = encodeURIComponent(email);
    const response = await makeRequest(`${baseUrl}/api/waitlist?email=${encodedEmail}`);

    if (response.status === 200) {
      console.log('✅ Email check successful');
      console.log(`   Exists: ${response.data.exists}`);
      if (response.data.exists) {
        console.log(`   Status: ${response.data.status}`);
        console.log(`   First Name: ${response.data.firstName}`);
      }
    } else {
      console.log(`❌ Email check failed with status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ Email check request failed:', error.message);
  }
}

/**
 * Test DELETE /api/waitlist
 */
async function testDeleteEndpoint(baseUrl, email) {
  console.log(`\n🗑️  Testing DELETE /api/waitlist for ${email}...`);

  try {
    const response = await makeRequest(`${baseUrl}/api/waitlist`, {
      method: 'DELETE',
      body: { email }
    });

    if (response.status === 200) {
      console.log('✅ DELETE successful - User unsubscribed');
      console.log(`   Message: ${response.data.message}`);
    } else if (response.status === 404) {
      console.log('⚠️  DELETE - Email not found (expected if already deleted)');
      console.log(`   Error: ${response.data.error}`);
    } else {
      console.log(`❌ DELETE failed with status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ DELETE request failed:', error.message);
  }
}

/**
 * Test rate limiting
 */
async function testRateLimiting(baseUrl) {
  console.log('\n⏱️  Testing rate limiting...');

  const promises = [];

  // Send 10 requests rapidly to trigger rate limiting
  for (let i = 0; i < 10; i++) {
    promises.push(
      makeRequest(`${baseUrl}/api/waitlist`, {
        method: 'POST',
        body: {
          email: `ratelimit${i}@example.com`,
          firstName: `RateLimit${i}`,
          source: 'rate_limit_test'
        }
      })
    );
  }

  try {
    const responses = await Promise.allSettled(promises);
    let successCount = 0;
    let rateLimitedCount = 0;

    responses.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.status === 201 || result.value.status === 200) {
          successCount++;
        } else if (result.value.status === 429) {
          rateLimitedCount++;
        }
      }
    });

    console.log(`✅ Rate limiting test completed`);
    console.log(`   Successful requests: ${successCount}`);
    console.log(`   Rate limited requests: ${rateLimitedCount}`);

    if (rateLimitedCount > 0) {
      console.log('✅ Rate limiting is working correctly');
    } else {
      console.log('⚠️  Rate limiting may not be configured properly');
    }

  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
  }
}

/**
 * Main test function
 */
async function runAPITests() {
  const baseUrl = process.argv[2] || DEFAULT_BASE_URL;

  console.log('🚀 Starting Waitlist API Tests');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log('=' .repeat(50));

  // Test 1: Basic GET endpoint
  await testGetEndpoint(baseUrl);

  // Test 2: POST with valid users
  console.log('\n' + '='.repeat(30) + ' POST TESTS ' + '='.repeat(30));

  for (const user of testUsers) {
    await testPostEndpoint(baseUrl, user);
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test 3: Check if emails exist
  console.log('\n' + '='.repeat(30) + ' EMAIL CHECK TESTS ' + '='.repeat(30));

  for (const user of testUsers.slice(0, 2)) { // Only test valid users
    await testEmailCheckEndpoint(baseUrl, user.email);
  }

  // Test 4: Test duplicate submission
  console.log('\n' + '='.repeat(30) + ' DUPLICATE SUBMISSION TEST ' + '='.repeat(30));
  await testPostEndpoint(baseUrl, testUsers[0]); // Submit first user again

  // Test 5: Test unsubscribe
  console.log('\n' + '='.repeat(30) + ' UNSUBSCRIBE TESTS ' + '='.repeat(30));
  await testDeleteEndpoint(baseUrl, testUsers[0].email);

  // Test 6: Verify unsubscribe worked
  await testEmailCheckEndpoint(baseUrl, testUsers[0].email);

  // Test 7: Rate limiting (optional, may be noisy)
  if (process.env.TEST_RATE_LIMITING === 'true') {
    console.log('\n' + '='.repeat(30) + ' RATE LIMITING TEST ' + '='.repeat(30));
    await testRateLimiting(baseUrl);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 API tests completed!');
  console.log('\n💡 Tips:');
  console.log('   - Set TEST_RATE_LIMITING=true to test rate limiting');
  console.log('   - Check your database to verify data persistence');
  console.log('   - Test the frontend modal to ensure integration works');
  console.log('   - Monitor server logs for any error messages');
}

// Error handling for the main function
runAPITests().catch(error => {
  console.error('\n💥 API tests failed with error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
