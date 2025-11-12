# Rum Production Dashboard - Layout Specification

## Overview

This document defines the complete layout and logic for the rum production dashboard, including data calculations, display structure, and validation rules.

---

## 1. ABV Final da Fermentação

### Rule
The **Final ABV of fermentation** is the same ABV of the liquid that entered the boiler.

### Data Source
- If distillation record shows "Boiler charge: 1,100 L at 10.2%", then:
  - `Final ABV of fermentation = 10.2%`
  - `Fermentation volume = 1,100 L`

### Implementation
```typescript
const fermentationVolume = run.boiler_volume_l || 0
const fermentationFinalABV = run.boiler_abv_percent || run.final_abv_percent || 0
```

### Display
In the **Fermentation** section, show:
- Fermentation volume (L)
- Final ABV of fermentation (%)
- Date/time (if available)

**Note:** This ABV is not recalculated - it's simply re-presented from the distillation data.

---

## 2. Distillation: Mandatory Cut Cards

### Order (Fixed)
The dashboard must always show these 5 cuts in this exact order:

1. **Foreshots**
2. **Heads**
3. **Hearts**
4. **Early Tails**
5. **Late Tails**

### Rationale
Foreshots, heads, and hearts are the noble cuts, but early tails and late tails are also useful products for the next distillation, so they need to appear as visible entities, not hidden.

### Card Content
For each card, display:
- Volume (L)
- ABV (%)
- LAL (if available in JSON)
- Destination (optional: "discarded", "kept for next run", "to feints tank")

### Data Structure Expected
```json
{
  "distillation": {
    "boiler_charge": {
      "volume_l": 1100,
      "abv_percent": 10.2
    },
    "cuts": {
      "foreshots": {
        "volume_l": 2.0,
        "abv_percent": 83.0,
        "lal": 1.7,
        "destination": "waste"
      },
      "heads": {
        "volume_l": 10.0,
        "abv_percent": 82.0,
        "lal": 8.2,
        "destination": "feints"
      },
      "hearts": {
        "volume_l": 236.0,
        "abv_percent": 80.9,
        "lal": 190.9,
        "destination": "product"
      },
      "early_tails": {
        "volume_l": 50.0,
        "abv_percent": 75.0,
        "lal": 37.5,
        "destination": "feints"
      },
      "late_tails": {
        "volume_l": 176.0,
        "abv_percent": 65.0,
        "lal": 114.4,
        "destination": "feints"
      }
    }
  }
}
```

### Fallback Behavior
If JSON comes without `early_tails` and `late_tails`, the frontend should show the card empty or with "0 L", but the slot must exist. This ensures all distillations, even old ones, look visually identical.

---

## 3. Loss Calculation (Alcohol Recovery)

### Rule
"It's super easy to calculate the loss" - we need two things:
- Alcohol input (LAL in)
- Alcohol output (LAL out)

### 3.1. LAL Input
```
LAL_in = boiler_charge.volume_l × (boiler_charge.abv_percent / 100)
```

**Example:** 1,100 L × 10.2% = 1,100 × 0.102 = 112.2 LAL

### 3.2. LAL Output
Sum the LAL of all cuts considered as "produced / recovered" in this run.

Since we want to see early tails and late tails (because they will be used again), they should be included in the technical recovery calculation.

```
LAL_out = LAL_foreshots + LAL_heads + LAL_hearts + LAL_early_tails + LAL_late_tails
```

### 3.3. Loss (Alcohol Lost)
```
Loss_LAL = LAL_in - LAL_out
```

If you want it as a percentage:
```
Loss_% = (Loss_LAL / LAL_in) × 100
```

### Display
Show in a "Process losses" or "Alcohol recovery" block.

### Data Validation
**Important:** Historical data has some fields with #REF! or absurd percentages, so the frontend needs a fallback:

```typescript
const hasDataIssue = lalOut > lalIn

if (hasDataIssue) {
  // Show "check data" or 0% loss
  // Mark with red border or warning color
}
```

---

## 4. Notes by Stage

Notes should be embedded within their respective sections:

- **Fermentation notes:** Inside the Fermentation block
- **Distillation notes:** Inside the Distillation area, ideally associated with the cut (e.g., note about condenser in Heads)
- **Maturation/barrel notes:** In the last section

---

## 5. Dashboard Structure

The general layout for a run should be:

### 1. Header
- Run ID
- SKU / Product
- Date
- Still

### 2. KPI Summary (6 cards)
- Hearts (L + ABV)
- Hearts LAL
- Heart Yield (%)
- LAL In (boiler charge)
- LAL Out (all cuts)
- LAL Loss (% and absolute)

### 3. Fermentation Section
- Fermentation volume (L) = same as boiler charge
- Final ABV (%) = same as boiler charge
- Start date
- Duration
- Substrate details
- Yeast details
- Nutrients (DAP, Fermaid O)
- Fermentation curves (temperature, brix, pH)
- Fermentation notes

### 4. Distillation Section
- Boiler charge (volume + ABV)
- Still used
- Start time
- Retort details (if applicable)
- **5 Cut Cards:** Foreshots, Heads, Hearts, Early Tails, Late Tails
- Alcohol recovery / Loss (calculated as above)
- Distillation notes

### 5. Maturation / Barrel Section (if applicable)
- Fill date
- Cask number
- Cask type, origin, size
- Fill ABV
- Volume filled
- LAL filled
- Location
- Expected bottling date
- Maturation notes

### 6. JSON Source (optional, for internal audit only)

---

## 6. Implementation Notes

### Color Coding for Cuts
- **Foreshots:** Red (bg-red-50, border-red-200, text-red-900/700/600)
- **Heads:** Orange (bg-orange-50, border-orange-200, text-orange-900/700/600)
- **Hearts:** Green (bg-green-50, border-green-200, text-green-900/700/600)
- **Early Tails:** Yellow (bg-yellow-50, border-yellow-200, text-yellow-900/700/600)
- **Late Tails:** Amber (bg-amber-50, border-amber-200, text-amber-900/700/600)

### Typography
- Section headings: `text-sm font-semibold uppercase tracking-wide`
- Labels: `text-xs text-stone-500 uppercase`
- Data: `font-medium text-stone-900`
- KPI metrics: `text-lg font-semibold text-stone-900`

### Spacing
- Consistent gap-3, gap-4, gap-6 patterns
- Borders: rounded-lg, rounded-xl for cards

### No Emojis
**Critical:** No emojis in any part of the production interface.

---

## 7. Data Validation Rules

### LAL Calculation Sanity Check
```typescript
if (lalOut > lalIn) {
  // Mark as data issue
  // Show warning: "Check data - Out > In"
  // Display with red border
  // Don't show negative loss
}
```

### Missing Data Handling
- If a cut has no data, show "0 L" and "0% ABV"
- Always show all 5 cut cards, even if empty
- Use "—" for missing optional fields

### Fallback for Legacy Data
- `early_tails_volume_l` may not exist → fallback to 0
- `late_tails_volume_l` may not exist → fallback to `tails_volume_l`
- `boiler_abv_percent` may not exist → fallback to `final_abv_percent`

---

## 8. Example Calculations

### Example Run: RUM-24-7
```
Boiler charge: 1,100 L @ 10.2% ABV
LAL_in = 1,100 × 0.102 = 112.2 LAL

Cuts:
- Foreshots: 2.0 L @ 83.0% = 1.66 LAL
- Heads: 10.0 L @ 82.0% = 8.2 LAL
- Hearts: 88.0 L @ 83.6% = 73.57 LAL
- Early Tails: 0 L @ 0% = 0 LAL
- Late Tails: 0 L @ 0% = 0 LAL

LAL_out = 1.66 + 8.2 + 73.57 + 0 + 0 = 83.43 LAL
Loss_LAL = 112.2 - 83.43 = 28.77 LAL
Loss_% = (28.77 / 112.2) × 100 = 25.6%
```

---

## 9. Current Implementation Status

### ✅ Completed
- ABV from fermentation = boiler charge ABV
- 5 mandatory cut cards (Foreshots, Heads, Hearts, Early Tails, Late Tails)
- LAL calculation with validation
- Data issue detection (LAL out > LAL in)
- Color-coded cuts
- No emojis
- Professional layout

### 📝 Future Enhancements
- Add "destination" field to cut cards
- Add sparkline charts for fermentation curves
- Add comparison between batches
- Add export to PDF/Excel

---

## 10. References

- Data model: `docs/rum-production-data-model.md`
- Schema migration: `docs/rum-schema-migration.sql`
- Component: `src/app/dashboard/production/rum/RumDetailPanel.tsx`

