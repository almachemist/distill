# December 2025 Production & Batch Number Corrections

## Summary

Added December 2025 production calendar and corrected batch numbering for Merchant Mae White Rum to reflect that Batch 1/3 was produced in December 2025.

## December 2025 Productions

### Week 49 (Dec 1-7): Coffee Liqueur Bottling
- **Priority**: High (holiday season)
- **Type**: Bottling run
- **Notes**: Full week dedicated to bottling Coffee Liqueur for holiday sales

### Week 50 (Dec 8-14): Navy Strength Gin - Small Batch
- **Product**: Navy Strength Gin
- **Batch**: 1/1 (Small batch)
- **Type**: Micro-batch for 200ml bottles only
- **Tank**: T-400
- **Notes**: Special small run, not part of regular production cycle

### Week 51 (Dec 15-21): Merchant Mae White Rum - Batch 1/3
- **Product**: Merchant Mae White Rum
- **Batch**: 1/3
- **Type**: Regular production
- **Tank**: T-330-A
- **Notes**: **This is the first batch of the 2026 production cycle, produced early in December 2025**

### Week 52 (Dec 22-28): Holiday Period
- **Type**: Reduced operations
- **Notes**: Maintenance, cleaning, holiday break

## Impact on 2026 Production Plan

### Merchant Mae White Rum - Batch Numbering Corrected

**BEFORE (Incorrect):**
- 2026 had 3 batches: 1/3, 2/3, 3/3
- Total: 3 batches in 2026

**AFTER (Correct):**
- December 2025: Batch 1/3 ✅
- 2026: Only Batch 2/3 and Batch 3/3 ✅
- Total: 1 batch in Dec 2025 + 2 batches in 2026 = 3 batches total

### Updated Production Schedule

**Merchant Mae White Rum:**
- **Batch 1/3**: December 2025 (Week 51) - COMPLETED
- **Batch 2/3**: April 2026 (Week 17)
- **Batch 3/3**: April 2026 (Week 15)

### Stock Calculation Adjustment

The production planning script now:
1. Adds December 2025 batch (585 bottles) to starting stock for 2026
2. Calculates only 2 additional batches needed for 2026
3. Numbers batches as 2/3 and 3/3 (not 1/3 and 2/3)

**Starting Stock for 2026:**
- November 2025 stock: 0 bottles
- December 2025 production: +585 bottles (Batch 1/3)
- **Total starting stock Jan 1, 2026**: 585 bottles

**2026 Production:**
- Batch 2/3 (Apr): +585 bottles
- Batch 3/3 (Apr): +585 bottles
- **Total 2026 production**: 1,170 bottles

**2026 Demand:** 1,124 bottles

**Ending Stock Dec 31, 2026:** 631 bottles (6.7 months buffer) ✅

## Total Batches Across All Products

**2026 Production Plan:**
- **Total batches**: 19 (reduced from 20)
- **Breakdown**:
  - Gin: 6 batches
  - Rum: 5 batches (reduced from 6 - White Rum now has 2 instead of 3)
  - Vodka: 6 batches
  - Cane Spirit: 1 batch
  - Liqueur: 1 batch

## Files Modified

### Created:
- `scripts/generate-december-2025-calendar.ts` - December 2025 calendar generator
- `data/production_calendar_december_2025.json` - December 2025 calendar output

### Modified:
- `scripts/create-production-plan-2026.ts`:
  - Added special case for White Rum to add December batch to starting stock
  - Added special batch numbering for White Rum (starts at 2 instead of 1)
  - Added `total_batches` field to ProductionBatch interface
  
- `scripts/generate-2026-production-calendar-v4.ts`:
  - Updated to use `batch.total_batches` from production plan
  - Correctly displays "Batch 2/3" and "Batch 3/3" for White Rum

- `data/production_plan_2026_v4.json` - Regenerated with corrections
- `data/production_calendar_2026_v4.json` - Regenerated with corrections

## Verification

✅ December 2025 calendar created with 4 weeks
✅ White Rum Batch 1/3 scheduled for Week 51 (Dec 15-21)
✅ 2026 production plan shows only 2 White Rum batches (2/3 and 3/3)
✅ Batch numbers display correctly in calendar (2/3 and 3/3, not 1/2 and 2/2)
✅ Total batches reduced from 20 to 19
✅ Stock calculations account for December production

## Next Steps

1. ✅ December 2025 calendar created
2. ✅ Batch numbers corrected
3. ⏳ Update dashboard to show December 2025 calendar
4. ⏳ Adjust Q3/Q4 display (minimalist, no bottling weeks)
5. ⏳ Final color palette adjustments

## Notes

**Batch Numbering Philosophy:**
- Batch numbers ALWAYS follow production chronology, not calendar year
- If Batch 1/3 is produced in December 2025, then 2026 starts with Batch 2/3
- This maintains consistency and avoids confusion about "which batch 1"
- The `total_batches` field shows the complete production cycle (e.g., "3" for a 3-batch product)

**Why This Matters:**
- Prevents confusion when looking at historical records
- Makes it clear that December 2025 production is part of the 2026 cycle
- Ensures accurate stock tracking across year boundaries
- Maintains traceability for quality control and compliance

