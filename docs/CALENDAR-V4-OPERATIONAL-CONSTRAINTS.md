# 2026 Production Calendar V4 - Operational Constraints

## Overview

Updated the production calendar V4 to include **operational constraints** at the start of the year while maintaining demand-based planning for the rest of the year.

## Key Changes

### 1. Fixed Weeks at Start of Year

**Week 1: Administrative Reset**
- **Mode**: `ADMIN`
- **Activities**: Maintenance, deep cleaning, stocktake, barrel checks
- **Production**: None
- **Rationale**: New Year - no distillation

**Week 2: Reserve Rum - Blending & Selection**
- **Mode**: `RESERVE_RUM_BLEND`
- **Activities**: Barrel selection, tasting, blending premium barrels
- **Production**: Reserve Cask Rum preparation
- **Duration**: Full week dedicated to this process
- **Rationale**: Premium product requires focused attention

**Week 3: Reserve Rum - Manual Bottling**
- **Mode**: `RESERVE_RUM_BOTTLE`
- **Activities**: Slow, careful bottling of premium product
- **Production**: Reserve Cask Rum bottling
- **Duration**: Full week for bottling process
- **Rationale**: Manual bottling is slow and requires care

**Weeks 4-6: Vodka Production**
- **Mode**: `VODKA`
- **Production**: Merchant Mae Vodka (Batches 1, 2, 3 of 6)
- **Tanks**: T-400, T-330-A, T-330-B
- **Rationale**: Build vodka stock early in the year

### 2. Bottling Logic Changes

**Before:**
- Bottling was exclusive weeks (no production)
- Blocked entire week for bottling
- Inefficient use of time

**After:**
- Bottling happens **within production weeks**
- Bottling tasks shown alongside production
- More realistic workflow:
  - Distill during the day
  - Bottle in parallel or on different days
  - Only dedicated bottling weeks when all tanks full

**Implementation:**
```typescript
// Bottling can happen alongside production
if (shouldBottle) {
  bottling = true
  bottlingTasks = occupiedTanks.map(t => `Bottle ${t.contents}`)
  notes.push(`Also bottling: ${occupiedTanks.map(t => t.contents).join(', ')}`)
}
```

### 3. Color Palette - Distillery Aesthetic

**Gin - Beige/Off-white** (`bg-amber-50`)
- Light, botanical, clean
- Reflects the gin aesthetic

**Rum/Cane - Copper** (`bg-orange-100`)
- Warm, metal, distillery
- Reflects brown spirits

**Vodka - Black/Dark** (`bg-stone-900`)
- Pure, clean, neutral
- High contrast for visibility

**Admin/Bottling - Gray** (`bg-stone-200`)
- Industrial, functional
- Low visual weight

**Week 1 - White** (`bg-white`)
- Clean slate, new year
- Minimal visual presence

### 4. Demand-Based Planning Preserved

After week 6, the calendar continues with **demand-based scheduling**:
- Uses production plan V4 (based on 2025 sales data)
- Schedules batches to prevent stockouts
- Prioritizes by demand urgency
- Maintains 1 batch per week constraint

**Batches Scheduled:**
- Week 1-3: Reserve Rum (operational constraint)
- Week 4-6: Vodka x3 (operational constraint)
- Week 7+: Demand-based (Rainforest, MM Gin, MM Rum, etc.)

**Total: 20 batches across the year**

### 5. Calendar Statistics

**Production Weeks**: 19 (37% of year)
- Week 4-6: Vodka (3 batches)
- Week 7+: Demand-based (17 batches)

**Bottling Weeks**: 30 (58% of year)
- Many weeks have bottling alongside production
- Only a few dedicated bottling weeks

**Admin Weeks**: 3 (6% of year)
- Week 1: New Year reset
- Week 2: Reserve Rum blending
- Week 3: Reserve Rum bottling

## Files Modified

### Scripts
- `scripts/generate-2026-production-calendar-v4.ts`
  - Added operational constraints (weeks 1-6)
  - Changed bottling logic (within weeks, not exclusive)
  - Added `bottling_tasks` field
  - Added `RESERVE_RUM_BLEND` and `RESERVE_RUM_BOTTLE` modes

### Dashboard
- `src/app/dashboard/calendar-2026/page.tsx`
  - Updated color palette (copper/black/beige/gray)
  - Added bottling tasks display
  - Special handling for Reserve Rum weeks
  - Special handling for Week 1 (New Year)
  - Updated TypeScript interfaces

### Data
- `data/production_calendar_2026_v4.json`
  - Regenerated with operational constraints
  - Includes bottling tasks
  - 52 weeks with realistic workflow

## User Experience Improvements

1. **Realistic workflow**: Bottling alongside production
2. **Clear priorities**: Fixed weeks at start of year
3. **Professional aesthetic**: Distillery color palette
4. **Better information**: Bottling tasks shown when relevant
5. **Demand-driven**: Still based on actual sales data

## Next Steps (Optional)

1. Add stock projections per week
2. Add hover tooltips for detailed notes
3. Add filtering by product type
4. Add export to PDF/print view
5. Add month-by-month summary view

