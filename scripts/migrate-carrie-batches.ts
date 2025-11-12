#!/usr/bin/env tsx
/**
 * Migration Script: Carrie Still Batches (14 batches)
 *
 * Migrates the remaining distillation batches from batches.dataset.ts to Supabase
 * These include:
 * - 3 Ethanol batches (SPIRIT-LIQ-001, 002, 003)
 * - 2 Vodka batches (VODKA-001, 003)
 * - 3 Merchant Mae Gin batches (SPIRIT-GIN-MM-001, 002, 003)
 * - 1 Navy Strength Gin batch (SPIRIT-GIN-NS-018)
 * - 1 Dry Season Gin batch (SPIRIT-GIN-DRY-2024)
 * - 1 Wet Season Gin batch (SPIRIT-GIN-OAKS-005-WS)
 * - 2 Rainforest Gin batches (SPIRIT-GIN-RF-28, 29) - already in DB
 * - 1 Merchant Mae Gin batch (SPIRIT-GIN-MM-001)
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { batchesDataset } from '../src/modules/production/new-model/data/batches.dataset'

// Load environment variables from .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const envVars: Record<string, string> = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function migrateCarrieBatches() {
  console.log('🚀 Starting Carrie Still Batches Migration\n')

  // Extract all batches from batches_by_month
  const allBatches = Object.values(batchesDataset.batches_by_month ?? {}).flat()
  
  console.log(`📊 Found ${allBatches.length} batches in dataset\n`)

  const batches = allBatches.map((batch: any) => {
    // Calculate hearts LAL if not provided
    let heartsLal = batch.cuts?.hearts?.lal
    if (!heartsLal && batch.cuts?.hearts?.volume_l && batch.cuts?.hearts?.abv_percent) {
      heartsLal = batch.cuts.hearts.volume_l * batch.cuts.hearts.abv_percent / 100
    }

    // Calculate foreshots LAL
    let foreshotsLal = batch.cuts?.foreshots?.lal
    if (!foreshotsLal && batch.cuts?.foreshots?.volume_l && batch.cuts?.foreshots?.abv_percent) {
      foreshotsLal = batch.cuts.foreshots.volume_l * batch.cuts.foreshots.abv_percent / 100
    }

    // Calculate heads LAL
    let headsLal = batch.cuts?.heads?.lal
    if (!headsLal && batch.cuts?.heads?.volume_l && batch.cuts?.heads?.abv_percent) {
      headsLal = batch.cuts.heads.volume_l * batch.cuts.heads.abv_percent / 100
    }

    // Calculate tails LAL
    let tailsLal = batch.cuts?.tails?.lal
    if (!tailsLal && batch.cuts?.tails?.volume_l && batch.cuts?.tails?.abv_percent) {
      tailsLal = batch.cuts.tails.volume_l * batch.cuts.tails.abv_percent / 100
    }

    return {
      batch_id: batch.batch_id,
      sku: batch.sku || batch.display_name,
      display_name: batch.display_name,
      product_id: batch.product_id || null,
      date: batch.date,
      still_used: batch.still_used || 'Carrie',

      // Charge data (note: column names are charge_total_*)
      charge_total_volume_l: batch.charge?.total?.volume_l || null,
      charge_total_abv_percent: batch.charge?.total?.abv_percent || null,
      charge_total_lal: batch.charge?.total?.lal || null,
      charge_components: batch.charge?.components || null,

      // Botanicals (JSONB)
      botanicals: batch.botanicals ? {
        per_lal_g: batch.botanicals.per_lal_g,
        items: batch.botanicals.items
      } : null,

      // Cuts data
      foreshots_volume_l: batch.cuts?.foreshots?.volume_l || null,
      foreshots_abv_percent: batch.cuts?.foreshots?.abv_percent || null,
      foreshots_lal: foreshotsLal,

      heads_volume_l: batch.cuts?.heads?.volume_l || null,
      heads_abv_percent: batch.cuts?.heads?.abv_percent || null,
      heads_lal: headsLal,

      hearts_volume_l: batch.cuts?.hearts?.volume_l || null,
      hearts_abv_percent: batch.cuts?.hearts?.abv_percent || null,
      hearts_lal: heartsLal,

      tails_volume_l: batch.cuts?.tails?.volume_l || null,
      tails_abv_percent: batch.cuts?.tails?.abv_percent || null,
      tails_lal: tailsLal,

      // Hearts segments (JSONB)
      hearts_segments: batch.cuts?.hearts_segments || null,

      // Dilution steps (JSONB)
      dilution_steps: batch.dilution_steps || null,

      // Final output
      final_output_volume_l: batch.final_output?.volume_l || null,
      final_output_abv_percent: batch.final_output?.abv_percent || null,
      final_output_lal: batch.final_output?.lal || null,

      // Metadata
      notes: batch.notes || batch.run_summary?.observations?.join('; ') || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })

  console.log('📝 Prepared batch records:\n')
  batches.forEach((batch, idx) => {
    console.log(`   ${idx + 1}. ${batch.batch_id} - ${batch.display_name} (${batch.date})`)
  })

  console.log('\n🔄 Upserting batches to Supabase...\n')

  const { data, error } = await supabase
    .from('distillation_runs')
    .upsert(batches, {
      onConflict: 'batch_id',
      ignoreDuplicates: false
    })
    .select()

  if (error) {
    console.error('❌ Error upserting batches:', error)
    process.exit(1)
  }

  console.log(`✅ Successfully migrated ${batches.length} batches!\n`)

  // Verify the migration
  console.log('🔍 Verifying migration...\n')
  
  const { data: allDistillationRuns, error: verifyError } = await supabase
    .from('distillation_runs')
    .select('batch_id, display_name, date')
    .order('date', { ascending: false })

  if (verifyError) {
    console.error('❌ Error verifying migration:', verifyError)
    process.exit(1)
  }

  console.log(`✅ Total distillation runs in database: ${allDistillationRuns?.length || 0}\n`)
  
  console.log('📊 Recent batches:')
  allDistillationRuns?.slice(0, 10).forEach((batch, idx) => {
    console.log(`   ${idx + 1}. ${batch.batch_id} - ${batch.display_name} (${batch.date})`)
  })

  console.log('\n✅ Migration complete!')
}

migrateCarrieBatches().catch(console.error)

