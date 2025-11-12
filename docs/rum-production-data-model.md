# Rum Production Data Model

## Overview

This document defines the standardized data structure for rum production runs in the Distil system.

---

## Core Principles

1. **No emojis** in any part of the system (UI, reports, or data)
2. **Single source of truth**: `final_abv_percent` from fermentation = `boiler_abv_percent` in distillation
3. **Three-stage workflow**: Fermentation → Distillation → Maturation
4. **Fermentation is a single block** containing all related data and notes

---

## JSON Data Structure

```json
{
  "batch_id": "RON-24.7",
  "product_name": "Cane Spirit - Heavy",
  "product_type": "rum",
  "date": "2024-06-25",
  
  "fermentation": {
    "start_date": "2024-06-20",
    "duration_hours": 108,
    "substrate": {
      "type": "Molasses",
      "batch": "MOL-24-3",
      "mass_kg": 450
    },
    "water_mass_kg": 650,
    "initial_brix": 16.5,
    "final_brix": 0.8,
    "initial_ph": 5.2,
    "final_ph": 4.8,
    "final_abv_percent": 10.2,
    "temperature_c": 31.0,
    "yeast": {
      "type": "SafSpirit M-1",
      "mass_g": 150,
      "rehydration_temp_c": 38,
      "rehydration_time_min": 20
    },
    "dunder": {
      "added": true,
      "type": "Heavy",
      "volume_l": 100,
      "ph": 4.2
    },
    "nutrients": {
      "dap_g": 50,
      "fermaid_o_g": 30,
      "citric_acid_g": 10,
      "calcium_carbonate_g": 5
    },
    "antifoam": {
      "added": true,
      "volume_ml": 15
    },
    "curves": {
      "temperature": {
        "0h": 28,
        "24h": 31,
        "48h": 32,
        "72h": 31,
        "96h": 30
      },
      "brix": {
        "0h": 16.5,
        "24h": 12.0,
        "48h": 6.5,
        "72h": 2.0,
        "96h": 0.8
      },
      "ph": {
        "0h": 5.2,
        "24h": 5.0,
        "48h": 4.9,
        "72h": 4.8,
        "96h": 4.8
      }
    },
    "notes": "Fermentation completed cleanly with consistent temperature profile. Dunder addition contributed to complexity."
  },
  
  "distillation": {
    "date": "2024-06-25",
    "still": "Roberta",
    "start_time": "08:30",
    "charge": {
      "boiler": {
        "volume_l": 750,
        "abv_percent": 10.2,
        "lal": 76.5,
        "elements": "3/3"
      },
      "retort1": {
        "content": "Heads from CS-25-1",
        "volume_l": 50,
        "abv_percent": 83.0,
        "lal": 41.5,
        "elements": "2/2"
      },
      "retort2": {
        "content": "Tails from CS-24-3",
        "volume_l": 120,
        "abv_percent": 65.0,
        "lal": 78.0,
        "elements": "1/2"
      }
    },
    "total_charge_l": 920,
    "total_lal_start": 196.0,
    "cuts": {
      "foreshots": {
        "time": "09:15",
        "volume_l": 1.5,
        "abv_percent": 30.0,
        "notes": "Discarded - strong solvent aroma"
      },
      "heads": {
        "time": "09:20",
        "volume_l": 10.0,
        "abv_percent": 83.0,
        "lal": 8.3,
        "notes": "Sharp, acetone-like"
      },
      "hearts": {
        "time": "09:45",
        "volume_l": 236.0,
        "abv_percent": 80.9,
        "lal": 190.9,
        "notes": "Clean, fruity, balanced"
      },
      "early_tails": {
        "time": "13:30",
        "volume_l": 50.0,
        "abv_percent": 75.0,
        "lal": 37.5,
        "notes": "Slight oiliness, saved for redistillation"
      },
      "late_tails": {
        "time": "14:15",
        "volume_l": 176.0,
        "abv_percent": 65.0,
        "lal": 114.4,
        "notes": "Heavy, vegetal - for next batch retort"
      }
    },
    "total_output_l": 473.5,
    "total_lal_end": 351.1,
    "lal_loss": 44.9,
    "heart_yield_percent": 97.4,
    "notes": "Excellent run. Early and late tails collected separately for next batch distillation. Hearts show good balance."
  },
  
  "maturation": {
    "fill_date": "2024-07-01",
    "cask": {
      "number": "CB-018",
      "origin": "Kentucky",
      "type": "Ex-Bourbon",
      "size_l": 200,
      "previous_contents": "Bourbon (4 years)"
    },
    "fill": {
      "abv_percent": 63.5,
      "volume_l": 190,
      "lal": 120.7
    },
    "location": "Warehouse A - Rack 3",
    "expected_bottling_date": "2027-07-01",
    "notes": "Transferred to toasted oak; showing light vanilla notes after 3 months. Monitoring for angel's share."
  }
}
```

---

## Database Schema (Supabase)

### Table: `rum_production_runs`

#### Required Fields to Add:

```sql
-- Add missing cuts fields
ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS foreshots_volume_l NUMERIC;

ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS tails_volume_l NUMERIC;

ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS tails_abv_percent NUMERIC;

-- Add antifoam tracking
ALTER TABLE rum_production_runs 
ADD COLUMN IF NOT EXISTS antifoam_added BOOLEAN DEFAULT false;

-- Rename fermaid_g to fermaid_o_g for clarity
ALTER TABLE rum_production_runs 
RENAME COLUMN fermaid_g TO fermaid_o_g;
```

#### Key Relationships:

- `final_abv_percent` (fermentation) = `boiler_abv_percent` (distillation)
- Both fields should be populated from the same source value
- Display in both sections for context, but maintain single source of truth

---

## UI Display Structure

### Layout Order:

1. **Process Timeline** (visual indicator)
   - Fermentation → Distillation → Barrel → Bottling

2. **KPI Summary Bar** (6 metrics)
   - Hearts (L & ABV)
   - Heart Yield (%)
   - Fill ABV (%)
   - Cask #
   - Total LAL
   - LAL Loss (%)

3. **Fermentation Section** (complete block)
   - All fermentation data (2-column grid)
   - Fermentation curves (temperature, brix, pH)
   - Fermentation notes

4. **Distillation Section**
   - Distillation data (date, still, boiler, retorts)
   - Cuts (foreshots, heads, hearts, early tails, late tails)
   - LAL summary (start, end, loss)
   - Distillation notes

5. **Barrel/Maturation Section**
   - Cask details (number, origin, type, size)
   - Fill data (date, ABV, volume, LAL)
   - Location & expected bottling
   - Maturation notes

### Design Rules:

- **No emojis** anywhere
- **Clean typography**: uppercase section headers, consistent spacing
- **Color coding** for cuts:
  - Foreshots: red (`bg-red-50`)
  - Heads: orange (`bg-orange-50`)
  - Hearts: green (`bg-green-50`)
  - Tails: yellow (`bg-yellow-50`)
- **Background colors**:
  - Fermentation: `bg-stone-50`
  - Distillation: `bg-stone-100`
  - Barrel/Maturation: `bg-stone-50`

---

## Data Validation Rules

1. **Fermentation**:
   - `final_abv_percent` must be > 0 and < 20
   - `initial_brix` must be > `final_brix`
   - `duration_hours` must be > 0

2. **Distillation**:
   - `boiler_abv_percent` should equal `final_abv_percent` from fermentation
   - Sum of cuts volumes should not exceed total charge volume
   - Hearts LAL should be the primary metric for yield calculation

3. **Maturation**:
   - `fill_abv_percent` should be close to `hearts_abv_percent` (accounting for dilution)
   - `volume_filled_l` should not exceed `cask_size_l`

---

## Migration Notes

### Existing Data:

- Many records have `final_abv_percent` = NULL
- Many records have `boiler_abv_percent` = NULL
- `tails_segments` is JSONB but should be simplified to `tails_volume_l` + `tails_abv_percent`

### Recommended Actions:

1. Populate missing `final_abv_percent` values from fermentation calculations
2. Set `boiler_abv_percent` = `final_abv_percent` where applicable
3. Extract tails data from `tails_segments` JSONB into new columns
4. Add `foreshots_volume_l` based on existing notes/records

---

## Version History

- **v1.0** (2025-01-07): Initial standardized model
  - Removed emojis from all interfaces
  - Defined single-source-of-truth for ABV values
  - Structured three-stage workflow
  - Documented UI display rules

