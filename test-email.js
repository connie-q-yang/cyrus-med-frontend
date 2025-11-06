/**
 * Quick email function test
 * Run with: node test-email.js
 */

const handler = require('./netlify/functions/send-welcome-email').handler;

async function testEmail() {
  console.log('🧪 Testing email function...\n');

  // Test 1: Missing email
  console.log('Test 1: Missing email parameter');
  const test1 = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({})
  });
  console.log('Response:', test1.statusCode, JSON.parse(test1.body));
  console.log(test1.statusCode === 400 ? '✅ PASS\n' : '❌ FAIL\n');

  // Test 2: Wrong HTTP method
  console.log('Test 2: Wrong HTTP method');
  const test2 = await handler({
    httpMethod: 'GET',
    body: ''
  });
  console.log('Response:', test2.statusCode, JSON.parse(test2.body));
  console.log(test2.statusCode === 405 ? '✅ PASS\n' : '❌ FAIL\n');

  // Test 3: Valid email (will fail without real API key, but structure should be correct)
  console.log('Test 3: Valid email structure');
  const test3 = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ email: 'test@example.com' })
  });
  console.log('Response:', test3.statusCode);
  const body3 = JSON.parse(test3.body);
  console.log('Body:', body3);
  console.log(test3.headers['Content-Type'] === 'application/json' ? '✅ Headers correct\n' : '❌ Headers wrong\n');

  console.log('✅ Email function tests complete!');
}

testEmail().catch(console.error);
