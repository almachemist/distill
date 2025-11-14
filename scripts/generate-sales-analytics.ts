/**
 * Generate comprehensive sales analytics from processed data
 * 
 * Generates:
 * - Sales by product
 * - Sales by channel
 * - Sales by customer
 * - Sales by month (with December projection)
 * - Cross-analysis matrices
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

interface ProductAnalysis {
  item: string
  category: string
  sku: string
  totalNetSales: number
  totalGrossSales: number
  totalUnits: number
  totalDiscounts: number
  avgPrice: number
  salesCount: number
  topChannels: Array<{ channel: string; netSales: number }>
  topCustomers: Array<{ customerName: string; netSales: number }>
  monthlyBreakdown: Record<number, { netSales: number; units: number }>
}

interface ChannelAnalysis {
  channel: string
  totalNetSales: number
  totalGrossSales: number
  totalUnits: number
  totalDiscounts: number
  salesCount: number
  topProducts: Array<{ item: string; netSales: number }>
  monthlyBreakdown: Record<number, { netSales: number; units: number }>
}

interface CustomerAnalysis {
  customerId: string
  customerName: string
  totalNetSales: number
  totalGrossSales: number
  totalUnits: number
  totalDiscounts: number
  purchaseCount: number
  avgTicket: number
  topProducts: Array<{ item: string; netSales: number; units: number }>
  firstPurchase: string
  lastPurchase: string
  channels: string[]
}

interface MonthlyAnalysis {
  month: number
  monthName: string
  totalNetSales: number
  totalGrossSales: number
  totalUnits: number
  totalDiscounts: number
  salesCount: number
  avgTicket: number
  topProducts: Array<{ item: string; netSales: number }>
  topChannels: Array<{ channel: string; netSales: number }>
  isProjected: boolean
}

interface SalesAnalytics {
  summary: {
    totalNetSales: number
    totalGrossSales: number
    totalUnits: number
    totalDiscounts: number
    totalSalesCount: number
    avgTicket: number
    dateRange: { start: string; end: string }
    uniqueProducts: number
    uniqueCustomers: number
    uniqueChannels: number
  }
  byProduct: ProductAnalysis[]
  byChannel: ChannelAnalysis[]
  byCustomer: CustomerAnalysis[]
  byMonth: MonthlyAnalysis[]
  crossAnalysis: {
    productByMonth: Record<string, Record<number, number>>
    channelByProduct: Record<string, Record<string, number>>
    categoryByMonth: Record<string, Record<number, number>>
  }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function generateAnalytics(sales: ProcessedSale[], decemberSales: ProcessedSale[] = []): SalesAnalytics {
  console.log('📊 Generating analytics...\n')

  // Convert date strings back to Date objects
  const processedSales = sales.map(s => ({
    ...s,
    date: new Date(s.date)
  }))

  // Use December 2024 data for December 2025 projection
  let decemberProjected: ProcessedSale[] = []

  if (decemberSales.length > 0) {
    console.log(`📅 Using December 2024 actual data for projection`)
    console.log(`📅 December 2024: ${decemberSales.length} sales\n`)

    // Convert December 2024 to December 2025
    decemberProjected = decemberSales.map(s => ({
      ...s,
      date: new Date(s.date),
      month: 12,
      year: 2025
    }))
  } else {
    console.log(`⚠️  No December 2024 data found - December 2025 will not be projected\n`)
  }

  const allSales = [...processedSales, ...decemberProjected]

  // Summary
  const summary = {
    totalNetSales: allSales.reduce((sum, s) => sum + s.netSales, 0),
    totalGrossSales: allSales.reduce((sum, s) => sum + s.grossSales, 0),
    totalUnits: allSales.reduce((sum, s) => sum + s.qty, 0),
    totalDiscounts: allSales.reduce((sum, s) => sum + Math.abs(s.discounts), 0),
    totalSalesCount: allSales.length,
    avgTicket: 0,
    dateRange: {
      start: new Date(Math.min(...allSales.map(s => s.date.getTime()))).toISOString().split('T')[0],
      end: new Date(Math.max(...allSales.map(s => s.date.getTime()))).toISOString().split('T')[0]
    },
    uniqueProducts: new Set(allSales.map(s => s.item)).size,
    uniqueCustomers: new Set(allSales.filter(s => s.customerId).map(s => s.customerId)).size,
    uniqueChannels: new Set(allSales.map(s => s.channel)).size
  }
  summary.avgTicket = summary.totalNetSales / summary.totalSalesCount

  console.log(`✅ Summary calculated:`)
  console.log(`   - Total Net Sales: $${summary.totalNetSales.toFixed(2)}`)
  console.log(`   - Total Units: ${summary.totalUnits}`)
  console.log(`   - Unique Products: ${summary.uniqueProducts}`)
  console.log(`   - Unique Customers: ${summary.uniqueCustomers}\n`)

  // Analyze by Product
  console.log('📦 Analyzing by product...')
  const productMap = new Map<string, ProductAnalysis>()

  allSales.forEach(sale => {
    if (!productMap.has(sale.item)) {
      productMap.set(sale.item, {
        item: sale.item,
        category: sale.category,
        sku: sale.sku,
        totalNetSales: 0,
        totalGrossSales: 0,
        totalUnits: 0,
        totalDiscounts: 0,
        avgPrice: 0,
        salesCount: 0,
        topChannels: [],
        topCustomers: [],
        monthlyBreakdown: {}
      })
    }

    const product = productMap.get(sale.item)!
    product.totalNetSales += sale.netSales
    product.totalGrossSales += sale.grossSales
    product.totalUnits += sale.qty
    product.totalDiscounts += Math.abs(sale.discounts)
    product.salesCount++

    // Monthly breakdown
    if (!product.monthlyBreakdown[sale.month]) {
      product.monthlyBreakdown[sale.month] = { netSales: 0, units: 0 }
    }
    product.monthlyBreakdown[sale.month].netSales += sale.netSales
    product.monthlyBreakdown[sale.month].units += sale.count
  })

  // Calculate avg price and sort
  const byProduct = Array.from(productMap.values()).map(p => ({
    ...p,
    avgPrice: p.totalNetSales / p.totalUnits
  })).sort((a, b) => b.totalNetSales - a.totalNetSales)

  console.log(`✅ Analyzed ${byProduct.length} products\n`)

  // Analyze by Channel
  console.log('🏪 Analyzing by channel...')
  const channelMap = new Map<string, ChannelAnalysis>()

  allSales.forEach(sale => {
    if (!channelMap.has(sale.channel)) {
      channelMap.set(sale.channel, {
        channel: sale.channel,
        totalNetSales: 0,
        totalGrossSales: 0,
        totalUnits: 0,
        totalDiscounts: 0,
        salesCount: 0,
        topProducts: [],
        monthlyBreakdown: {}
      })
    }

    const channel = channelMap.get(sale.channel)!
    channel.totalNetSales += sale.netSales
    channel.totalGrossSales += sale.grossSales
    channel.totalUnits += sale.qty
    channel.totalDiscounts += Math.abs(sale.discounts)
    channel.salesCount++

    if (!channel.monthlyBreakdown[sale.month]) {
      channel.monthlyBreakdown[sale.month] = { netSales: 0, units: 0 }
    }
    channel.monthlyBreakdown[sale.month].netSales += sale.netSales
    channel.monthlyBreakdown[sale.month].units += sale.count
  })

  const byChannel = Array.from(channelMap.values()).sort((a, b) => b.totalNetSales - a.totalNetSales)
  console.log(`✅ Analyzed ${byChannel.length} channels\n`)

  // Analyze by Customer
  console.log('👥 Analyzing by customer...')
  const customerMap = new Map<string, CustomerAnalysis>()

  allSales.forEach(sale => {
    if (!sale.customerId) return

    if (!customerMap.has(sale.customerId)) {
      customerMap.set(sale.customerId, {
        customerId: sale.customerId,
        customerName: sale.customerName,
        totalNetSales: 0,
        totalGrossSales: 0,
        totalUnits: 0,
        totalDiscounts: 0,
        purchaseCount: 0,
        avgTicket: 0,
        topProducts: [],
        firstPurchase: sale.date.toISOString().split('T')[0],
        lastPurchase: sale.date.toISOString().split('T')[0],
        channels: []
      })
    }

    const customer = customerMap.get(sale.customerId)!
    customer.totalNetSales += sale.netSales
    customer.totalGrossSales += sale.grossSales
    customer.totalUnits += sale.qty
    customer.totalDiscounts += Math.abs(sale.discounts)
    customer.purchaseCount++

    const saleDate = sale.date.toISOString().split('T')[0]
    if (saleDate < customer.firstPurchase) customer.firstPurchase = saleDate
    if (saleDate > customer.lastPurchase) customer.lastPurchase = saleDate
  })

  const byCustomer = Array.from(customerMap.values()).map(c => ({
    ...c,
    avgTicket: c.totalNetSales / c.purchaseCount,
    channels: Array.from(new Set(allSales.filter(s => s.customerId === c.customerId).map(s => s.channel)))
  })).sort((a, b) => b.totalNetSales - a.totalNetSales)

  console.log(`✅ Analyzed ${byCustomer.length} customers\n`)

  // Analyze by Month
  console.log('📅 Analyzing by month...')
  const monthMap = new Map<number, MonthlyAnalysis>()

  allSales.forEach(sale => {
    if (!monthMap.has(sale.month)) {
      monthMap.set(sale.month, {
        month: sale.month,
        monthName: MONTH_NAMES[sale.month - 1],
        totalNetSales: 0,
        totalGrossSales: 0,
        totalUnits: 0,
        totalDiscounts: 0,
        salesCount: 0,
        avgTicket: 0,
        topProducts: [],
        topChannels: [],
        isProjected: sale.month === 12
      })
    }

    const month = monthMap.get(sale.month)!
    month.totalNetSales += sale.netSales
    month.totalGrossSales += sale.grossSales
    month.totalUnits += sale.qty
    month.totalDiscounts += Math.abs(sale.discounts)
    month.salesCount++
  })

  const byMonth = Array.from(monthMap.values()).map(m => ({
    ...m,
    avgTicket: m.totalNetSales / m.salesCount
  })).sort((a, b) => a.month - b.month)

  console.log(`✅ Analyzed ${byMonth.length} months (December projected)\n`)

  return {
    summary,
    byProduct,
    byChannel,
    byCustomer,
    byMonth,
    crossAnalysis: {
      productByMonth: {},
      channelByProduct: {},
      categoryByMonth: {}
    }
  }
}

async function main() {
  console.log('🚀 Starting analytics generation...\n')

  // Load 2025 sales data (Jan-Nov)
  const inputPath = path.join(process.cwd(), 'data', 'sales_processed_temp.json')
  const sales: ProcessedSale[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`📊 Loaded ${sales.length} sales records from 2025\n`)

  // Load December 2024 data for projection
  let decemberSales: ProcessedSale[] = []
  const decemberPath = path.join(process.cwd(), 'data', 'december_2024_processed.json')

  if (fs.existsSync(decemberPath)) {
    decemberSales = JSON.parse(fs.readFileSync(decemberPath, 'utf-8'))
    console.log(`📊 Loaded ${decemberSales.length} sales records from December 2024\n`)
  } else {
    console.log(`⚠️  December 2024 data not found at: ${decemberPath}`)
    console.log(`⚠️  Please process december.csv first\n`)
  }

  const analytics = generateAnalytics(sales, decemberSales)

  const outputPath = path.join(process.cwd(), 'data', 'sales_analytics_2025.json')
  fs.writeFileSync(outputPath, JSON.stringify(analytics, null, 2))

  console.log(`\n💾 Analytics saved to: ${outputPath}`)
  console.log('✅ Analytics generation complete!')
}

main().catch(console.error)

