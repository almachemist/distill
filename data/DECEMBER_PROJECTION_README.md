# 📊 December 2025 Projection Using December 2024 Data

## 🎯 Overview

To create an accurate annual projection for 2025, we use **December 2024 actual sales data** to project December 2025 sales. This is more accurate than using October 2025 data because:

1. ✅ **Seasonal Accuracy** - December has unique holiday sales patterns
2. ✅ **Historical Data** - Based on real performance, not estimates
3. ✅ **Year-over-Year Comparison** - Enables accurate YoY analysis

---

## 📁 Required Files

### 1. `december.csv`
**Location:** `data/december.csv`  
**Content:** December 2024 actual sales data  
**Format:** Same CSV format as the main sales file

**Expected columns:**
```
Date,Category,Item,Qty,Price Point Name,SKU,Modifiers Applied,
Product Sales,Discounts,Net Sales,Tax,Gross Sales,Location,
Dining Option,Customer ID,Customer Name,Customer Reference ID,
Unit,Count,Channel
```

**Date format:** DD/MM/YYYY (e.g., 01/12/2024, 15/12/2024, 31/12/2024)

---

## 🔧 How to Add December 2024 Data

### Step 1: Prepare the CSV File
1. Export December 2024 sales data from your POS/sales system
2. Ensure it has the same format as your main sales CSV
3. Save it as `december.csv` in the `data/` folder

### Step 2: Process December Data
```bash
npx tsx scripts/process-december-2024.ts
```

This will:
- ✅ Read `data/december.csv`
- ✅ Parse and validate December 2024 sales
- ✅ Save to `data/december_2024_processed.json`

### Step 3: Regenerate Analytics
```bash
npx tsx scripts/generate-sales-analytics.ts
```

This will:
- ✅ Load 2025 sales (Jan-Nov)
- ✅ Load December 2024 data
- ✅ Project December 2025 = December 2024
- ✅ Generate complete annual analytics
- ✅ Save to `data/sales_analytics_2025.json`

### Step 4: View Results
Open the dashboard:
```
http://localhost:3001/dashboard/sales
```

December 2025 will show with a **"Based on Dec 2024"** badge.

---

## 📊 What Gets Projected

When December 2024 data is added, the system will:

1. **Copy all December 2024 sales** to December 2025
2. **Maintain product mix** - Same products, quantities, and customers
3. **Preserve pricing** - Same prices and discounts
4. **Keep channel distribution** - Same sales channels

This creates a realistic baseline for December 2025 planning.

---

## 🎯 Benefits

### Accurate Seasonal Planning
- December typically has different sales patterns than other months
- Holiday sales, gift purchases, and year-end promotions
- Using actual December data captures these patterns

### Year-over-Year Analysis
- Compare December 2024 vs December 2025 (projected)
- Identify growth opportunities
- Plan inventory and staffing

### Better Forecasting
- More accurate than using October or November data
- Accounts for seasonal variations
- Enables realistic annual projections

---

## 📝 Example Workflow

```bash
# 1. Add December 2024 CSV to data folder
cp ~/Downloads/december-2024-sales.csv data/december.csv

# 2. Process December data
npx tsx scripts/process-december-2024.ts

# 3. Regenerate analytics with December projection
npx tsx scripts/generate-sales-analytics.ts

# 4. View updated dashboard
# Open http://localhost:3001/dashboard/sales
```

---

## ⚠️ Important Notes

1. **Date Format:** Ensure dates in december.csv are in DD/MM/YYYY format
2. **Year Filter:** The script only processes December 2024 data (month=12, year=2024)
3. **CSV Format:** Must match the main sales CSV format exactly
4. **File Location:** Must be saved as `data/december.csv`

---

## 🔍 Verification

After processing, check:

1. **File Created:** `data/december_2024_processed.json` exists
2. **Record Count:** Console shows number of December 2024 sales processed
3. **Dashboard:** December 2025 shows "Based on Dec 2024" badge
4. **Totals:** Annual totals include December projection

---

## 📞 Troubleshooting

### Error: "december.csv not found"
- Ensure file is saved as `data/december.csv`
- Check file path and spelling

### Error: "No December 2024 data found"
- Check date format in CSV (DD/MM/YYYY)
- Verify dates are in December 2024 (12/2024)
- Ensure CSV has data rows (not just headers)

### December not showing in dashboard
- Run `npx tsx scripts/generate-sales-analytics.ts` again
- Check browser console for errors
- Refresh the page (Cmd+R / Ctrl+R)

---

**Last Updated:** November 13, 2025  
**Projection Method:** December 2025 = December 2024 actual data

