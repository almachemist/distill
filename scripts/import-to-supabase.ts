import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import path from 'path'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Read and filter production data for Carrie batches (gin and vodka)
const loadProductionData = () => {
  try {
    const dataPath = path.join(process.cwd(), 'src/modules/production/data/production_batches.json')
    const fileContent = readFileSync(dataPath, 'utf-8')
    const allBatches = JSON.parse(fileContent).batches
    
    // Filter for Carrie batches (gin and vodka)
    return allBatches.filter((batch: any) => {
      const batchId = batch.batch_id || ''
      return batchId.startsWith('GIN-') || batchId.startsWith('VODKA-') || 
             batchId.includes('GIN') || batchId.includes('VODKA')
    })
  } catch (error) {
    console.error('Error reading production data:', error)
    process.exit(1)
  }
}

// Main import function
const importBatches = async () => {
  const batches = loadProductionData()
  
  console.log(`Starting import of ${batches.length} batches...`)
  
  // Process each batch
  for (const [index, batch] of batches.entries()) {
    try {
      console.log(`\nProcessing batch ${index + 1}/${batches.length}: ${batch.batch_id}`)
      
      // Insert the batch
      const { data, error } = await supabase
        .from('production_batches')
        .upsert({
          id: batch.batch_id,
          data: batch, // Store the entire batch as JSONB
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
      
      if (error) throw error
      
      console.log(`✅ Successfully imported ${batch.batch_id}`)
      
    } catch (error) {
      console.error(`❌ Error importing batch ${batch.batch_id}:`, error)
    }
  }
  
  console.log('\nImport completed!')
}

// Run the import
importBatches().catch(console.error)
