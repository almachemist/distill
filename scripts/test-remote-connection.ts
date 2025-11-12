#!/usr/bin/env tsx
/**
 * Test Remote Supabase Connection
 * Verifies data is accessible from the application
 */

import { createClient } from '@supabase/supabase-js';

// Load from environment (same as app will use)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY21rbnVmcGZoeGpjYW56ZHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzU4MzksImV4cCI6MjA3Nzk1MTgzOX0.0ht4oBhf7hbLvGfcNN_2TpWLsG5RUuOyWZe9Qu0FEAs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🧪 Testing Remote Supabase Connection\n');
  console.log(`📍 URL: ${SUPABASE_URL}\n`);
  
  const tests = [
    {
      name: 'Distillation Runs (Gin)',
      table: 'distillation_runs',
      query: supabase.from('distillation_runs').select('batch_id, sku, date').order('date', { ascending: false }).limit(5)
    },
    {
      name: 'Rum Production Runs',
      table: 'rum_production_runs',
      query: supabase.from('rum_production_runs').select('batch_id, date').order('date', { ascending: false }).limit(5)
    },
    {
      name: 'Production Batches',
      table: 'production_batches',
      query: supabase.from('production_batches').select('id, type, still').limit(5)
    },
    {
      name: 'Product Pricing',
      table: 'product_pricing',
      query: supabase.from('product_pricing').select('product_name, category, rrp').limit(5)
    },
    {
      name: 'Sales Items',
      table: 'sales_items',
      query: supabase.from('sales_items').select('item_name, net_sales').limit(5)
    }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    try {
      const { data, error, count } = await test.query;
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        allPassed = false;
      } else {
        // Get total count
        const { count: totalCount } = await supabase
          .from(test.table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`✅ ${test.name}: ${totalCount} records`);
        if (data && data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0], null, 2).substring(0, 100)}...`);
        }
        console.log('');
      }
    } catch (error: any) {
      console.log(`❌ ${test.name}: ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('='.repeat(80));
  if (allPassed) {
    console.log('✅ All tests passed! Remote database is accessible.');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
  }
  console.log('='.repeat(80));
}

testConnection();

