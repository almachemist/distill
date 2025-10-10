# Connected Inventory for Production + Bottling - Verification Guide

## Overview
This guide provides 3 steps to verify the connected inventory system for production and bottling workflows.

## Prerequisites
1. Supabase local instance running (`pnpm supabase start`)
2. Next.js development server running (`pnpm dev`) 
3. Application accessible at http://localhost:3001

## Step 1: Seed Items (Dev-Only Button)

1. **Navigate to Recipes page**
   - Go to http://localhost:3001/dashboard/recipes
   
2. **Seed Master Inventory**
   - Click the blue "Seed Items (Dev)" button (only visible in development)
   - Confirm success message showing items created/updated
   
3. **Verify in Supabase Studio**
   - Open http://localhost:54323 (Supabase Studio)
   - Navigate to Table Editor → `items`
   - Confirm 13 items exist with categories:
     - `neutral_spirit`: Neutral Grain Spirit, Ethanol (food grade)
     - `other`: Water
     - `packaging_bottle`: 700ml Bottle (clear), 200ml Bottle
     - `packaging_closure`: Bottle Cork, Plastic Lid (tamper), Cap (screw top)
     - `packaging_label`: Label (front), Label (back)
     - `packaging_box`: Gift Box (1 bottle)
     - `packaging_carton`: Carton (6 bottles)
     - `packaging_other`: Shrink Wrap

4. **Create Sample Lots** (Manual step for testing)
   - For testing, manually create some lots in Supabase Studio:
   ```sql
   -- Insert sample lots for testing
   INSERT INTO lots (organization_id, item_id, code, qty, uom, received_date, note) 
   SELECT 
     (SELECT organization_id FROM profiles LIMIT 1),
     (SELECT id FROM items WHERE name = 'Neutral Grain Spirit' LIMIT 1),
     'NGS-001',
     500.0,
     'L',
     '2024-01-15',
     'Test lot for verification'
   WHERE EXISTS (SELECT 1 FROM items WHERE name = 'Neutral Grain Spirit');
   
   -- Create RECEIVE transaction
   INSERT INTO inventory_txns (dt, txn_type, item_id, lot_id, quantity, uom, note)
   SELECT 
     now(),
     'RECEIVE',
     l.item_id,
     l.id,
     l.qty,
     l.uom,
     'Initial receipt for testing'
   FROM lots l 
   WHERE l.code = 'NGS-001';
   ```

## Step 2: Start Gin Batch

1. **Navigate to Start Batch page**
   - Go to http://localhost:3001/dashboard/production/start-batch
   - OR from Recipes page: click a recipe → "Start Batch" button
   
2. **Configure Batch**
   - Set batch target (e.g., 100L)
   - Verify scaled quantities are calculated correctly
   
3. **Select Lots for Ingredients**
   - For each ingredient (ethanol + botanicals):
     - Verify available lots are shown with on-hand quantities
     - Use "Auto-allocate (FIFO)" or manually select lots
     - Ensure total allocated matches required quantity
   
4. **Confirm Batch**
   - Click "Confirm & Start Batch"
   - Verify success redirect to batch summary page
   
5. **Verify CONSUME Transactions**
   - Open Supabase Studio → `inventory_txns` table
   - Confirm new `CONSUME` rows were created:
     - One row per ingredient-lot combination
     - Correct quantities and UOMs
     - Note includes batch information
     - `dt` timestamp is recent

## Step 3: Bottling Run

1. **Navigate to Bottling Run page**
   - Go to http://localhost:3001/dashboard/production/bottling
   
2. **Configure Bottling Run**
   - Set source tank (e.g., "Tank-001")
   - Choose unit size (700ml or 200ml)
   - Set run size (e.g., 100 units)
   - Select closure type (cork or cap)
   - Toggle cartons on/off
   
3. **Verify Auto-Calculated Packaging Needs**
   - Bottles: should equal run size
   - Closures: should equal run size (cork OR cap based on selection)
   - Labels (front): should equal run size
   - Labels (back): should equal run size
   - Cartons: should equal ceil(run_size / 6) if enabled
   
4. **Allocate Packaging Lots**
   - For each packaging category:
     - Verify lots are available with stock levels
     - Use lot picker to allocate exact quantities
     - Ensure all required items are fully allocated
   
5. **Confirm Bottling Run**
   - Click "Confirm & Start Bottling"
   - Verify success redirect to bottling summary page
   
6. **Verify CONSUME Transactions**
   - Open Supabase Studio → `inventory_txns` table
   - Confirm new `CONSUME` rows for packaging:
     - Bottles, closures, labels, cartons (if used)
     - Correct quantities based on run size
     - Note includes bottling run information

## Additional Verification

### Stock Level Validation
1. **Check Inventory Page**
   - Go to http://localhost:3001/dashboard/inventory
   - Verify stock levels are updated after consumption
   - Click items to see lot details and transaction history

### Negative Stock Prevention
1. **Try Over-Consuming**
   - Attempt to start a batch/bottling run that requires more stock than available
   - Verify error message prevents transaction
   - Confirm no partial transactions are created

### Transaction Integrity
1. **Verify Batch Transactions**
   - All CONSUME transactions should have same timestamp (batch operation)
   - All transactions should include descriptive notes
   - Lot quantities should be reduced correctly

## Expected Results

✅ **Items seeded successfully** - 13 master inventory items created
✅ **Gin batch started** - Ethanol + botanical consumption tracked
✅ **Bottling run completed** - Packaging material consumption tracked  
✅ **Stock levels updated** - Real-time inventory reflects consumption
✅ **Negative stock prevented** - Cannot over-consume available stock
✅ **Audit trail complete** - All transactions logged with timestamps and notes

## Troubleshooting

**Issue: Seed button not visible**
- Ensure `NODE_ENV=development` in environment
- Check console for any errors

**Issue: No lots available for allocation**
- Manually create lots in Supabase Studio with RECEIVE transactions
- Ensure lots have positive stock levels

**Issue: Transaction fails**
- Check Supabase Studio for RLS policy errors
- Verify user has proper organization assignment
- Check browser console for detailed error messages

**Issue: Stock levels not updating**
- Verify `inventory_txns` table has new CONSUME rows
- Check transaction types and quantities are correct
- Refresh inventory page to see updated levels








