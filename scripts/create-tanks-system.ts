#!/usr/bin/env tsx
/**
 * Create Tanks System in Remote Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = 'https://dscmknufpfhxjcanzdsr.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY21rbnVmcGZoeGpjYW56ZHNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM3NTgzOSwiZXhwIjoyMDc3OTUxODM5fQ.NanLP7UThboH3JUeFqkwy5dovfzxJotf2yljsTQs7rY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  console.log('Creating tanks system in Supabase...\n')

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251120130000_create_tanks_system.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('Trying direct SQL execution...')
      const { error: directError } = await supabase.from('_migrations').select('*').limit(1)
      
      if (directError) {
        console.log('Note: Cannot execute SQL directly via API.')
        console.log('Please run this SQL in Supabase SQL Editor:')
        console.log('\nhttps://supabase.com/dashboard/project/dscmknufpfhxjcanzdsr/sql/new\n')
        console.log('SQL file location:', migrationPath)
        return
      }
    }

    console.log('Tanks system created successfully!')
    
    // Verify tanks were created
    const { data: tanks, error: tanksError } = await supabase
      .from('tanks')
      .select('tank_id, tank_name, status')
      .order('tank_id')

    if (tanksError) {
      console.error('Error verifying tanks:', tanksError)
    } else {
      console.log(`\nCreated ${tanks?.length || 0} tanks:`)
      tanks?.forEach(tank => {
        console.log(`  - ${tank.tank_id}: ${tank.tank_name} (${tank.status})`)
      })
    }
  } catch (error: any) {
    console.error('Error:', error.message)
    console.log('\nPlease run the migration manually in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/dscmknufpfhxjcanzdsr/sql/new')
  }
}

main()

