const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
const supabaseUrl = 'https://rsgvhilaapbyhvzfmldu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZ3ZoaWxhYXBieWh2emZtbGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjQxOTksImV4cCI6MjA3NTEwMDE5OX0.8Q3mimHi0mNqrwfJ1Wys4Jy71YUCvF-2dS6U4lKxKvI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  // Test 1: Try to count records
  console.log('Test 1: Counting records...');
  const { count, error: countError } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('❌ Count failed:', countError.message);
  } else {
    console.log('✅ Count successful:', count, 'records');
  }

  // Test 2: Try to insert a test record
  console.log('\nTest 2: Inserting test record...');
  const testEmail = `test${Date.now()}@example.com`;
  const { data, error: insertError } = await supabase
    .from('waitlist')
    .insert([
      {
        email: testEmail,
        joined_at: new Date().toISOString(),
        source: 'test',
        status: 'pending'
      }
    ])
    .select();

  if (insertError) {
    console.log('❌ Insert failed:', insertError.message);
    console.log('Error code:', insertError.code);
    console.log('Error details:', insertError.details);
  } else {
    console.log('✅ Insert successful:', data);
  }

  // Test 3: Try to read back
  console.log('\nTest 3: Reading records...');
  const { data: readData, error: readError } = await supabase
    .from('waitlist')
    .select('*')
    .limit(5);

  if (readError) {
    console.log('❌ Read failed:', readError.message);
  } else {
    console.log('✅ Read successful, found', readData.length, 'records');
  }
}

testConnection().catch(console.error);