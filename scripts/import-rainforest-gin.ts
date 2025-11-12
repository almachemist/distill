import { createClient } from '@supabase/supabase-js';

// Rainforest Gin data
const rainforestGinBatches = [
  {
    "id": "rf-29-2024-03-14",
    "batch_id": "SPIRIT-GIN-RF-29",
    "product_name": "Rainforest Gin",
    "product_type": "gin",
    "sku": "RAIN-29",
    "still_used": "Roberta",
    "distillation_date": "2024-03-14",
    "boiler_charge_l": 510,
    "boiler_abv_percent": 28.4,
    "boiler_lal": 144.84,
    "botanicals": [
      {"name": "Juniper", "weight_g": 2450},
      {"name": "Coriander", "weight_g": 1300},
      {"name": "Angelica Root", "weight_g": 330},
      {"name": "Lime Peel (fresh)", "weight_g": 650},
      {"name": "Lemon Myrtle", "weight_g": 190},
      {"name": "Pepperberry", "weight_g": 250},
      {"name": "Cinnamon Myrtle", "weight_g": 150},
      {"name": "Cassia", "weight_g": 90},
      {"name": "Aniseed Myrtle", "weight_g": 70},
      {"name": "Orris Root", "weight_g": 70},
      {"name": "Rainforest Leaf Mix", "weight_g": 260}
    ],
    "distillation": {
      "start_time": "07:35",
      "first_drip_time": "09:10",
      "start_abv_percent": 85.7,
      "collection": [
        {
          "cut": "heads",
          "start_time": "09:10",
          "end_time": "09:55",
          "volume_l": 19,
          "abv_percent": 85.7,
          "lal": 16.283,
          "notes": "Clean heads fraction, saved for recycling."
        },
        {
          "cut": "hearts",
          "start_time": "09:55",
          "end_time": "12:40",
          "volume_l": 96.5,
          "abv_percent": 79.8,
          "lal": 76.947,
          "notes": "Main hearts collected with balanced citrus and spice profile."
        },
        {
          "cut": "tails",
          "start_time": "12:40",
          "end_time": "14:00",
          "volume_l": 37,
          "abv_percent": 62.8,
          "lal": 23.236,
          "notes": "Late tails, kept for next retort charge."
        }
      ],
      "end_time": "14:00",
      "total_lal_collected": 116.47,
      "heart_yield_percent": 53.13,
      "lal_loss": 28.37
    },
    "dilution": [
      {
        "stage": 1,
        "start_volume_l": 96.5,
        "start_abv_percent": 79.8,
        "start_lal": 76.95,
        "dilution_water_l": 60,
        "new_abv_percent": 61.5,
        "new_volume_l": 125,
        "new_lal": 76.88
      },
      {
        "stage": 2,
        "start_volume_l": 125,
        "start_abv_percent": 61.5,
        "start_lal": 76.88,
        "dilution_water_l": 3.5,
        "new_abv_percent": 59.4,
        "new_volume_l": 128.5,
        "new_lal": 76.30
      },
      {
        "stage": 3,
        "start_volume_l": 128.5,
        "start_abv_percent": 59.4,
        "start_lal": 76.30,
        "dilution_water_l": 9,
        "new_abv_percent": 57.2,
        "new_volume_l": 137.5,
        "new_lal": 78.65
      }
    ],
    "bottling": {
      "final_volume_l": 137.5,
      "final_abv_percent": 57.2,
      "bottling_date": "2024-03-20",
      "lal_filled": 78.65,
      "bottles_700ml": 190,
      "expected_label": "Rainforest Gin – March 2024"
    },
    "created_by": "Gabi",
    "notes": "Rainforest Gin March run. Excellent aromatic balance; clear hearts cut. Stored at 57.2% for later dilution to 45% bottling strength.",
    "raw_log": "14/03/2024 Roberta 510L 28.4% (144.84 LAL). Botanicals: Juniper 2450g, Coriander 1300g, Angelica 330g, Lime 650g, Lemon Myrtle 190g, Pepperberry 250g, Cinnamon Myrtle 150g, Cassia 90g, Aniseed Myrtle 70g, Orris Root 70g, Rainforest Leaf Mix 260g. Start 07:35, first drip 09:10 @85.7%. Heads 19L, Hearts 96.5L @79.8%, Tails 37L @62.8%. Dilutions: 61.5% → 59.4% → 57.2%. 137.5L final."
  },
  {
    "id": "rf-30-2024-03-21",
    "batch_id": "SPIRIT-GIN-RF-30",
    "product_name": "Rainforest Gin",
    "product_type": "gin",
    "sku": "RAIN-30",
    "still_used": "Roberta",
    "distillation_date": "2024-03-21",
    "boiler_charge_l": 520,
    "boiler_abv_percent": 28.1,
    "boiler_lal": 146.12,
    "botanicals": [
      {"name": "Juniper", "weight_g": 2450},
      {"name": "Coriander", "weight_g": 1300},
      {"name": "Angelica Root", "weight_g": 330},
      {"name": "Lime Peel (fresh)", "weight_g": 650},
      {"name": "Lemon Myrtle", "weight_g": 190},
      {"name": "Pepperberry", "weight_g": 250},
      {"name": "Cinnamon Myrtle", "weight_g": 150},
      {"name": "Cassia", "weight_g": 90},
      {"name": "Aniseed Myrtle", "weight_g": 70},
      {"name": "Orris Root", "weight_g": 70},
      {"name": "Rainforest Leaf Mix", "weight_g": 260}
    ],
    "distillation": {
      "start_time": "07:40",
      "first_drip_time": "09:15",
      "start_abv_percent": 85.6,
      "collection": [
        {
          "cut": "heads",
          "start_time": "09:15",
          "end_time": "09:50",
          "volume_l": 19,
          "abv_percent": 85.6,
          "lal": 16.26,
          "notes": "Clean early heads."
        },
        {
          "cut": "hearts",
          "start_time": "09:50",
          "end_time": "12:45",
          "volume_l": 97,
          "abv_percent": 79.5,
          "lal": 77.12,
          "notes": "Core spirit; consistent with RF-29 batch quality."
        },
        {
          "cut": "tails",
          "start_time": "12:45",
          "end_time": "14:10",
          "volume_l": 36,
          "abv_percent": 63,
          "lal": 22.68,
          "notes": "Late tails, saved for next retort cycle."
        }
      ],
      "end_time": "14:10",
      "total_lal_collected": 116.06,
      "heart_yield_percent": 52.8,
      "lal_loss": 30.06
    },
    "dilution": [
      {
        "stage": 1,
        "start_volume_l": 97,
        "start_abv_percent": 79.5,
        "start_lal": 77.12,
        "dilution_water_l": 60,
        "new_abv_percent": 61.2,
        "new_volume_l": 126,
        "new_lal": 77.11
      },
      {
        "stage": 2,
        "start_volume_l": 126,
        "start_abv_percent": 61.2,
        "start_lal": 77.11,
        "dilution_water_l": 3.5,
        "new_abv_percent": 59.3,
        "new_volume_l": 129.5,
        "new_lal": 76.86
      },
      {
        "stage": 3,
        "start_volume_l": 129.5,
        "start_abv_percent": 59.3,
        "start_lal": 76.86,
        "dilution_water_l": 9,
        "new_abv_percent": 57.1,
        "new_volume_l": 138.5,
        "new_lal": 78.83
      }
    ],
    "bottling": {
      "final_volume_l": 138.5,
      "final_abv_percent": 57.1,
      "bottling_date": "2024-03-27",
      "lal_filled": 78.83,
      "bottles_700ml": 192,
      "expected_label": "Rainforest Gin – March 2024 (RF-30)"
    },
    "created_by": "Gabi",
    "notes": "Second March Rainforest Gin run. Same botanical charge as RF-29. Consistent aromatic yield; stored at 57.1% prior to dilution to bottling strength.",
    "raw_log": "21/03/2024 Roberta 520L 28.1% (146.12 LAL). Botanicals identical to RF-29. Start 07:40, first drip 09:15 @85.6%. Heads 19L, Hearts 97L @79.5%, Tails 36L @63%. Dilutions: 61.2% → 59.3% → 57.1%. 138.5L final."
  }
];

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dscmknufpfhxjcanzdsr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase anon key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to import Rainforest Gin batches
const importRainforestGinBatches = async () => {
  console.log(`Starting import of ${rainforestGinBatches.length} Rainforest Gin batches...`);
  
  for (const [index, batch] of rainforestGinBatches.entries()) {
    try {
      const batchId = batch.batch_id;
      console.log(`\nProcessing batch ${index + 1}/${rainforestGinBatches.length}: ${batchId}`);
      
      // Include all batch data in the data JSONB field
      const batchData = {
        ...batch,
        // Add any additional fields that should be queryable
        product_name: 'Rainforest Gin',
        distillation_date: batch.distillation_date
      };
      
      const { data, error } = await supabase
        .from('production_batches')
        .upsert(
          {
            id: batchId,
            data: batchData,
            type: 'gin',
            still: 'Roberta', // Using 'Roberta' as per the provided data
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );
      
      if (error) throw error;
      console.log(`✅ Successfully imported ${batchId}`);
      
    } catch (error) {
      console.error(`❌ Error importing batch:`, error);
    }
  }
  
  console.log('\nImport completed!');
};

// Run the import
importRainforestGinBatches().catch(console.error);
