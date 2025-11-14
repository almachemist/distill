# 📊 Instructions for Importing 2025 Sales Data

## ✅ Current Status
- ✅ Files cleaned and ready to receive new data
- ✅ Example structure included in each file
- ✅ Planning system ready to process the data

---

## 📁 Files to Update

### 1. `pricing_catalogue_2025.json`
**Location:** `data/pricing_catalogue_2025.json`

**Expected structure:**
```json
{
  "Category Name": {
    "Product Name": {
      "sku": "PRODUCT-SKU (optional)",
      "variation": "Size/Type (optional)",
      "volume_ml": 700,
      "abv": 42,
      "wholesale_ex_gst": 55.00,
      "rrp": 80.00,
      "moq": "Case of 6 (optional)",
      "metadata": {
        "updated": "2025-11",
        "discontinued": false,
        "notes": "Any additional notes"
      }
    }
  }
}
```

**Real example:**
```json
{
  "Back Bar Range": {
    "Rainforest Gin": {
      "wholesale_ex_gst": 55,
      "rrp": 80,
      "volume_ml": 700,
      "abv": 42.5,
      "moq": "Case of 6",
      "metadata": {
        "updated": "2025-11",
        "discontinued": false
      }
    },
    "Signature Dry Gin": {
      "wholesale_ex_gst": 55,
      "rrp": 80,
      "volume_ml": 700,
      "abv": 42,
      "moq": "Case of 6",
      "metadata": {
        "updated": "2025-11",
        "discontinued": false
      }
    }
  }
}
```

---

### 2. `sales_summary_2025.json`
**Location:** `data/sales_summary_2025.json`

**Expected structure:**
```json
{
  "Category Name": [
    {
      "item_name": "Product Name",
      "item_variation": "Size/Type (optional)",
      "sku": "PRODUCT-SKU (optional)",
      "items_sold": 100,
      "product_sales": 5500.00,
      "refunds": 0.00,
      "discounts_and_comps": 0.00,
      "net_sales": 5500.00,
      "tax": 550.00,
      "gross_sales": 6050.00,
      "units_sold": 100
    }
  ]
}
```

**Real example:**
```json
{
  "Back Bar Range": [
    {
      "item_name": "Rainforest Gin",
      "item_variation": "700ml",
      "sku": "RF-GIN-700",
      "items_sold": 250,
      "product_sales": 13750.00,
      "refunds": 0.00,
      "discounts_and_comps": 275.00,
      "net_sales": 13475.00,
      "tax": 1347.50,
      "gross_sales": 14822.50,
      "units_sold": 250
    }
  ]
}
```

---

## 🔧 How to Import

### Option 1: Replace Files Directly
1. Open the files `data/pricing_catalogue_2025.json` and `data/sales_summary_2025.json`
2. Delete all content (including examples)
3. Paste your new 2025 data
4. Save the files
5. Reload the page: `http://localhost:3001/dashboard/planning`

### Option 2: Use Import Script (Recommended)
If you have the data in Excel/CSV, I can create a script to convert automatically.

---

## 📊 Data Visualization

After importing, the planning page will show:

1. **Summary Cards:**
   - Net Sales 2025 (total)
   - Units sold (total)
   - Number of categories
   - Products in catalogue

2. **Table: Sales by Category**
   - Category
   - Net sales
   - Units sold

3. **Table: Top 5 Products**
   - Product
   - Net sales
   - Units sold

4. **Table: Pricing Catalogue**
   - Category
   - Product
   - SKU
   - Wholesale (ex GST)
   - RRP
   - Volume (ml)
   - ABV (%)
   - MOQ

---

## ⚠️ Important Notes

1. **JSON Format:** Make sure the JSON is valid (no extra commas, correct quotes)
2. **Optional Fields:** `sku`, `variation`, `moq`, `metadata` are optional
3. **Numbers:** Use numbers without quotes for numeric values
4. **Categories:** Must be consistent between pricing and sales

---

## 🧪 Test

After importing, test:
```
http://localhost:3001/dashboard/planning
```

If there are errors, check the browser console (F12) for details.

---

## 📞 Need Help?

If you have the data in another format (Excel, CSV, etc.), send it to me and I'll create an automatic conversion script!

