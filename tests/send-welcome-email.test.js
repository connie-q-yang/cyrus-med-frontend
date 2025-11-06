/**
 * Tests for send-welcome-email Netlify function
 * Run with: node netlify/functions/send-welcome-email.test.js
 */

const handler = require('./send-welcome-email').handler;

// Mock environment
process.env.RESEND_API_KEY = 're_test_key_12345';

// Test counter
let passed = 0;
let failed = 0;

// Test helper
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`  Error: ${error.message}`);
    failed++;
  }
}

// Assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Run tests
(async () => {
  console.log('🧪 Running send-welcome-email tests...\n');

  await test('Should reject non-POST requests', async () => {
    const result = await handler({
      httpMethod: 'GET',
      body: ''
    });
    assert(result.statusCode === 405, 'Should return 405');
    const body = JSON.parse(result.body);
    assert(body.error === 'Method not allowed', 'Should return method not allowed error');
  });

  await test('Should reject requests without email', async () => {
    const result = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({})
    });
    assert(result.statusCode === 400, 'Should return 400');
    const body = JSON.parse(result.body);
    assert(body.error === 'Email is required', 'Should return email required error');
  });

  await test('Should handle missing RESEND_API_KEY', async () => {
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    const result = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'test@example.com' })
    });

    assert(result.statusCode === 500, 'Should return 500');
    const body = JSON.parse(result.body);
    assert(body.error === 'Email service not configured', 'Should return config error');

    process.env.RESEND_API_KEY = originalKey;
  });

  await test('Should have proper response headers', async () => {
    const result = await handler({
      httpMethod: 'GET',
      body: ''
    });
    assert(result.headers['Content-Type'] === 'application/json', 'Should have JSON content type');
  });

  await test('Should parse email from request body', async () => {
    const email = 'test@example.com';
    const result = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ email })
    });
    // Will fail at Resend API call, but that's ok - we're testing parsing
    assert(result.statusCode !== 400, 'Should parse email successfully');
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
})();
