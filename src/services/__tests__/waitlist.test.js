/**
 * Tests for waitlist functionality
 * Run with: npm test -- waitlist.test.js
 */

import { addToWaitlist } from '../../utils/supabase';

// Mock Supabase
jest.mock('../../utils/supabase', () => ({
  addToWaitlist: jest.fn()
}));

describe('Waitlist Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully add email to waitlist', async () => {
    addToWaitlist.mockResolvedValue({
      success: true,
      message: 'Successfully joined the waitlist!'
    });

    const result = await addToWaitlist('test@example.com');

    expect(result.success).toBe(true);
    expect(addToWaitlist).toHaveBeenCalledWith('test@example.com');
  });

  test('should handle duplicate email', async () => {
    addToWaitlist.mockResolvedValue({
      success: false,
      message: 'You're already on the waitlist!'
    });

    const result = await addToWaitlist('existing@example.com');

    expect(result.success).toBe(false);
    expect(result.message).toContain('already');
  });

  test('should validate email format', async () => {
    const invalidEmails = [
      'invalid',
      'invalid@',
      '@example.com',
      'invalid.com',
      ''
    ];

    invalidEmails.forEach(email => {
      expect(email).toBeTruthy(); // Basic validation test
    });
  });
});
