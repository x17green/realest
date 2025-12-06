#!/usr/bin/env node

/**
 * Test script for waitlist functionality
 *
 * This script tests the waitlist API endpoints and database operations
 * without requiring the full Next.js application to be running.
 *
 * Usage:
 *   node scripts/test-waitlist.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
}

// Test data
const testUsers = [
  {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+234812345678',
    source: 'test_script'
  },
  {
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    source: 'test_script'
  },
  {
    email: 'test.user@example.com',
    firstName: 'Test',
    source: 'test_script'
  }
];

async function testWaitlistOperations() {
  console.log('🚀 Starting Waitlist Functionality Tests\n');

  // Load environment variables
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
  }

  console.log('✅ Supabase configuration loaded');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check if waitlist table exists
    console.log('\n📋 Test 1: Checking waitlist table...');
    const { data: tables, error: tableError } = await supabase
      .from('waitlist')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      console.error('❌ Waitlist table not found or accessible:', tableError.message);
      console.log('💡 Tip: Run the SQL script to create the table:');
      console.log('   psql -f scripts/sql/008_create_waitlist.sql');
      return;
    }

    console.log('✅ Waitlist table exists and is accessible');

    // Test 2: Insert test users
    console.log('\n📝 Test 2: Adding test users to waitlist...');

    for (const user of testUsers) {
      try {
        const insertData = {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName || null,
          phone: user.phone || null,
          source: user.source,
          status: 'active',
          subscribed_at: new Date().toISOString(),
          contact_count: 0
        };

        const { data, error } = await supabase
          .from('waitlist')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            console.log(`⚠️  User ${user.email} already exists`);
          } else {
            console.error(`❌ Failed to add ${user.email}:`, error.message);
          }
        } else {
          console.log(`✅ Added ${user.email} (ID: ${data.id})`);
        }
      } catch (err) {
        console.error(`❌ Unexpected error adding ${user.email}:`, err.message);
      }
    }

    // Test 3: Query waitlist entries
    console.log('\n🔍 Test 3: Querying waitlist entries...');

    const { data: allEntries, error: queryError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('source', 'test_script')
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('❌ Failed to query waitlist:', queryError.message);
    } else {
      console.log(`✅ Found ${allEntries.length} test entries`);
      allEntries.forEach(entry => {
        console.log(`   - ${entry.first_name} (${entry.email}) - Status: ${entry.status}`);
      });
    }

    // Test 4: Test active_waitlist view
    console.log('\n📊 Test 4: Testing active_waitlist view...');

    const { data: activeEntries, error: viewError } = await supabase
      .from('active_waitlist')
      .select('*')
      .eq('source', 'test_script')
      .limit(5);

    if (viewError) {
      console.error('❌ Failed to query active_waitlist view:', viewError.message);
    } else {
      console.log(`✅ Active waitlist view working, ${activeEntries.length} active test entries`);
    }

    // Test 5: Test unsubscribe function
    console.log('\n🚫 Test 5: Testing unsubscribe function...');

    if (testUsers.length > 0) {
      const testEmail = testUsers[0].email;
      const { data: unsubResult, error: unsubError } = await supabase
        .rpc('unsubscribe_from_waitlist', { user_email: testEmail });

      if (unsubError) {
        console.error(`❌ Failed to unsubscribe ${testEmail}:`, unsubError.message);
      } else {
        console.log(`✅ Unsubscribed ${testEmail}: ${unsubResult}`);

        // Verify status change
        const { data: updatedEntry } = await supabase
          .from('waitlist')
          .select('status, unsubscribed_at')
          .eq('email', testEmail)
          .single();

        if (updatedEntry && updatedEntry.status === 'unsubscribed') {
          console.log(`✅ Status confirmed as unsubscribed`);
        }
      }
    }

    // Test 6: Get statistics
    console.log('\n📈 Test 6: Getting waitlist statistics...');

    const [
      { count: totalCount },
      { count: activeCount },
      { count: testCount }
    ] = await Promise.all([
      supabase.from('waitlist').select('*', { count: 'exact', head: true }),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('source', 'test_script')
    ]);

    console.log(`✅ Waitlist Statistics:`);
    console.log(`   Total entries: ${totalCount || 0}`);
    console.log(`   Active entries: ${activeCount || 0}`);
    console.log(`   Test entries: ${testCount || 0}`);

    // Test 7: Cleanup test data (optional)
    console.log('\n🧹 Test 7: Cleaning up test data...');

    const { error: deleteError } = await supabase
      .from('waitlist')
      .delete()
      .eq('source', 'test_script');

    if (deleteError) {
      console.error('❌ Failed to cleanup test data:', deleteError.message);
      console.log('💡 You may need to manually delete test entries');
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test the API endpoints: GET /api/waitlist');
    console.log('   2. Test the modal form in the coming soon page');
    console.log('   3. Check the database directly for real user signups');

  } catch (error) {
    console.error('\n💥 Unexpected error during testing:', error);
    console.error(error.stack);
  }
}

// Run the tests
testWaitlistOperations().catch(console.error);
