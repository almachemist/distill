#!/usr/bin/env tsx
/**
 * Setup Tanks in Supabase
 * Run the SQL migration manually first, then run this to verify
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dscmknufpfhxjcanzdsr.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY21rbnVmcGZoeGpjYW56ZHNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3NTgzOSwiZXhwIjoyMDc3OTUxODM5fQ.NanLP7UThboH3JUeFqkwy5dovfzxJotf2yljsTQs7rY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  console.log('Checking tanks system...\n')

  // Get organization
  const { data: orgs } = await supabase.from('organizations').select('id, name').limit(1)
  if (!orgs || orgs.length === 0) {
    console.error('No organization found')
    return
  }
  const orgId = orgs[0].id
  console.log(`Organization: ${orgs[0].name}\n`)

  // Check if tanks table exists
  const { data: tanks, error } = await supabase
    .from('tanks')
    .select('*')
    .limit(1)

  if (error) {
    console.log('Tanks table does not exist yet.')
    console.log('\nPlease run this SQL in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/dscmknufpfhxjcanzdsr/sql/new\n')
    console.log('Copy and paste the contents of:')
    console.log('supabase/migrations/20251120130000_create_tanks_system.sql\n')
    return
  }

  console.log('Tanks table exists!')

  // Check existing tanks
  const { data: existingTanks } = await supabase
    .from('tanks')
    .select('tank_id, tank_name, status')
    .order('tank_id')

  if (existingTanks && existingTanks.length > 0) {
    console.log(`\nFound ${existingTanks.length} existing tanks:`)
    existingTanks.forEach(tank => {
      console.log(`  - ${tank.tank_id}: ${tank.tank_name} (${tank.status})`)
    })
  } else {
    console.log('\nNo tanks found. The migration should have created them.')
    console.log('Please check if the migration ran successfully.')
  }

  console.log('\nTanks system is ready!')
  console.log('Visit: http://localhost:3001/dashboard/production/tanks')
}

main()

