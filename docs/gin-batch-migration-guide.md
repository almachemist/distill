# Gin Batch Migration Guide

## Overview

This guide explains how to migrate historical gin distillation data from JSON format into the Supabase `production_batches` table.

## Database Structure

### Table: `production_batches`

```sql
CREATE TABLE public.production_batches (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  type TEXT NOT NULL,
  still TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Field Descriptions

- **id**: Unique batch identifier (e.g., "SPIRIT-GIN-OAKS-005-WS")
- **data**: Complete JSON object containing all distillation data
- **type**: Product name (e.g., "Wet Season Gin", "Oaks Kitchen Gin", "Rainforest Gin")
- **still**: Still name used (e.g., "Roberta", "Carrie", "CP-270-1")
- **created_at**: Auto-generated timestamp
- **updated_at**: Auto-generated timestamp

## JSON Data Structure

The `data` field must follow this standardized structure (based on existing Navy Strength Gin format):

```json
{
  "spiritRunId": "SPIRIT-GIN-OAKS-005-WS",
  "sku": "Wet Season Gin",
  "date": "2024-05-13",
  "stillUsed": "Carrie",
  "description": "Description of the batch",
  "notes": "General notes about the run",
  
  "chargeAdjustment": {
    "total": {
      "volume_L": 1000,
      "abv_percent": 50.3,
      "lal": 503
    },
    "components": [
      {
        "id": "uuid-here",
        "type": "ethanol",
        "source": "Manildra NC96",
        "volume_L": 500,
        "abv_percent": 96,
        "lal": 480
      },
      {
        "id": "uuid-here",
        "type": "dilution",
        "source": "Filtered Water",
        "volume_L": 500,
        "abv_percent": 0,
        "lal": 0
      }
    ]
  },
  
  "botanicals": [
    {
      "id": "uuid-here",
      "name": "Juniper",
      "weight_g": 6400,
      "ratio_percent": 63,
      "notes": "Crushed / steeped"
    }
  ],
  
  "totalBotanicals_g": 10160,
  "totalBotanicals_percent": 100,
  "botanicalsPerLAL": 20.2,
  
  "stillSetup": {
    "elements": "35 A on at 8:15 AM",
    "plates": "Zero plates",
    "steeping": "14 hours (Juniper, Coriander)",
    "options": null
  },
  
  "boilerOn": "08:15 AM",
  
  "runData": [
    {
      "id": "uuid-here",
      "time": "11:15 AM",
      "phase": "Foreshots",
      "volume_L": 2,
      "abv_percent": 85,
      "lal": 1.7,
      "volume_percent": 0.4,
      "condenserTemp_C": 35,
      "headTemp_C": null,
      "ambientTemp_C": null,
      "observations": "35A",
      "notes": null
    }
  ],
  
  "output": [
    {
      "id": "uuid-here",
      "phase": "Foreshots",
      "volume_L": 2,
      "abv_percent": 85,
      "lal": 1.7,
      "volume_percent": 0.4,
      "output": "Discarded",
      "receivingVessel": "20L Waste"
    }
  ],
  
  "totalRun": {
    "volume_L": 538,
    "abv_percent": 82,
    "lal": 503,
    "volume_percent": null,
    "notes": "Total recovered 538 L @ ~82% ABV"
  },
  
  "dilutions": [
    {
      "id": "uuid-here",
      "number": 1,
      "date": "2025-03-07",
      "newMake_L": 306,
      "filteredWater_L": 119,
      "newVolume_L": 425,
      "abv_percent": 59.1,
      "notes": "First dilution to 59.1% ABV."
    }
  ],
  
  "finalOutput": {
    "totalVolume_L": 425,
    "abv_percent": 59.1,
    "lal": 251.2,
    "notes": "Final blend at 59.1% ABV."
  }
}
```

## Migration Process

### Step 1: Prepare Your JSON Data

Ensure each JSON batch contains:
- Unique `spiritRunId` (will become the `id` field)
- Product name in `sku` field (will become the `type` field)
- Still name in `stillUsed` field (will become the `still` field)
- Date in `YYYY-MM-DD` format
- All numeric values use decimal point (`.`)
- No emojis or special characters

### Step 2: Use the Migration Script

Run the Python script to convert your JSONs:

```bash
python scripts/migrate_gin_batches.py input.json output.sql
```

### Step 3: Review Generated SQL

The script will generate INSERT statements like:

```sql
INSERT INTO production_batches (id, data, type, still)
VALUES (
  'SPIRIT-GIN-OAKS-005-WS',
  '{"spiritRunId":"SPIRIT-GIN-OAKS-005-WS",...}',
  'Wet Season Gin',
  'Carrie'
);
```

### Step 4: Execute in Supabase

Upload the SQL file to Supabase SQL Editor and execute.

## Important Notes

- **Consistency**: All batches must follow the same JSON structure
- **No Emojis**: Remove all emojis and special characters
- **Date Format**: Always use `YYYY-MM-DD`
- **Decimal Points**: Use `.` not `,` for decimals
- **Empty Objects**: If data is missing, use `{}` or `null`
- **UUIDs**: Generate unique UUIDs for all nested objects (botanicals, components, etc.)

## Product Types

Common product types to use:
- "Signature Dry Gin"
- "Navy Strength Gin"
- "Wet Season Gin"
- "Oaks Kitchen Gin"
- "Rainforest Gin"
- "Barrel Aged Gin"

## Still Names

Common still names:
- "Carrie"
- "Roberta"
- "CP-270-1"

## Validation Checklist

Before inserting:
- [ ] All `id` values are unique
- [ ] All dates are in `YYYY-MM-DD` format
- [ ] All numeric values use decimal points
- [ ] No emojis or special characters
- [ ] JSON is valid (use jsonlint.com)
- [ ] `type` and `still` fields match existing conventions
- [ ] All nested objects have unique UUIDs

