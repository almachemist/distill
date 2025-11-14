/**
 * Script to process sales data from CSV and generate comprehensive analytics
 * 
 * Input: data/items-2025-01-01-2026-01-01(in).csv
 * Output: data/sales_analytics_2025.json
 * 
 * Features:
 * - Annual projection (December = October average)
 * - Sales by product, channel, customer, month
 * - Cross-analysis (product x month, channel x product, etc.)
 */

import fs from 'fs'
import path from 'path'

interface RawSalesRow {
  Date: string
  Category: string
  Item: string
  Qty: string
  'Price Point Name': string
  SKU: string
  'Modifiers Applied': string
  'Product Sales': string
  Discounts: string
  'Net Sales': string
  Tax: string
  'Gross Sales': string
  Location: string
  'Dining Option': string
  'Customer ID': string
  'Customer Name': string
  'Customer Reference ID': string
  Unit: string
  Count: string
  Channel: string
}

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

// Helper to parse currency values
function parseCurrency(value: string): number {
  if (!value || value.trim() === '') return 0
  // Remove currency symbols, spaces, and parentheses (for negative values)
  const cleaned = value.replace(/[$,\s]/g, '').replace(/[()]/g, '')
  const num = parseFloat(cleaned)
  // If original had parentheses, make it negative
  return value.includes('(') ? -Math.abs(num) : num
}

// Helper to parse quantity (handles comma as decimal separator)
function parseQuantity(value: string): number {
  if (!value || value.trim() === '') return 0
  // Replace comma with dot for decimal
  const cleaned = value.replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Parse CSV manually (simple parser)
function parseCSV(content: string): RawSalesRow[] {
  const lines = content.split('\n')
  const headers = lines[0].split(',')
  const rows: RawSalesRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Simple CSV parsing (handles quoted fields)
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    if (values.length === headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]
      })
      rows.push(row as RawSalesRow)
    }
  }

  return rows
}

// Process raw data
function processSalesData(rawData: RawSalesRow[]): ProcessedSale[] {
  return rawData.map(row => {
    const dateParts = row.Date.split('/')
    const date = new Date(
      parseInt(dateParts[2]),
      parseInt(dateParts[0]) - 1,
      parseInt(dateParts[1])
    )

    return {
      date,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      category: row.Category,
      item: row.Item,
      qty: parseQuantity(row.Qty),
      sku: row.SKU,
      productSales: parseCurrency(row['Product Sales']),
      discounts: parseCurrency(row.Discounts),
      netSales: parseCurrency(row['Net Sales']),
      tax: parseCurrency(row.Tax),
      grossSales: parseCurrency(row['Gross Sales']),
      location: row.Location,
      customerId: row['Customer ID'],
      customerName: row['Customer Name'],
      channel: row.Channel,
      count: parseInt(row.Count) || 0
    }
  })
}

// Main execution
async function main() {
  console.log('🚀 Starting sales data processing...\n')

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'data', 'items-2025-01-01-2026-01-01(in).csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  console.log('📄 Parsing CSV file...')
  const rawData = parseCSV(csvContent)
  console.log(`✅ Parsed ${rawData.length} rows\n`)

  console.log('🔄 Processing sales data...')
  const processedData = processSalesData(rawData)
  console.log(`✅ Processed ${processedData.length} sales records\n`)

  // Save processed data for next step
  const outputPath = path.join(process.cwd(), 'data', 'sales_processed_temp.json')
  fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2))
  console.log(`💾 Saved processed data to: ${outputPath}\n`)

  console.log('✅ Processing complete!')
}

main().catch(console.error)

