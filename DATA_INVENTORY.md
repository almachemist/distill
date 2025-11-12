# 📊 Complete Data Inventory - Distil Project

## Summary Statistics

| Category | Files | Est. Records | Status |
|----------|-------|--------------|--------|
| Rum Production | 1 | ~100 | ✅ Ready |
| Gin Production | 23 | ~25 | ✅ Ready |
| General Production | 1 | ~50 | ✅ Ready |
| Pricing Data | 1 | ~30 | ✅ Ready |
| Sales Data | 1 | ~100 | ✅ Ready |
| **TOTAL** | **27** | **~305** | **Ready for Migration** |

---

## Detailed File Inventory

### 1. RUM PRODUCTION DATA

#### Primary Source
```
📄 src/app/rum/rum_production_data.json
   ├─ Records: ~100 batches
   ├─ Date Range: 2023-08-04 to 2024-03-15+
   ├─ Batch IDs: RUM-23-1 through RUM-24-7
   ├─ Structure:
   │  ├─ batch_id
   │  ├─ date, day
   │  ├─ product, product_variant
   │  ├─ fermentation (substrate, brix, pH, yeast, temperature_profile)
   │  ├─ distillation (segments, cuts, yields)
   │  └─ output (status, volumes, ABV)
   └─ Target Table: rum_production_runs
```

**Sample Record:**
```json
{
  "batch_id": "RUM-24-1",
  "date": "2024-01-12",
  "product": "Rum",
  "product_variant": "Cane Syrup",
  "fermentation": {
    "substrate": "Cane Syrup",
    "substrate_batch": "2021",
    "substrate_mass_kg": 500,
    "water_mass_kg": 1500,
    "brix_initial": 22,
    "ph_initial": 5.3,
    "yeast_type": "Distillamax CN",
    "yeast_mass_g": 1000
  }
}
```

---

### 2. GIN PRODUCTION DATA

#### 2A. Signature Dry Gin (Individual Batches)
```
📁 scripts/data/batches/
   ├─ signature-dry-gin-0001.json (2021-01-22, CP-100 still)
   ├─ signature-dry-gin-0002.json (2021-02-04, CP-100 still)
   ├─ signature-dry-gin-0003.json (2021-02-19, CP-100 still)
   ├─ signature-dry-gin-0004.json (2021-03-05, CP-100 still)
   ├─ signature-dry-gin-0005.json (2021-03-19, CP-100 still)
   ├─ signature-dry-gin-0006.json (2021-04-02, CP-100 still)
   ├─ signature-dry-gin-0007.json (2021-04-16, CP-100 still)
   ├─ signature-dry-gin-0008.json (2021-04-30, CP-100 still)
   ├─ signature-dry-gin-0009.json (2021-05-14, CP-100 still)
   ├─ signature-dry-gin-0010.json (2021-11-12, CARRIE still)
   ├─ signature-dry-gin-0011.json (2021-11-26, CARRIE still)
   ├─ signature-dry-gin-0012.json (2021-12-10, CARRIE still)
   ├─ signature-dry-gin-0013.json (2021-12-24, CARRIE still)
   ├─ signature-dry-gin-0014.json (2022-01-07, CARRIE still)
   ├─ signature-dry-gin-0015.json (2022-01-21, CARRIE still)
   ├─ signature-dry-gin-0016.json (2022-11-01, CARRIE still)
   ├─ signature-dry-gin-0017.json (2023-08-15, CARRIE still)
   ├─ signature-dry-gin-0018.json (2024-01-31, CARRIE still)
   ├─ signature-dry-gin-0019.json (2024-10-29, CARRIE still - New Recipe Trial)
   └─ signature-dry-gin-0020.json (2025-04-28, CARRIE still)
   
   Total: 20 batches
   Date Range: 2021-01-22 to 2025-04-28
   Target Table: distillation_runs
```

**Structure:**
```json
{
  "recipe": "Signature Dry Gin",
  "runs": [{
    "run_id": "SPIRIT-GIN-SD-0001",
    "sku": "Signature Dry Gin",
    "date": "2021-01-22",
    "still_used": "CP-100",
    "boiler_start_time": "08:25",
    "charge": {
      "ethanol_source": "Manildra NC96",
      "ethanol_volume_L": 40,
      "ethanol_abv_percent": 96.0,
      "water_volume_L": 45,
      "total_charge_L": 85
    },
    "still_setup": {
      "elements": "5750W x2; 2400W",
      "steeping": "18 hours (Juniper, Coriander)",
      "plates": "Zero plates"
    },
    "distillation": {
      "cuts": [...],
      "yields": [...]
    }
  }]
}
```

#### 2B. Signature Dry Gin (Consolidated Backups)
```
📁 scripts/backups/
   ├─ signature-dry-gin-backup-2025-11-07.json
   ├─ signature-dry-gin-complete-backup-2025-11-07.json
   ├─ signature-dry-gin-complete-history-2025-11-07.json
   └─ signature-dry-gin-full-history-2025-11-07.json
   
   Purpose: Backup copies (use individual files as source)
```

#### 2C. Rainforest Gin
```
📄 scripts/rainforest-gin-data.json
   ├─ Records: 2 batches (RF-28, RF-29)
   ├─ Dates: 2024-10-09, 2025-01-20
   ├─ Still: Roberta
   ├─ Structure:
   │  ├─ batch_id, product_name, sku
   │  ├─ distillation_date, still_used
   │  ├─ boiler_charge_l, boiler_abv_percent
   │  ├─ botanicals (array with weights)
   │  ├─ distillation (foreshots, heads, hearts, tails)
   │  ├─ dilution (stages)
   │  └─ bottling (final volumes, bottles)
   └─ Target Table: distillation_runs

📄 scripts/backups/rainforest-gin-backup-2025-11-07.json
   └─ Backup copy
```

**Sample Record:**
```json
{
  "id": "rf-28-2024-10-09",
  "batch_id": "SPIRIT-GIN-RF-28",
  "product_name": "Rainforest Gin",
  "sku": "RAIN-28",
  "still_used": "Roberta",
  "distillation_date": "2024-10-09",
  "boiler_charge_l": 1000,
  "boiler_abv_percent": 51.0,
  "botanicals": [
    {"name": "Juniper", "weight_g": 6360},
    {"name": "Coriander", "weight_g": 1410}
  ]
}
```

#### 2D. Other Gin Sources
```
📄 src/modules/production/data/signature-gin-batches.json
   └─ Alternative format (may be duplicate)

📄 supabase/exports/gin-batches.json
   └─ Export format (5 batches: NS-018, DRY-2024, OAKS-005, RF-28, SD-0019)
```

---

### 3. GENERAL PRODUCTION BATCHES

```
📄 src/modules/production/data/production_batches.json
   ├─ Records: ~50 batches
   ├─ Types: RUM-24-*, GIN-*, VODKA-*, CS-* (Cane Spirit)
   ├─ Structure:
   │  ├─ batch_id, product_group
   │  ├─ date, feedstock, year
   │  ├─ fermentation (volume, brix, pH, duration, notes)
   │  ├─ distillation (date, charge, segments)
   │  └─ output (status)
   └─ Target Table: production_batches
```

**Sample Record:**
```json
{
  "batch_id": "RUM-24-1",
  "product_group": "RUM-24",
  "date": "2024-01-12",
  "feedstock": "Cane Syrup 2021",
  "year": 2021,
  "fermentation": {
    "date_start": "2024-01-12",
    "volume_l": 1500,
    "brix_start": 22,
    "ph_start": 5.3,
    "duration_days": 5
  }
}
```

---

### 4. PRICING CATALOGUE

```
📄 data/pricing_catalogue_2025.json
   ├─ Records: ~30 products
   ├─ Categories:
   │  ├─ Limited Release (2 products)
   │  ├─ Core Range (6 products)
   │  ├─ Mini Bar & Gift Range (4 products)
   │  ├─ House Pour Range (4 products)
   │  └─ Traveler Range (4 products)
   ├─ Structure:
   │  ├─ wholesale_ex_gst
   │  ├─ rrp (recommended retail price)
   │  ├─ volume_ml
   │  ├─ abv
   │  ├─ moq (minimum order quantity)
   │  └─ metadata (updated, discontinued, notes)
   └─ Target Table: pricing_catalogue or products
```

**Sample Record:**
```json
{
  "Limited Release": {
    "Australian Cane Spirit": {
      "wholesale_ex_gst": 60,
      "rrp": 89,
      "volume_ml": 700,
      "abv": 48,
      "moq": "Case of 6 (or mixed)",
      "metadata": {
        "updated": "2025-10",
        "discontinued": false
      }
    }
  }
}
```

---

### 5. SALES SUMMARY

```
📄 data/sales_summary_2025.json
   ├─ Records: ~100 transactions
   ├─ Categories:
   │  ├─ Uncategorized
   │  └─ Cellar Door
   ├─ Structure:
   │  ├─ item_name, item_variation
   │  ├─ sku
   │  ├─ items_sold, units_sold
   │  ├─ product_sales, refunds, discounts_and_comps
   │  ├─ net_sales, tax, gross_sales
   └─ Target Table: sales_summary or sales_transactions
```

**Sample Record:**
```json
{
  "item_name": "Wet Season Gin 700ml",
  "item_variation": "Regular",
  "sku": "Wet Season Gin 700ml",
  "items_sold": 251,
  "product_sales": 21450.98,
  "refunds": -90.9,
  "discounts_and_comps": -3225.59,
  "net_sales": 18134.49,
  "tax": 1823.92,
  "gross_sales": 19958.41,
  "units_sold": 251
}
```

---

### 6. TYPESCRIPT DATA FILES (Lower Priority)

```
📄 src/modules/production/data/rum-batches.dataset.ts
   └─ TypeScript version of rum data (needs compilation)

📄 src/modules/production/data/distillation-sessions.data.ts
   └─ Session data in TypeScript

📄 src/modules/production/data/fy2025-distillation-log.data.ts
   └─ FY2025 distillation logs

📄 src/modules/production/data/fy2025-distillation-summary.data.ts
   └─ FY2025 summary data

📄 src/modules/production/data/fy2025-master-summary.data.ts
   └─ Master summary

📄 src/modules/production/data/packaging-items.data.ts
   └─ Packaging items (bottles, labels, caps)
```

---

## Migration Priority Order

### Phase 1: Core Production Data (HIGH PRIORITY)
1. ✅ Rum Production Data (~100 records)
2. ✅ Signature Dry Gin Batches (20 records)
3. ✅ Rainforest Gin Batches (2 records)
4. ✅ General Production Batches (~50 records)

**Total: ~172 production records**

### Phase 2: Business Data (MEDIUM PRIORITY)
5. ✅ Pricing Catalogue (~30 products)
6. ✅ Sales Summary (~100 transactions)

**Total: ~130 business records**

### Phase 3: Supporting Data (LOW PRIORITY)
7. ⏳ TypeScript data files (as needed)
8. ⏳ Packaging items
9. ⏳ Reference data (if not in migrations)

---

## Data Quality Notes

### ✅ Good Quality
- All JSON files are valid and parseable
- Consistent structure within each dataset
- Dates are in ISO format or consistent format
- Numeric values are properly typed

### ⚠️ Needs Attention
- Some duplicate data across files (backups vs. source)
- Different structures for similar data (gin batches)
- Some fields have "-" or "N/A" instead of null
- TypeScript files need compilation before import

### 🔧 Transformations Needed
- Normalize "-" and "N/A" to null
- Convert TypeScript to JSON
- Map nested structures to database schema
- Generate UUIDs for records without IDs
- Set organization_id for all records
- Handle still name normalization (Roberta → Carrie per README)

---

## Verification Checklist

After migration, verify:
- [ ] Record counts match source files
- [ ] No duplicate records (check unique constraints)
- [ ] All foreign keys resolve correctly
- [ ] Date formats are correct
- [ ] Numeric values are within valid ranges
- [ ] Required fields are not null
- [ ] Organization IDs are set correctly
- [ ] RLS policies allow proper access

---

## Backup Strategy

Before migration:
1. ✅ All JSON files already backed up in `scripts/backups/`
2. ✅ Export current local database: `pnpm supabase db dump`
3. ✅ Create git commit with all current state
4. ✅ Document current record counts

After migration:
1. ✅ Export remote database for verification
2. ✅ Keep local database as fallback
3. ✅ Maintain JSON files for 30 days post-migration

---

## Questions for Clarification

1. **Duplicate Data:** Which is the source of truth?
   - Individual batch files OR consolidated backups?
   - JSON files OR TypeScript files?

2. **Missing Data:** Are there any other data sources?
   - Excel files?
   - CSV exports?
   - Other databases?

3. **Data Ownership:** Who created this data?
   - Single user or multiple users?
   - Need to assign to specific organization?

4. **Historical Data:** How far back should we keep?
   - All data from 2021?
   - Only recent data?
   - Archive old data separately?

---

**Last Updated:** November 7, 2025  
**Status:** Ready for migration pending credentials

