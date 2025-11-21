# Production-Inventory Integration

## Overview

Complete integration between production batches and inventory management system. Every production batch now automatically tracks materials used, deducts from inventory, records costs, and maintains full traceability for compliance (excise, HACCP).

## Database Schema

### Tables Created

1. **batch_materials** - Links batches to ethanol/water/materials from inventory
   - Tracks: item_id, quantity_l, ABV, cost, supplier, lot_number, invoice_reference
   - Foreign key to `items` table

2. **batch_botanicals** - Links batches to botanical ingredients
   - Tracks: item_id, quantity_g, cost_per_kg, supplier, lot_number, expiry_date
   - Foreign key to `items` table

3. **batch_packaging** - Links batches to packaging materials
   - Tracks: item_id, packaging_type, quantity_used, cost, supplier, lot_number
   - Types: bottle, closure, label, carton, gift_box, other

4. **inventory_movements** - Tracks all stock IN/OUT movements
   - Records: item_id, movement_type (IN/OUT/ADJUSTMENT), quantity_change, unit
   - Links to batch: reference_type='batch', reference_id=batch_id
   - Tracks: cost, supplier, invoice_reference, created_by

5. **batch_costs** - Calculated cost summaries per batch
   - Breakdown: ethanol_cost, botanical_cost, packaging_cost, other_materials_cost
   - Totals: total_cost, cost_per_liter, cost_per_bottle

## UI Components

### 1. EthanolBatchSelector
**Location:** `src/modules/production/components/EthanolBatchSelector.tsx`

**Features:**
- Real-time lookup of ethanol batches from inventory
- Shows: ABV, available quantity, cost per liter, supplier, lot number
- Validates sufficient stock before allowing selection
- Calculates total cost automatically
- Displays batch details (supplier, lot number, expiry date)
- Warning when insufficient stock

**Usage:**
```tsx
<EthanolBatchSelector
  value={ethanolSelection}
  onChange={setEthanolSelection}
  requiredQuantity={500}
/>
```

### 2. BotanicalSelector
**Location:** `src/modules/production/components/BotanicalSelector.tsx`

**Features:**
- Dynamic list populated from inventory → botanicals category
- Add/remove multiple botanicals
- For each botanical: name, quantity (g), cost, supplier, lot number
- Shows expiry dates
- Validates stock availability
- Calculates total botanical cost
- Summary: total botanicals, total weight, total cost

**Usage:**
```tsx
<BotanicalSelector
  selections={botanicals}
  onChange={setBotanicals}
/>
```

### 3. PackagingSelector
**Location:** `src/modules/production/components/PackagingSelector.tsx`

**Features:**
- Select packaging by type: bottles, closures, labels, cartons, gift boxes
- Dynamic item list filtered by packaging type
- Add/remove multiple packaging items
- Tracks: item, quantity, cost, supplier, lot number
- Validates stock availability
- Calculates total packaging cost
- Summary: total items, total units, total cost

**Usage:**
```tsx
<PackagingSelector
  selections={packaging}
  onChange={setPackaging}
/>
```

## Services

### InventoryIntegrationService
**Location:** `src/modules/production/services/inventory-integration.service.ts`

**Methods:**

1. **saveBatchMaterials(input)** - Save ethanol/water and deduct from inventory
2. **saveBatchBotanicals(input)** - Save botanicals and deduct from inventory
3. **saveBatchPackaging(input)** - Save packaging and deduct from inventory
4. **calculateBatchCosts(org_id, batch_id, batch_type)** - Calculate total batch cost
5. **createInventoryMovement(movement)** - Create movement record (private)
6. **deductFromInventory(item_id, quantity)** - FIFO deduction logic (private)

**FIFO Logic:**
- Deducts from oldest lots first (by received_date)
- Updates lot quantities automatically
- Warns if insufficient inventory

## API Endpoints

### POST /api/production/batches-with-inventory
**Location:** `src/app/api/production/batches-with-inventory/route.ts`

**Request Body:**
```json
{
  "batch_id": "SPIRIT-GIN-RF-031",
  "batch_type": "gin",
  "product_name": "Rainforest Gin",
  "date": "2025-11-21",
  "still_used": "Carrie",
  "notes": "Batch notes",
  "ethanol": {
    "inventory_item_id": "uuid",
    "item_name": "Ethanol 96%",
    "quantity_l": 500,
    "abv": 96,
    "cost_per_unit": 4.86,
    "total_cost": 2430,
    "supplier": "Manildra Group",
    "lot_number": "133809"
  },
  "water_quantity_l": 500,
  "botanicals": [...],
  "packaging": [...],
  "created_by": "user_id",
  "organization_id": "org_id"
}
```

**Response:**
```json
{
  "success": true,
  "batch_id": "SPIRIT-GIN-RF-031",
  "total_cost": 2650.50,
  "message": "Batch created successfully with inventory integration"
}
```

**Process:**
1. Validates required fields
2. Saves batch materials → deducts ethanol from inventory
3. Saves batch botanicals → deducts from inventory
4. Saves batch packaging → deducts from inventory
5. Creates inventory movement records for all items
6. Calculates and saves batch costs
7. Returns success with total cost

## Integration Points

### Start Batch Page
**Location:** `src/app/dashboard/production/start-batch/page.tsx`

**Changes:**
- Replaced simple ethanol inputs with `EthanolBatchSelector`
- Added `BotanicalSelector` (for gin batches)
- Added `PackagingSelector` (optional for all batches)
- Shows real-time cost calculations in summary
- Displays cost breakdown (ethanol + botanicals + packaging)
- Calls `/api/production/batches-with-inventory` on submit
- Validates ethanol selection before allowing submission

## Benefits

### 1. Full Traceability
- Every batch linked to specific inventory lots
- Track supplier, invoice, lot number for all materials
- Compliance ready (excise, HACCP, food safety)

### 2. Automatic Inventory Management
- No manual inventory adjustments needed
- FIFO deduction ensures oldest stock used first
- Real-time stock levels

### 3. Accurate Costing
- Automatic cost calculation per batch
- Cost breakdown by material type
- Cost per liter and cost per bottle metrics

### 4. Production Planning
- See available inventory before creating batches
- Warnings when stock is low
- Prevent over-consumption of stock

### 5. Supplier Tracking
- Know which supplier provided materials for each batch
- Track invoice references
- Expiry date tracking for botanicals

## Future Enhancements

1. **Batch Recall** - If batch needs to be deleted, reverse inventory movements
2. **Cost Analysis** - Compare batch costs over time, identify cost trends
3. **Supplier Performance** - Track which suppliers provide best quality/price
4. **Inventory Forecasting** - Predict when to reorder based on production schedule
5. **Multi-organization Support** - Currently uses hardcoded org_id
6. **User Authentication** - Get user_id from auth session instead of hardcoded value

