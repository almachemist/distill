import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Configuration
const CONFIG = {
  supabaseUrl: 'https://dscmknufpfhxjcanzdsr.supabase.co',
  supabaseKey: process.env.SUPABASE_KEY,
  table: 'production_batches',
};

if (!CONFIG.supabaseKey) {
  console.error('❌ Error: SUPABASE_KEY environment variable is not set');
  console.log('Please set it in your .env file or run:');
  console.log('export SUPABASE_KEY=your_service_role_key_here');
  process.exit(1);
}

const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
  auth: { persistSession: false }
});

// Navy Strength Gin batch data
const NAVY_GIN_BATCHES = [
  {
    id: 'SPIRIT-GIN-NS-018',
    type: 'gin',
    still: 'Carrie',
    data: {
      sku: 'Navy Strength Gin',
      date: '2025-03-04',
      notes: 'Two-day Navy Strength Gin run with 14-hour steeping. Main hearts collected at 82% ABV, diluted to 59.1% for bottling. 220 L tails kept for vodka re-distillation.',
      output: [
        {
          id: 'c0122a2d-4b6a-4229-91da-89275ae3cefd',
          lal: 1.7,
          phase: 'Foreshots',
          output: 'Discarded',
          volume_L: 2,
          abv_percent: 85,
          volume_percent: 0.4,
          receivingVessel: '20L Waste'
        },
        {
          id: '18c2a12c-59c6-40b8-9164-b1f02a738966',
          lal: 8.5,
          phase: 'Heads',
          output: 'Feints',
          volume_L: 10,
          abv_percent: 84.8,
          volume_percent: 2,
          receivingVessel: 'FEINTS-GIN-MIX IBC-01'
        },
        {
          id: '57c6b213-ede9-4247-8ba6-7801aba497bd',
          lal: null,
          phase: 'Hearts',
          output: 'Navy Strength Gin',
          volume_L: 306,
          abv_percent: 82,
          volume_percent: null,
          receivingVessel: 'VC-230'
        },
        {
          id: '97eb395e-5bd7-43cb-becd-a880a9a105ad',
          lal: null,
          phase: 'Tails',
          output: 'FEINTS-GIN-MIX IBC-01',
          volume_L: 220,
          abv_percent: 81,
          volume_percent: null,
          receivingVessel: 'FEINTS-GIN-MIX IBC-01'
        }
      ],
      runData: [
        {
          id: 'cbbdc64c-0881-4f35-b751-e928f1abf44e',
          lal: 1.7,
          time: '11:15 AM',
          notes: null,
          phase: 'Foreshots',
          volume_L: 2,
          abv_percent: 85,
          observations: '35A',
          condenserTemp_C: 35
        },
        {
          id: '9c0be25e-a40b-4993-a72e-7c23a25340cb',
          lal: 8.5,
          time: '11:30 AM',
          notes: null,
          phase: 'Heads',
          volume_L: 10,
          abv_percent: 84.8,
          observations: '35A',
          condenserTemp_C: 35
        },
        {
          id: '844908d5-4900-4394-8d7d-721952c76a2c',
          lal: null,
          time: '05:30 PM',
          notes: null,
          phase: 'Middle Run (Hearts) – Part 1',
          volume_L: 185,
          abv_percent: 83,
          observations: 'Distilling at 30A'
        },
        {
          id: 'e3460519-dd92-464f-85e7-2aec4d174ab9',
          lal: null,
          time: '06:30 AM (05/03/25)',
          notes: null,
          phase: 'Middle Run (Hearts) – Part 2',
          volume_L: 306,
          abv_percent: 82,
          observations: 'Distilling at 30A, stopped at 79.9%'
        },
        {
          id: '6a8c941c-2198-4f34-90a8-dc157acfd8e9',
          lal: null,
          time: null,
          notes: null,
          phase: 'Tails',
          volume_L: 220,
          abv_percent: 81,
          observations: 'Kept aside for vodka redistillation'
        }
      ],
      boilerOn: '08:15 AM',
      totalRun: {
        lal: 503,
        notes: 'Total recovered 538 L @ ~82% ABV across two-day run. 220 L tails set aside for vodka.',
        volume_L: 538,
        abv_percent: 82,
        volume_percent: null
      },
      dilutions: [
        {
          id: '6a8a860b-964b-4029-a771-109663400382',
          lal: null,
          date: '2025-03-07',
          notes: 'First dilution to 59.1% ABV.',
          number: 1,
          newMake_L: 306,
          abv_percent: 59.1,
          newVolume_L: 425,
          ethanolAdded: null,
          filteredWater_L: 119,
          finalAbv_percent: null
        }
      ],
      stillUsed: 'Carrie',
      botanicals: [
        { id: '8480ffa3-886e-4969-868f-8f244097c8ab', name: 'Juniper', notes: 'Crushed / steeped', weight_g: 6400, ratio_percent: 63 },
        { id: 'ce68072c-4ce7-4a05-b119-d16d3a26a614', name: 'Coriander', notes: 'Steeped', weight_g: 1800, ratio_percent: 17.7 },
        { id: '2ae1fd8b-d7d8-4df9-be04-108a37bfcc4b', name: 'Angelica', weight_g: 180, ratio_percent: 1.8 },
        { id: 'c078917c-dca5-455a-9c61-c6b0a7db11a1', name: 'Orris Root', notes: 'a', weight_g: 90, ratio_percent: 0.9 },
        { id: 'f5edc52b-42ed-4336-8988-517dd18d0bf7', name: 'Orange', notes: '8 fresh naval orange rind', weight_g: 380, ratio_percent: 3.7 },
        { id: 'f39b453f-e7fc-4703-9491-b28ec7b53fdb', name: 'Lemon', notes: '12 fresh lemon rind', weight_g: 380, ratio_percent: 3.7 },
        { id: '687f903a-823e-47cc-b3ce-91d8dff99373', name: 'Finger Lime', notes: '120 caviar scoops', weight_g: 380, ratio_percent: 3.7 },
        { id: '24684280-7ca2-4863-9246-90f17f4970a4', name: 'Macadamia', notes: 'Sliced fresh macadamia', weight_g: 180, ratio_percent: 1.8 },
        { id: '3f8285df-846b-4f81-bdac-58289cc1bd97', name: 'Liquorice', notes: 'Liquorice root', weight_g: 100, ratio_percent: 1 },
        { id: 'b93aa5d4-5153-4cff-87b6-a99b690e3f59', name: 'Cardamon', notes: 'a', weight_g: 180, ratio_percent: 1.8 },
        { id: '8cb624a0-77ad-4408-abe1-540000f328f0', name: 'Chamomile', notes: 'a', weight_g: 90, ratio_percent: 0.9 }
      ],
      stillSetup: {
        plates: 'Zero plates',
        options: null,
        elements: '35 A on at 8:15 AM',
        steeping: '14 hours (Juniper, Coriander)'
      },
      description: 'High-strength gin distilled on Carrie still with citrus and native botanicals. Steeped 14 hours, zero plates, 35A start.',
      finalOutput: {
        lal: 251.2,
        notes: 'Final Navy Strength Gin blend at 59.1% ABV.',
        abv_percent: 59.1,
        totalVolume_L: 425
      },
      spiritRunId: 'SPIRIT-GIN-NS-018',
      botanicalsPerLAL: 20.2,
      chargeAdjustment: {
        total: {
          lal: 503,
          volume_L: 1000,
          abv_percent: 50.3
        },
        components: [
          {
            id: 'dcf32944-945b-4029-8d20-5b5e1492e945',
            lal: 480,
            type: 'ethanol',
            source: 'Manildra NC96',
            volume_L: 500,
            abv_percent: 96,
            expected_percent: null
          },
          {
            id: 'bcfc17fd-4735-43c5-a904-9d2e02a5c8cd',
            lal: 0,
            type: 'dilution',
            source: 'Filtered Water',
            volume_L: 500,
            abv_percent: 0,
            expected_percent: null
          }
        ]
      },
      totalBotanicals_g: 10160,
      totalBotanicals_percent: 100
    }
  }
  // Add more Navy Strength Gin batches here as needed
];

async function importBatch(batch) {
  try {
    console.log(`\n📦 Processing ${batch.id}...`);

    const { data, error } = await supabase
      .from(CONFIG.table)
      .upsert({
        id: batch.id,
        type: batch.type,
        still: batch.still,
        data: batch.data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ ${batch.id} - ${batch.data.sku} (${batch.data.date})`);
    return true;
  } catch (error) {
    console.error(`❌ Error importing ${batch.id}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Navy Strength Gin batch import...');
  
  // Test connection first
  console.log('🔌 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from(CONFIG.table).select('*').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your service role key is correct');
    console.log('2. Check if your IP is allowed in Supabase dashboard');
    console.log('3. The key should start with "eyJ" and be very long');
    process.exit(1);
  }

  // Import batches
  let successCount = 0;
  for (const batch of NAVY_GIN_BATCHES) {
    const success = await importBatch(batch);
    if (success) successCount++;
  }

  console.log(`\n✨ Import complete! Successfully imported ${successCount} of ${NAVY_GIN_BATCHES.length} batches.`);
}

main().catch(console.error);
