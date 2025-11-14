# Tank Constraints Implementation

## Overview

The 2026 production calendar now includes **full tank management** that respects your physical tank constraints and prevents the "infinite tanks" problem.

## Tank Inventory

### Movable Tanks (for Spirit Collection)
These are the ONLY tanks that can be placed under the still to collect hearts:

| Tank ID | Capacity | Has Lid | Can Go Under Still | Role |
|---------|----------|---------|-------------------|------|
| T-400 | 400L | ✅ Yes | ✅ Yes | Spirit collection |
| T-330-A | 330L | ✅ Yes | ✅ Yes | Spirit collection |
| T-330-B | 330L | ✅ Yes | ✅ Yes | Spirit collection |
| T-330-C | 330L | ✅ Yes | ✅ Yes | Spirit collection |
| **TOTAL** | **1,390L** | | | **Usable capacity** |

### Blending Tanks (NOT for Spirit Collection)
These tanks CANNOT be placed under the still:

| Tank ID | Capacity | Has Lid | Can Go Under Still | Role |
|---------|----------|---------|-------------------|------|
| T-1000 | 1000L | ✅ Yes | ❌ No | Blending/bottling only |
| T-615 | 615L | ✅ Yes | ❌ No | Blending/bottling only |
| T-317 | 317L | ❌ No | ✅ Yes | Emergency only (no lid) |

**Important Notes:**
- T-1000 and T-615 are often occupied for **weeks or months** with barrel blends, infusions, coffee liqueur, etc.
- T-317 has no lid and should only be used for emergencies (short-term holding, same day)
- **Only 4 tanks available** for spirit collection: T-400, T-330-A, T-330-B, T-330-C

## Typical Batch Yields

Based on historical batch data, the system uses these typical yields:

| Product Type | Hearts Volume | Hearts ABV | Notes |
|--------------|---------------|------------|-------|
| Gin | 290L | 80% | Typical gin batch (Rainforest, Navy, Signature) |
| Rum | 250L | 75% | Typical rum batch (MM White, MM Dark, Spiced) |
| Vodka | 200L | 96% | Tails processing → neutral spirit |

These can be adjusted in `scripts/generate-2026-production-calendar-v3.ts`:

```typescript
const TYPICAL_YIELDS = {
  GIN_HEARTS_L: 290,
  GIN_HEARTS_ABV: 80,
  RUM_HEARTS_L: 250,
  RUM_HEARTS_ABV: 75,
  VODKA_HEARTS_L: 200,
  VODKA_HEARTS_ABV: 96,
}
```

## Tank Allocation Logic

### How It Works

1. **Track Tank Occupancy**: System maintains a real-time status of all 4 movable tanks
2. **Allocate on Production**: When scheduling a batch, system finds first available tank with enough capacity
3. **Age Tanks**: Each week, increment `weeks_occupied` counter for occupied tanks
4. **Automatic Bottling**: When all 4 tanks are occupied OR every 3 weeks, schedule bottling
5. **Free Tanks**: During bottling weeks, free tanks that have been occupied for 2+ weeks
6. **Prevent Overbooking**: If no tank available, system warns with "NO TANK AVAILABLE ⚠️"

### Example Flow (Weeks 2-6)

```
Week 2: Rainforest → T-400 (290L @ 80%)
  Tanks: T-400 (occupied), T-330-A (free), T-330-B (free), T-330-C (free)

Week 3: MM White Rum → T-330-A (250L @ 75%)
  Tanks: T-400 (occupied, 1 week), T-330-A (occupied), T-330-B (free), T-330-C (free)

Week 4: Navy → T-330-B (290L @ 80%)
  Tanks: T-400 (occupied, 2 weeks), T-330-A (occupied, 1 week), T-330-B (occupied), T-330-C (free)

Week 5: MM White Rum → T-330-C (250L @ 75%)
  Tanks: ALL 4 TANKS NOW OCCUPIED! ⚠️

Week 6: BOTTLING TRIGGERED (all tanks occupied)
  1. Bottle Rainforest from T-400 (290L) → T-400 now FREE
  2. Bottle MM White Rum from T-330-A (250L) → T-330-A now FREE
  3. Bottle Navy from T-330-B (290L) → T-330-B now FREE
  4. THEN: Rainforest batch 2 → T-400 (now free)
```

## Implementation Details

### Data Structures

```typescript
interface TankStatus {
  tank_id: string
  capacity_l: number
  occupied: boolean
  contents?: string
  volume_l?: number
  weeks_occupied?: number
}

interface ProductionRun {
  product: string
  batch_number: number
  total_batches: number
  days: number
  bottles_700ml?: number
  bottles_200ml?: number
  hearts_volume_l?: number
  hearts_abv_percent?: number
  receiving_tank?: string  // NEW: Tank allocation
}

interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  mode: WeekMode
  production_runs: ProductionRun[]
  tails_runs: ProductionRun[]
  cleaning_days: number
  notes: string[]
  tank_allocations?: string[]  // NEW: Tank allocation notes
}
```

### Key Functions

```typescript
// Initialize tanks from tank_inventory.json
function initializeTanks(): TankStatus[]

// Allocate tank for a batch
function allocateTank(tanks: TankStatus[], volumeNeeded: number, productName: string): string | null

// Free all tanks during bottling weeks
function freeTanks(tanks: TankStatus[]): void

// Increment weeks_occupied for all occupied tanks
function ageTanks(tanks: TankStatus[]): void
```

## Benefits

### ✅ Prevents "Infinite Tanks" Problem
- System can only use 4 tanks (T-400, T-330-A, T-330-B, T-330-C)
- Automatically schedules bottling when tanks are full
- Warns if trying to schedule more batches than tank capacity allows

### ✅ Realistic Bottling Schedule
- Bottling happens every 3 weeks OR when all tanks occupied
- Tanks are freed during bottling weeks
- Matches real workflow: bottle → free tank → distill again

### ✅ Tank Allocation Transparency
- Every batch shows which tank receives the hearts
- Volume and ABV tracked for each batch
- Easy to see tank occupancy at any point in the calendar

### ✅ Respects Physical Constraints
- T-1000 and T-615 NOT used for spirit collection (blending only)
- T-317 (no lid) NOT used
- Only 4 tanks available for production

## Viewing Tank Allocations

### In the Dashboard
Visit: http://localhost:3000/dashboard/calendar-2026

Each production week shows:
- Product and batch number
- Bottle counts (700ml, 200ml)
- **Tank allocation** (e.g., "→ T-400 (290L @ 80%)")
- Bottling notes (e.g., "→ Bottling Rainforest from T-400 (290L)")

### In the JSON File
```bash
cat data/production_calendar_2026_v3.json | jq '.calendar[] | select(.production_runs | length > 0) | {week: .week_number, production: (.production_runs | map(.product + " → " + .receiving_tank)), tank_allocations}'
```

## Next Steps

1. ✅ Review tank allocations in the dashboard
2. ⏳ Adjust typical yields if needed (currently: Gin 290L @ 80%, Rum 250L @ 75%)
3. ⏳ Confirm T-1000 and T-615 availability for blending
4. ⏳ Add tank occupancy timeline visualization
5. ⏳ Add alerts when tank capacity is approaching limits

## Files

- **Tank Inventory**: `data/tank_inventory.json`
- **Calendar Script**: `scripts/generate-2026-production-calendar-v3.ts`
- **Calendar Output**: `data/production_calendar_2026_v3.json`
- **Dashboard**: `src/app/dashboard/calendar-2026/page.tsx`
- **Documentation**: `docs/2026-PRODUCTION-CALENDAR-V3-SUMMARY.md`

