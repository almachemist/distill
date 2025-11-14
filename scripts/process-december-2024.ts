/**
 * Process December 2024 sales data for use in December 2025 projection
 * 
 * This script:
 * 1. Reads december.csv (December 2024 actual data)
 * 2. Parses and validates the data
 * 3. Converts to ProcessedSale format
 * 4. Saves to december_2024_processed.json
 */

import fs from 'fs'
import path from 'path'

interface ProcessedSale {
  date: Date
  month: number
  year: number
  category: string
  item: string
  qty: number
  sku: string
  productSales: number
  discounts: number
  netSales: number
  tax: number
  grossSales: number
  location: string
  customerId: string
  customerName: string
  channel: string
  count: number
}

function parseCurrency(value: string): number {
  if (!value || value === '') return 0
  // Remove currency symbols and handle negative values in parentheses
  const cleaned = value.replace(/[$,]/g, '').replace(/[()]/g, '-').trim()
  return parseFloat(cleaned) || 0
}

function parseQuantity(value: string): number {
  if (!value || value === '') return 0
  // Handle comma as decimal separator
  const cleaned = value.replace(',', '.').trim()
  return parseFloat(cleaned) || 0
}

function parseCSV(content: string): string[][] {
  const lines = content.split('\n')
  const rows: string[][] = []
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const row: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    row.push(current.trim())
    rows.push(row)
  }
  
  return rows
}

function processSalesData(csvPath: string): ProcessedSale[] {
  console.log(`📂 Reading CSV from: ${csvPath}\n`)
  
  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)
  
  // Skip header row
  const dataRows = rows.slice(1)
  
  console.log(`📊 Processing ${dataRows.length} rows...\n`)
  
  const sales: ProcessedSale[] = []
  
  for (const row of dataRows) {
    if (row.length < 20) continue // Skip incomplete rows
    
    // CSV columns: Date,Category,Item,Qty,Price Point Name,SKU,Modifiers Applied,
    // Product Sales,Discounts,Net Sales,Tax,Gross Sales,Details,Event Type,Location,
    // Dining Option,Customer ID,Customer Name,Itemization Type,Fulfillment Note,Channel
    const [
      dateStr, category, item, qtyStr, pricePoint, sku, modifiers,
      productSalesStr, discountsStr, netSalesStr, taxStr, grossSalesStr,
      details, eventType, location, diningOption, customerId, customerName,
      itemizationType, fulfillmentNote, channel
    ] = row
    
    if (!dateStr || !item) continue // Skip rows without essential data

    // Parse date (format: MM/DD/YYYY)
    const [month, day, year] = dateStr.split('/').map(Number)
    const date = new Date(year, month - 1, day)

    // Only process December 2024 data
    if (month !== 12 || year !== 2024) continue
    
    sales.push({
      date,
      month: 12,
      year: 2024,
      category: category || 'Unknown',
      item: item || 'Unknown',
      qty: parseQuantity(qtyStr),
      sku: sku || '',
      productSales: parseCurrency(productSalesStr),
      discounts: parseCurrency(discountsStr),
      netSales: parseCurrency(netSalesStr),
      tax: parseCurrency(taxStr),
      grossSales: parseCurrency(grossSalesStr),
      location: location || '',
      customerId: customerId || '',
      customerName: customerName || '',
      channel: channel || 'Unknown',
      count: 1 // Each row is one transaction
    })
  }
  
  console.log(`✅ Processed ${sales.length} December 2024 sales\n`)
  
  return sales
}

async function main() {
  console.log('🚀 Processing December 2024 data...\n')
  
  const csvPath = path.join(process.cwd(), 'data', 'december.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: december.csv not found at ${csvPath}`)
    console.error(`\nPlease add the December 2024 sales data to data/december.csv`)
    process.exit(1)
  }
  
  const sales = processSalesData(csvPath)
  
  const outputPath = path.join(process.cwd(), 'data', 'december_2024_processed.json')
  fs.writeFileSync(outputPath, JSON.stringify(sales, null, 2))
  
  console.log(`💾 Saved to: ${outputPath}`)
  console.log(`✅ December 2024 processing complete!`)
  console.log(`\nNext step: Run 'npx tsx scripts/generate-sales-analytics.ts' to regenerate analytics`)
}

main().catch(console.error)

