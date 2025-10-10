# Six Gin Recipes Verification Guide

This guide verifies the complete gin recipe system with all six recipe variants, each with unique scaling factors, LAL conservation checks, and production workflows.

## Recipe Specifications Summary

| Recipe | Baseline Volume | Target ABV | Ethanol | Baseline LAL | Unique Features |
|--------|----------------|------------|---------|---------------|-----------------|
| Rainforest Gin (42%) | 546L | 42% | 280L @ 82% | 229.6 LAL | Australian botanicals |
| Signature Dry Gin (42%) | 495L | 42% | 258L @ 80.6% | 207.95 LAL | Traditional profile |
| Navy Strength Gin | 426L | 58.9% | 306L @ 82% | 250.92 LAL | High proof spirit |
| MM Gin (Merchant Mae) | 729L | 37.5% | 332L @ 82% | 272.24 LAL | Lower proof, larger batch |
| Dry Season Gin (40%) | 404L | 40% | 199L @ 81.4% | 161.986 LAL | Asian-inspired botanicals |
| Wet Season Gin (42%) | 485L | 42% | 251L @ 81.3% | 203.96 LAL | Wet season botanicals |

## Prerequisites

1. **Supabase Running**: Ensure local Supabase is running with `supabase start`
2. **Next.js Dev Server**: Server should be running on port 3000 (`pnpm dev`)
3. **Authentication**: User logged in with organization access
4. **Base Inventory**: Some initial lots created for testing consumption

## Verification Steps

### Step 1: Seed All Six Gin Recipes

1. Navigate to **Recipes** page (`http://localhost:3000/dashboard/recipes`)
2. Look for development seed buttons (visible in development mode)
3. Click each seed button in sequence:
   - **"Seed Items (Dev)"** - Creates base inventory items
   - **"Seed Rainforest Gin Recipe"** (purple button)
   - **"Seed Signature Gin"** (indigo button) 
   - **"Seed Navy Gin"** (slate button)
   - **"Seed MM Gin"** (amber button)
   - **"Seed Dry Season Gin"** (orange button)
   - **"Seed Wet Season Gin"** (teal button)

**Expected Results:**
- Each seed operation shows success alert with items created/updated
- Recipe list displays all 6 gin recipes
- Each recipe has unique ingredient profiles

### Step 2: Verify Scaling Logic for Each Recipe

Test each recipe's scaling logic and LAL conservation:

#### 2.1 Rainforest Gin (42%) - 546L Baseline
1. Click on **"Rainforest Gin (42%)"**
2. Verify default **"Target Final Volume"** = 546L
3. Change to **1092L** (2x scale)
4. Verify ingredients scale by 2x:
   - Ethanol 82%: 560L (280L × 2)
   - Juniper: 12,720g (6,360g × 2)
   - Water: 532L (266L × 2)
5. **LAL Check**: Should show **no warning** (perfect 2x scale)
6. Try **500L** - should show **LAL warning** (not proportional)

#### 2.2 Signature Dry Gin (42%) - 495L Baseline  
1. Click on **"Signature Dry Gin (Traditional)"**
2. Verify default **"Target Final Volume"** = 495L
3. Change to **990L** (2x scale)
4. Verify ingredients scale by 2x:
   - Ethanol 80.6%: 516L (258L × 2)
   - Water: 474L (237L × 2)
5. **LAL Check**: Should show **no warning**

#### 2.3 Navy Strength Gin - 426L Baseline
1. Click on **"Navy Strength Gin"**
2. Verify default **"Target Final Volume"** = 426L  
3. Change to **852L** (2x scale)
4. Verify target ABV shows **58.9%**
5. **LAL Check**: Should show **no warning** at 2x scale

#### 2.4 MM Gin (Merchant Mae) - 729L Baseline
1. Click on **"MM Gin"**
2. Verify default **"Target Final Volume"** = 729L
3. Change to **1458L** (2x scale)
4. Verify target ABV shows **37.5%**
5. **LAL Check**: Should show **no warning** at 2x scale

#### 2.5 Dry Season Gin (40%) - 404L Baseline
1. Click on **"Dry Season Gin (40%)"**
2. Verify default **"Target Final Volume"** = 404L
3. Change to **808L** (2x scale)  
4. Verify target ABV shows **40%**
5. Verify unique Asian botanicals:
   - Lemongrass: 2,334g (1,167g × 2)
   - Thai Basil: 2,000g (1,000g × 2)
   - Kaffir Lime Leaf: 666g (333g × 2)
6. **LAL Check**: Should show **no warning** at 2x scale

#### 2.6 Wet Season Gin (42%) - 485L Baseline
1. Click on **"Wet Season Gin (42%)"**
2. Verify default **"Target Final Volume"** = 485L
3. Change to **970L** (2x scale)
4. Verify target ABV shows **42%**
5. Verify unique wet season botanicals:
   - Sawtooth Coriander: 1,250g (625g × 2)
   - Kaffir Fruit Rind: 1,664g (832g × 2)
   - Thai Marigolds: 664g (332g × 2)
   - Pandanus: 216g (108g × 2)
6. **LAL Check**: Should show **no warning** at 2x scale

### Step 3: Test Production Order Creation

For each recipe, test the complete production workflow:

#### 3.1 Start Batch Flow
1. From recipe detail, click **"Start Batch"**
2. Verify recipe and target volume carry over correctly
3. Verify ingredient list shows:
   - **All ingredients** (ethanol, botanicals, water)
   - **Scaled quantities** matching recipe detail
   - **Available lots** for each ingredient
   - **Stock sufficiency** indicators

#### 3.2 Lot Selection & Consumption  
1. For each ingredient, select lots (can split across multiple lots)
2. Verify total selected quantity ≥ required quantity
3. Click **"Confirm Production"**
4. **Expected**: Success message with production order creation

#### 3.3 Verify Database Impact
Check Supabase database for changes:

```sql
-- Check new production order created
SELECT * FROM production_orders ORDER BY created_at DESC LIMIT 1;

-- Check inventory transactions created
SELECT it.*, i.name as item_name, l.code as lot_code
FROM inventory_txns it
JOIN items i ON it.item_id = i.id  
JOIN lots l ON it.lot_id = l.id
WHERE it.txn_type = 'CONSUME'
ORDER BY it.created_at DESC;

-- Verify stock levels decreased
SELECT i.name, l.code, 
  COALESCE(SUM(CASE WHEN it.txn_type IN ('RECEIVE', 'PRODUCE') THEN it.qty
                   WHEN it.txn_type IN ('CONSUME', 'TRANSFER', 'DESTROY') THEN -it.qty
                   ELSE it.qty END), 0) as current_stock
FROM items i
LEFT JOIN lots l ON i.id = l.item_id
LEFT JOIN inventory_txns it ON l.id = it.lot_id
GROUP BY i.id, i.name, l.id, l.code
HAVING current_stock > 0
ORDER BY i.name, l.code;
```

### Step 4: Cross-Recipe Validation

1. **Navigation**: Verify all recipes accessible from main menu
2. **Consistency**: Each recipe maintains its unique baseline when navigating between them
3. **Performance**: Page loads and calculations respond quickly
4. **Error Handling**: Attempting to consume more than available stock shows appropriate warnings

## Success Criteria

✅ **All 6 recipes** seed successfully with unique ingredients  
✅ **Scaling calculations** work correctly for each baseline (546L, 495L, 426L, 729L, 404L, 485L)  
✅ **LAL conservation checks** trigger warnings appropriately  
✅ **Target ABV display** shows correct percentages (42%, 58.9%, 37.5%, 40%, 42%)  
✅ **Production orders** create successfully with proper lot selection  
✅ **Inventory transactions** post correctly with `CONSUME` type  
✅ **Stock levels** decrease accurately after consumption  
✅ **Navigation** works smoothly between all recipe types  

## Troubleshooting

**Issue**: Recipe doesn't appear after seeding  
**Solution**: Refresh page or check browser console for errors

**Issue**: LAL warnings appear unexpectedly  
**Solution**: Verify baseline calculations match recipe specifications

**Issue**: Stock consumption fails  
**Solution**: Ensure sufficient inventory lots exist with positive quantities

**Issue**: Scaling shows wrong quantities  
**Solution**: Check recipe baseline recognition in component logic

## Files Modified

- `src/modules/recipes/services/dry-season-gin-seed.service.ts` - New service for Dry Season Gin
- `src/modules/recipes/services/wet-season-gin-seed.service.ts` - New service for Wet Season Gin
- `src/modules/recipes/components/RecipesList.tsx` - Added seed buttons for Dry Season and Wet Season Gin  
- `src/modules/recipes/components/RecipeDetail.tsx` - Added scaling logic for both new recipes (404L/40% and 485L/42%)
- `src/modules/production/components/StartGinBatch.tsx` - Added scaling logic for both new recipes

This verification confirms the complete gin recipe system handles all six unique recipes with proper scaling, LAL conservation, and production workflows.
