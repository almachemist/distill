# Instructions for Cursor: Gin Batch Migration to Supabase

## Project Context

We are migrating historical distillation data for various gin products to Supabase from JSON files currently stored in a Word document.

These JSONs were initially generated in ChatGPT, and each block corresponds to one distillation batch.

The goal is to structure this data in the Supabase database following the same standardized format already created for the "Signature Dry Gin" product.

---

## Supabase Database Structure

A table already exists in Supabase with the following structure:

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

There are also enums and auxiliary tables (batches, botanicals, batch_charges, distillation_logs), but the initial migration will focus on the `production_batches` table, where all JSON content for each batch will be inserted into the `data` field.

---

## What Needs to Be Done

1. **I have multiple JSONs pasted in a Word document**, each representing a complete distillation.
   Each JSON contains information about the batch, charge, botanicals, distillation cuts (foreshots, heads, hearts, early tails, late tails), and observations.

2. **I need to paste this content directly here in Cursor**, and I want Cursor to:
   - Read and recognize all JSONs contained in the text
   - Convert and normalize this data to the format accepted by Supabase
   - Automatically generate SQL `INSERT INTO production_batches` commands, or a ready-to-upload `.sql` file

---

## Technical Instructions for Cursor

**IMPORTANT**: The structure and insertion model has already been defined and tested for the "Signature Dry Gin" product.

**All new JSONs must follow exactly the same format**, both in keys and internal structure of the `data` field, to avoid conflicts between product data in the Supabase database.

### Field Mapping

- Each JSON should become a new row in the `production_batches` table
- The `id` field should come from the batch identifier (e.g., "SPIRIT-GIN-OAKS-005")
- The `type` field should contain the commercial product name, such as "Wet Season Gin", "Oaks Kitchen Gin", "Rainforest Gin", etc.
- The `still` field should contain the name of the still used (e.g., "Roberta", "Carrie", "CP-270-1")
- The `data` field should contain the complete distillation JSON, properly validated and formatted according to the SignatureDry standard

### Required JSON Structure

The `data` field must follow this structure (based on existing Navy Strength Gin):

```json
{
  "spiritRunId": "SPIRIT-GIN-OAKS-005-WS",
  "sku": "Wet Season Gin",
  "date": "2024-05-13",
  "stillUsed": "Carrie",
  "description": "Description of the batch",
  "notes": "General notes",
  "chargeAdjustment": {
    "total": {
      "volume_L": 1000,
      "abv_percent": 50.3,
      "lal": 503
    },
    "components": [
      {
        "id": "uuid",
        "type": "ethanol",
        "source": "Manildra NC96",
        "volume_L": 500,
        "abv_percent": 96,
        "lal": 480
      }
    ]
  },
  "botanicals": [
    {
      "id": "uuid",
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
    "steeping": "14 hours",
    "options": null
  },
  "boilerOn": "08:15 AM",
  "runData": [
    {
      "id": "uuid",
      "time": "11:15 AM",
      "phase": "Foreshots",
      "volume_L": 2,
      "abv_percent": 85,
      "lal": 1.7,
      "condenserTemp_C": 35,
      "observations": "35A"
    }
  ],
  "output": [
    {
      "id": "uuid",
      "phase": "Foreshots",
      "volume_L": 2,
      "abv_percent": 85,
      "lal": 1.7,
      "output": "Discarded",
      "receivingVessel": "20L Waste"
    }
  ],
  "totalRun": {
    "volume_L": 538,
    "abv_percent": 82,
    "lal": 503,
    "notes": "Total recovered"
  },
  "dilutions": [
    {
      "id": "uuid",
      "number": 1,
      "date": "2025-03-07",
      "newMake_L": 306,
      "filteredWater_L": 119,
      "newVolume_L": 425,
      "abv_percent": 59.1,
      "notes": "First dilution"
    }
  ],
  "finalOutput": {
    "totalVolume_L": 425,
    "abv_percent": 59.1,
    "lal": 251.2,
    "notes": "Final blend"
  }
}
```

### Output Format

The final file can be exported as:
- `.sql` (with all `INSERT INTO production_batches (...) VALUES (...);` statements), or
- `.json` (an array of objects ready for import via Supabase API)

---

## Expected Result

After processing, Cursor should generate outputs like:

```sql
INSERT INTO production_batches (id, data, type, still)
VALUES (
  'SPIRIT-GIN-OAKS-005-WS',
  '{"spiritRunId":"SPIRIT-GIN-OAKS-005-WS","date":"2024-05-13",...}',
  'Wet Season Gin',
  'Carrie'
);
```

---

## Important Notes

- **No emojis or special characters**
- **Date format must be YYYY-MM-DD**
- **All numeric values must use decimal point (.)**
- **If a batch does not have complete information** (e.g., no maturation), the field should be an empty object `{}` or `null`
- **It is essential that the JSON structure of all products follows the same pattern** of keys, subfields, and hierarchy already used in SignatureDry, to ensure compatibility between datasets
- **All nested objects must have unique UUIDs** (botanicals, components, runData, output, dilutions)

---

## Validation Checklist

Before inserting:
- [ ] All `id` values are unique
- [ ] All dates are in `YYYY-MM-DD` format
- [ ] All numeric values use decimal points
- [ ] No emojis or special characters
- [ ] JSON is valid
- [ ] `type` and `still` fields match existing conventions
- [ ] All nested objects have unique UUIDs
- [ ] Structure matches the SignatureDry standard

---

## How to Use

1. **Paste your JSON data** (one or multiple batches)
2. **Cursor will process and validate** the data
3. **Cursor will generate SQL INSERT statements** or a `.sql` file
4. **Review the output** for any errors or warnings
5. **Upload to Supabase SQL Editor** and execute

---

## Example Input

You can paste JSON in any of these formats:

**Single batch:**
```json
{
  "batch_id": "SPIRIT-GIN-OAKS-005",
  "product_name": "Wet Season Gin",
  "still": "Carrie",
  "date": "2024-05-13",
  ...
}
```

**Multiple batches:**
```json
[
  {
    "batch_id": "SPIRIT-GIN-OAKS-005",
    ...
  },
  {
    "batch_id": "SPIRIT-GIN-OAKS-006",
    ...
  }
]
```

**Or just paste the raw JSON text** and Cursor will parse it.

---

Ready to process your gin batch data!

