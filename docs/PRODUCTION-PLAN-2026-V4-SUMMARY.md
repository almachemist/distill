# 2026 Production Plan V4 - Based on Real Demand Analysis

## Overview

This production plan is based on **actual 2025 sales data** with month-by-month stock simulation, using **real batch yields** from historical production data.

## Key Differences from Previous Plans

### ❌ Previous Plan (V3) Problems:
- Based on static stock levels (didn't simulate month-by-month depletion)
- Didn't account for zero stock on MM Vodka, MM Gin, MM Rums
- Underestimated demand (didn't use actual sales data)
- Treated 700ml and 200ml as separate productions

### ✅ Current Plan (V4) Improvements:
- **Real demand forecasting**: Based on 2025 sales data (+10% growth)
- **Month-by-month simulation**: Shows when stock runs out without production
- **Product families**: 700ml + 200ml combined into single batches
- **Real batch yields**: Uses historical data (e.g., Rainforest = 658x 700ml + 316x 200ml)
- **Seasonality preserved**: Demand varies by month (e.g., Rainforest sells 391 bottles in October!)

## 2026 Demand Summary (from 2025 Sales Data)

| Product | 2025 Sales | 2026 Forecast | Current Stock | Batches Needed |
|---------|------------|---------------|---------------|----------------|
| **Merchant Mae Vodka** | 3,361 | 3,699 | **0** ❌ | **5 batches** |
| **Rainforest Gin** | 1,859 | 2,046 | 477 | **2 batches** |
| **Merchant Mae Gin** | 1,490 | 1,640 | **0** ❌ | **3 batches** |
| **Merchant Mae White Rum** | 1,022 | 1,124 | **0** ❌ | **2 batches** |
| Signature Gin | 587 | 646 | 704 ✅ | 0 batches |
| Navy Gin | 389 | 428 | 534 ✅ | 0 batches |
| Merchant Mae Dark Rum | 373 | 411 | **0** ❌ | **2 batches** |
| Wet Season Gin | 267 | 293 | 617 ✅ | 0 batches |
| Pineapple Rum | 260 | 287 | 616 ✅ | 0 batches |
| Australian Cane Spirit | 249 | 275 | 248 | **1 batch** |
| Spiced Rum | 217 | 240 | 285 ✅ | 0 batches |
| Reserve Cask Rum | 139 | 153 | **0** ❌ | **1 batch** |
| Dry Season Gin | 98 | 108 | 508 ✅ | 0 batches |
| Coffee Liqueur | 74 | 81 | 10 | **1 batch** |

## Production Schedule

### Total: 17 Batches, 11,046 Bottles

#### January 2026 (9 batches)
- **MM Gin**: 2 batches (1,594 bottles)
- **MM Vodka**: 2 batches (1,594 bottles)
- **MM White Rum**: 2 batches (1,170 bottles)
- **MM Dark Rum**: 2 batches (672 bottles)
- **Reserve Cask Rum**: 1 batch (226 bottles)

#### February 2026 (5 batches)
- **Rainforest Gin**: 2 batches (1,948 bottles)
- **MM Gin**: 1 batch (797 bottles)
- **MM Vodka**: 2 batches (1,594 bottles)

#### March 2026 (1 batch)
- **MM Vodka**: 1 batch (797 bottles)

#### June 2026 (1 batch)
- **Coffee Liqueur**: 1 batch (300 bottles)

#### August 2026 (1 batch)
- **Australian Cane Spirit**: 1 batch (354 bottles)

## Stock Projections (End of 2026)

### ✅ Healthy Stock Levels:
- **MM Gin**: 751 bottles (5.5 months)
- **MM Dark Rum**: 261 bottles (7.6 months)
- **Wet Season Gin**: 324 bottles (13.3 months)
- **Dry Season Gin**: 400 bottles (44.4 months)
- **Pineapple Rum**: 329 bottles (13.8 months)
- **Cane Spirit**: 327 bottles (14.3 months)

### ⚠️ Low Stock Levels (Need 2027 Production):
- **MM Vodka**: 286 bottles (0.9 months) - CRITICAL
- **MM White Rum**: 46 bottles (0.5 months) - CRITICAL
- **Rainforest Gin**: 379 bottles (2.2 months) - LOW
- **Signature Gin**: 58 bottles (1.1 months) - LOW
- **Navy Gin**: 106 bottles (3.0 months) - OK
- **Spiced Rum**: 45 bottles (2.3 months) - LOW

## Issues to Address

### 1. Insufficient 2027 Buffer
Several products end 2026 with < 1 month stock:
- **MM Vodka**: Need 1-2 more batches
- **MM White Rum**: Need 1 more batch
- **Signature Gin**: Need 1 batch for early 2027

### 2. Production Timing
All production crammed into Q1 (Jan-Mar):
- Doesn't match "front-load before August" strategy
- Should spread production across Jan-Jul
- Need to consider tank constraints (only 4 movable tanks)

### 3. Gin Rotation
Current plan doesn't respect gin rotation rules:
- Feb has 3 gin batches (2x Rainforest + 1x MM Gin)
- Should alternate: Rainforest → MM Gin → Rainforest

### 4. Tank Constraints
With 9 batches in January, need to verify tank availability:
- Only 4 movable tanks (T-400, T-330-A, T-330-B, T-330-C)
- Need bottling weeks to free tanks
- Should spread production to avoid tank overflow

## Next Steps

1. **Add 2027 buffer batches**:
   - MM Vodka: +2 batches
   - MM White Rum: +1 batch
   - Signature Gin: +1 batch
   - Rainforest Gin: +1 batch

2. **Spread production across Jan-Jul**:
   - Respect gin rotation (never same gin twice)
   - Alternate gin/rum to manage warehouse space
   - Schedule bottling weeks every 3-4 weeks

3. **Integrate with tank management**:
   - Use tank allocation system from V3
   - Ensure no more than 4 batches in tanks simultaneously
   - Schedule bottling to free tanks

4. **Create final calendar**:
   - Week-by-week schedule
   - Tank allocations
   - Bottling weeks
   - Stock projections

## Files

- **Demand Analysis**: `data/demand_and_stock_analysis_2026.json`
- **Production Plan**: `data/production_plan_2026_v4.json`
- **Batch Yields**: `data/bottles_per_batch.json`
- **Scripts**:
  - `scripts/analyze-demand-and-stock-2026.ts` - Demand forecasting
  - `scripts/create-production-plan-2026.ts` - Production planning
  - `scripts/show-stock-comparison-2026.ts` - Stock visualization

