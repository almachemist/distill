# 2026 Production Plan - FINAL (With 2027 Buffer)

**Generated:** 2025-11-13  
**Based on:** Real 2025 sales data (2,494 records) + Historical batch yields

---

## Executive Summary

### Total Production Required: **20 batches, 13,531 bottles**

| Type | Batches | Bottles |
|------|---------|---------|
| **Gin** | 6 batches | 5,545 bottles |
| **Vodka** | 6 batches | 4,782 bottles |
| **Rum** | 6 batches | 2,493 bottles |
| **Cane Spirit** | 1 batch | 354 bottles |
| **Liqueur** | 1 batch | 300 bottles |

### Production Timeline: **Jan-Jul 2026** (Front-loaded before August)

- **Jan**: 8 batches (2 Gin, 3 Vodka, 3 Rum)
- **Feb**: 6 batches (2 Gin, 2 Vodka, 2 Rum)
- **Mar**: 1 batch (1 Gin)
- **Apr**: 3 batches (1 Gin, 1 Vodka, 1 Rum)
- **Jun**: 1 batch (1 Liqueur)
- **Jul**: 1 batch (1 Cane Spirit)

---

## Key Improvements vs Previous Plan

### ❌ Previous Plan (V3):
- **17 batches** based on static stock levels
- Didn't account for zero stock on MM Vodka, MM Gin, MM Rums
- All production crammed into Jan-Mar
- No 2027 buffer consideration

### ✅ Final Plan (V4):
- **20 batches** based on real demand + 2027 buffer
- Accounts for zero stock on critical products
- Production spread across Jan-Jul (front-loaded)
- Includes 3 buffer batches for healthy 2027 start:
  - MM Vodka: +1 batch (ends at 3.5 months stock)
  - MM White Rum: +1 batch (ends at 6.7 months stock)
  - Signature Gin: +1 batch (ends at 21.6 months stock)

---

## Production Schedule by Month

### January 2026 (8 batches)
| Product | Batches | Bottles | Type |
|---------|---------|---------|------|
| MM Vodka | 3 | 2,391 | VODKA |
| MM Gin | 2 | 1,594 | GIN |
| MM White Rum | 1 | 585 | RUM |
| MM Dark Rum | 1 | 336 | RUM |
| Reserve Cask Rum | 1 | 226 | RUM |

### February 2026 (6 batches)
| Product | Batches | Bottles | Type |
|---------|---------|---------|------|
| MM Vodka | 2 | 1,594 | VODKA |
| Rainforest Gin | 1 | 974 | GIN |
| MM Gin | 1 | 797 | GIN |
| MM White Rum | 1 | 585 | RUM |
| MM Dark Rum | 1 | 336 | RUM |

### March 2026 (1 batch)
| Product | Batches | Bottles | Type |
|---------|---------|---------|------|
| Rainforest Gin | 1 | 974 | GIN |

### April 2026 (3 batches)
| Product | Batches | Bottles | Type |
|---------|---------|---------|------|
| Signature Gin | 1 | 1,103 | GIN (2027 buffer) |
| MM Vodka | 1 | 797 | VODKA (2027 buffer) |
| MM White Rum | 1 | 585 | RUM (2027 buffer) |

### June 2026 (1 batch)
| Product | Batches | Bottles | Type |
|---------|---------|---------|------|
| Coffee Liqueur | 1 | 300 | LIQUEUR |

### July 2026 (1 batch)
| Product | Batches | Bottles | Type |
|---------|---------|---------|------|
| Australian Cane Spirit | 1 | 354 | CANE_SPIRIT |

---

## Stock Projections (End of 2026)

### ✅ Healthy Stock Levels (3+ months):
| Product | End Stock | Months | Status |
|---------|-----------|--------|--------|
| **Signature Gin** | 1,161 bottles | 21.6 months | ✅ Excellent |
| **Cane Spirit** | 327 bottles | 14.3 months | ✅ Excellent |
| **Wet Season Gin** | 324 bottles | 13.3 months | ✅ Excellent |
| **Pineapple Rum** | 329 bottles | 13.8 months | ✅ Excellent |
| **MM Dark Rum** | 261 bottles | 7.6 months | ✅ Good |
| **MM White Rum** | 631 bottles | 6.7 months | ✅ Good |
| **MM Gin** | 751 bottles | 5.5 months | ✅ Good |
| **MM Vodka** | 1,083 bottles | 3.5 months | ✅ OK |
| **Navy Gin** | 106 bottles | 3.0 months | ✅ OK |

### ⚠️ Low Stock (Need Early 2027 Production):
| Product | End Stock | Months | Status |
|---------|-----------|--------|--------|
| **Rainforest Gin** | 379 bottles | 2.2 months | ⚠️ Plan for Feb 2027 |
| **Spiced Rum** | 45 bottles | 2.3 months | ⚠️ Plan for Feb 2027 |

---

## 2026 Demand Analysis (from 2025 Sales)

| Product | 2025 Sales | 2026 Forecast | Current Stock | Gap |
|---------|------------|---------------|---------------|-----|
| **MM Vodka** | 3,361 | 3,699 | 0 ❌ | -3,699 |
| **Rainforest Gin** | 1,859 | 2,046 | 477 | -1,569 |
| **MM Gin** | 1,490 | 1,640 | 0 ❌ | -1,640 |
| **MM White Rum** | 1,022 | 1,124 | 0 ❌ | -1,124 |
| Signature Gin | 587 | 646 | 704 ✅ | +58 |
| Navy Gin | 389 | 428 | 534 ✅ | +106 |
| MM Dark Rum | 373 | 411 | 0 ❌ | -411 |

---

## Next Steps

### 1. Integrate with Calendar Generator
- Update `scripts/generate-2026-production-calendar-v3.ts` to use this production plan
- Respect tank constraints (only 4 movable tanks)
- Implement gin rotation (Rainforest → MM Gin → Signature → Rainforest)
- Schedule bottling weeks every 3-4 weeks to free tanks

### 2. Validate Against Constraints
- **Tank capacity**: Max 4 batches in tanks simultaneously
- **Warehouse space**: 1 pallet per product (576 bottles), 2 for MM Gin/Vodka (1,152 bottles)
- **Gin rotation**: Never same gin twice in a row
- **Cane Spirit**: Only after August (✅ scheduled for July)

### 3. Create Dashboard
- Build `/dashboard/production-plan-2026` page
- Show month-by-month stock projections
- Highlight stockout risks
- Display production schedule with tank allocations

---

## Files

- **Production Plan**: `data/production_plan_2026_v4.json`
- **Demand Analysis**: `data/demand_and_stock_analysis_2026.json`
- **Batch Yields**: `data/bottles_per_batch.json`
- **Scripts**:
  - `scripts/analyze-demand-and-stock-2026.ts`
  - `scripts/create-production-plan-2026.ts`
  - `scripts/show-stock-comparison-2026.ts`

