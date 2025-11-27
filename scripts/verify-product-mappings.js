// Verification script to check all product mappings exist in inventory
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPIRIT_SKUS = {
  // Devil's Thumb Products
  'Rainforest Gin': { sku700: 'RAIN-700', sku200: 'RAIN-200', label700: 'LBL-RAIN-700', label200: 'LBL-RAIN-200' },
  'Signature Dry Gin': { sku700: 'SIGN-700', sku200: 'SIGN-200', label700: 'LBL-SIGN-700', label200: 'LBL-SIGN-200' },
  'Navy Strength Gin': { sku700: 'NAVY-700', sku200: 'NAVY-200', label700: 'LBL-NAVY-700', label200: 'LBL-NAVY-200' },
  'Wet Season Gin': { sku700: 'WET-700', sku200: 'WET-200', label700: 'LBL-WET-700', label200: 'LBL-WET-200' },
  'Dry Season Gin': { sku700: 'DRY-700', sku200: 'DRY-200', label700: 'LBL-DR-700', label200: 'LBL-DR-200' },
  'Australian Cane Spirit': { sku700: 'CANE-700', sku200: 'CANE-200', label700: 'LBL-CANE-700', label200: 'LBL-CANE-200' },
  'Pineapple Rum': { sku700: 'PINE-700', sku200: 'PINE-200', label700: 'LBL-PINE-700', label200: 'LBL-PINE-200' },
  'Spiced Rum': { sku700: 'SPICED-700', sku200: 'SPICED-200', label700: 'LBL-SPICED-700', label200: 'LBL-SPICED-200' },
  'Reserve Cask Rum': { sku700: 'RESRUM-700', label700: 'LBL-RESRUM-700' },
  'Coffee Liqueur': { sku700: 'COFFEE-700', label700: 'LBL-COFFEE-700' },
  
  // Merchant Mae Products
  'Merchant Mae Gin': { sku700: 'MM-GIN-700', label700: 'LBL-MMGIN-700' },
  'Merchant Mae Vodka': { sku700: 'MM-VODKA-700', label700: 'LBL-MMVODKA-700' },
  'Merchant Mae Golden Sunrise': { sku700: 'MM-GOLDEN-700', label700: 'LBL-MMGOLDEN-700' },
  'Merchant Mae Berry Burst': { sku700: 'MM-BERRY-700', label700: 'LBL-MMBERRY-700' },
  'Merchant Mae White Rum': { sku700: 'MM-WR-700', label700: 'LBL-MMWR-700' },
  'Merchant Mae Dark Rum': { sku700: 'MM-DR-700', label700: 'LBL-MMDR-700' },
};

const PKG = {
  BOTTLE_700: 'PKG-BOTTLE-700',
  BOTTLE_200: 'PKG-BOTTLE-200',
  CORK_700: 'PKG-CORK-700',
  CAP_200: 'PKG-CAP-200',
  SLEEVE_700: 'PKG-SLEEVE-700',
  SLEEVE_200: 'PKG-SLEEVE-200',
  CARTON_6P_700: 'PKG-CARTON-6P-700',
};

// Load inventory
const inventoryPath = path.join(__dirname, '../data/inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const inventorySkus = new Set(inventory.map(item => item.sku));

console.log('🔍 VERIFYING PRODUCT MAPPINGS...\n');

let allGood = true;
const missing = [];

// Check all product SKUs
for (const [product, skus] of Object.entries(SPIRIT_SKUS)) {
  console.log(`\n📦 ${product}:`);
  
  for (const [key, sku] of Object.entries(skus)) {
    if (!sku) continue;
    
    if (inventorySkus.has(sku)) {
      console.log(`  ✅ ${key}: ${sku}`);
    } else {
      console.log(`  ❌ ${key}: ${sku} - NOT FOUND IN INVENTORY`);
      missing.push({ product, key, sku });
      allGood = false;
    }
  }
}

// Check packaging SKUs
console.log('\n\n📦 PACKAGING ITEMS:');
for (const [key, sku] of Object.entries(PKG)) {
  if (inventorySkus.has(sku)) {
    console.log(`  ✅ ${key}: ${sku}`);
  } else {
    console.log(`  ❌ ${key}: ${sku} - NOT FOUND IN INVENTORY`);
    missing.push({ product: 'Packaging', key, sku });
    allGood = false;
  }
}

console.log('\n\n' + '='.repeat(60));
if (allGood) {
  console.log('✅ ALL PRODUCT MAPPINGS ARE VALID!');
  console.log('All products can be bottled without errors.');
} else {
  console.log('❌ MISSING ITEMS IN INVENTORY:');
  console.log(`\nTotal missing: ${missing.length} items\n`);
  for (const item of missing) {
    console.log(`  - ${item.product} → ${item.key}: ${item.sku}`);
  }
}
console.log('='.repeat(60) + '\n');

process.exit(allGood ? 0 : 1);

