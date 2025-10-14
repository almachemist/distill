# Rainforest Gin & Signature Dry Gin - Verification Guide

## Overview
This guide verifies both Rainforest Gin (42%) and Signature Dry Gin (Traditional) recipes with proper scaling, LAL conservation, and inventory consumption.

## Prerequisites
1. ✅ Supabase local instance running (`pnpm supabase start`)
2. ✅ Next.js development server running (`pnpm dev`) on http://localhost:3001
3. ✅ User authenticated in the application

## Recipe Specifications

### Rainforest Gin (42%)
- **Baseline**: 546L @ 42% ABV
- **LAL**: 229.6L (from 280L @ 82%)
- **Pre-proof charge**: 280L Ethanol 82%
- **Proofing water**: 266L
- **Botanicals**: 14 varieties in grams

### Signature Dry Gin (Traditional)
- **Baseline**: 495L @ 42% ABV  
- **LAL**: 207.95L (from 258L @ 80.6%)
- **Pre-proof charge**: 258L Ethanol 80.6%
- **Proofing water**: 237L
- **Botanicals**: 11 varieties in grams

## 3-Step Verification Process

### Step 1: Seed Both Recipes

1. **Navigate to Recipes page**
   - Go to http://localhost:3001/dashboard/recipes

2. **Seed items and recipes** (order matters)
   a. Click **"Seed Items (Dev)"** - creates base items including ethanol varieties
   b. Click **"Seed Rainforest Gin"** - creates Rainforest Gin recipe with 82% ethanol
   c. Click **"Seed Signature Gin"** - creates Signature Gin recipe with 80.6% ethanol

3. **Verify seeding results**
   - Each button should show success message with counts
   - Recipes list should show both new gin recipes
   - Check Supabase Studio at http://localhost:54323:
     - `items` table: Should have both ethanol types and all botanicals
     - `recipes` table: Should have both gin recipes
     - `recipe_ingredients` table: Should have all ingredients for both recipes

### Step 2: Test Rainforest Gin Scaling & Production

1. **Open Rainforest Gin recipe**
   - Click "Rainforest Gin (42%)" from recipes list
   - Verify **Recipe Base Size shows "546 L"**
   - Verify **Target Batch Size defaults to 546L**

2. **Test scaling calculations**
   - Change target to **273L** (half batch)
   - Verify **Scale Factor shows "0.50x"**
   - Verify ingredients scale proportionally:
     - Ethanol 82%: 280L → 140L
     - Juniper: 6360g → 3180g
     - Water: 266L → 133L

3. **Test LAL conservation warning**
   - Enter target **600L** (larger than baseline)
   - Should show **yellow LAL warning banner**
   - Warning should mention expected vs actual LAL difference

4. **Start production batch**
   - Set target back to **546L** (baseline)
   - Click **"Start Batch"**
   - Verify redirect to production start page with correct recipe and target

5. **Test lot allocation** (requires sample lots)
   - For each ingredient, verify lot picker shows available lots
   - Use **"Auto-allocate (FIFO)"** or manually select lots
   - Ensure all ingredients show **green completion status**
   - Click **"Confirm & Start Batch"**

6. **Verify inventory consumption**
   - Check success redirect to batch summary
   - In Supabase Studio → `inventory_txns` table:
     - Should have CONSUME rows for all ingredients
     - Quantities should match scaled amounts
     - Notes should reference the production order

### Step 3: Test Signature Dry Gin Production

1. **Open Signature Dry Gin recipe**
   - Click "Signature Dry Gin (Traditional)" from recipes list
   - Verify **Recipe Base Size shows "495 L"**
   - Verify **Target Batch Size defaults to 495L**

2. **Test different baseline scaling**
   - Change target to **742.5L** (1.5x batch)
   - Verify **Scale Factor shows "1.50x"**
   - Verify ingredients scale with different baseline:
     - Ethanol 80.6%: 258L → 387L
     - Juniper: 6400g → 9600g
     - Water: 237L → 355.5L

3. **Test LAL conservation for different ethanol**
   - Enter target **550L**
   - Should show **yellow LAL warning banner**
   - Calculation: Expected LAL = 550 × 0.42 = 231L
   - Actual LAL = 207.95 × (550/495) = 231.1L
   - Should show minimal difference due to different ethanol strength

4. **Complete production flow**
   - Set target to **495L** (baseline)
   - Click **"Start Batch"** → Start production
   - Allocate lots for all ingredients including **Ethanol 80.6%**
   - Confirm and verify CONSUME transactions

## Expected Database Changes

### Items Table
Should contain all these items with correct properties:
```
| Name              | Category  | UOM | Is_Alcohol | ABV_PCT |
|-------------------|-----------|-----|------------|---------|
| Ethanol 82%       | spirit    | L   | true       | 82.0    |
| Ethanol 80.6%     | spirit    | L   | true       | 80.6    |
| Water             | other     | L   | false      | null    |
| Juniper           | botanical | g   | false      | null    |
| Coriander         | botanical | g   | false      | null    |
| [... all botanicals] | botanical | g | false    | null    |
```

### Recipe_Ingredients Table (Sample)
```
| Recipe Name              | Step       | Item          | Qty  | UOM |
|--------------------------|------------|---------------|------|-----|
| Rainforest Gin (42%)     | maceration | Ethanol 82%   | 280  | L   |
| Rainforest Gin (42%)     | proofing   | Water         | 266  | L   |
| Signature Dry Gin (Traditional) | maceration | Ethanol 80.6% | 258 | L   |
| Signature Dry Gin (Traditional) | proofing   | Water         | 237 | L   |
```

### Inventory_Txns Table (After Production)
```
| TXN_Type | Item_ID       | Quantity | UOM | Note                     |
|----------|---------------|----------|-----|--------------------------|
| CONSUME  | [ethanol_id]  | 280.0    | L   | Gin batch production...  |
| CONSUME  | [juniper_id]  | 6360.0   | g   | Gin batch production...  |
| CONSUME  | [water_id]    | 266.0    | L   | Gin batch production...  |
```

## Validation Checks

### ✅ Recipe Scaling
- [ ] Rainforest Gin defaults to 546L baseline
- [ ] Signature Gin defaults to 495L baseline  
- [ ] Scale factor calculation: target ÷ baseline
- [ ] All ingredient quantities scale proportionally
- [ ] UOMs remain unchanged during scaling

### ✅ LAL Conservation
- [ ] Warning appears when LAL difference > 1% of target volume
- [ ] Rainforest: 229.6L × scale vs (target × 0.42)
- [ ] Signature: 207.95L × scale vs (target × 0.42)
- [ ] Warning is soft (doesn't block production)

### ✅ Inventory Integration
- [ ] All ingredients appear in lot picker
- [ ] Auto-allocation works (FIFO)
- [ ] Manual lot selection allows splitting
- [ ] Negative stock prevention works
- [ ] CONSUME transactions created with correct quantities

### ✅ UI/UX Flow
- [ ] Recipe base size displays correctly per recipe
- [ ] Batch target input accepts decimal values
- [ ] Real-time scaling calculation updates
- [ ] Production start inherits correct batch size
- [ ] Success flow redirects properly

## Troubleshooting

**Issue: Seed buttons not visible**
- Ensure you're in development mode (`NODE_ENV=development`)

**Issue: LAL warnings not appearing**
- Check recipe names contain "Rainforest Gin" or "Signature Dry Gin"
- Verify target volumes trigger >1% tolerance

**Issue: Lot allocation fails**
- Ensure sample lots exist with positive stock
- Check `inventory_txns` table for RECEIVE transactions

**Issue: Different ethanol types not distinguished**
- Verify both "Ethanol 82%" and "Ethanol 80.6%" items exist
- Check recipes reference correct ethanol types by name

## Success Criteria

🎯 **Complete Success**: Both recipes can be seeded, scaled with correct baselines, show appropriate LAL warnings, and complete full production workflows with proper inventory consumption tracking.

The system now supports multiple gin recipes with:
- ✅ Recipe-specific baselines (546L vs 495L)
- ✅ Multiple ethanol strengths (82% vs 80.6%)
- ✅ Accurate LAL conservation warnings
- ✅ Complete ingredient scaling and allocation
- ✅ Full inventory tracking and consumption










