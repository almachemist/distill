import fs from 'fs'
import path from 'path'
import type { CustomerAnalytics } from '@/db/schemas/customerAnalytics'

interface ProcessedSale {
  date: string | Date
  month: number
  year: number
  category: string
  item: string
  qty: number
  sku: string
  netSales: number
  location: string
  customerId: string
  customerName: string
  channel: string
  count: number
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)))
}

function getPaths() {
  const root = process.cwd()
  return {
    processed: path.join(root, 'data', 'sales_processed_temp.json'),
    cache: path.join(root, 'data', 'crm_analytics_2025.json')
  }
}

function loadProcessed(): ProcessedSale[] {
  const { processed } = getPaths()
  if (!fs.existsSync(processed)) return []
  const raw = JSON.parse(fs.readFileSync(processed, 'utf-8')) as any[]
  return raw.map(r => ({
    ...r,
    date: typeof r.date === 'string' ? r.date : r.date,
  })) as ProcessedSale[]
}

function isCacheFresh(): boolean {
  const { processed, cache } = getPaths()
  if (!fs.existsSync(cache)) return false
  try {
    const p = fs.statSync(processed).mtimeMs
    const c = fs.statSync(cache).mtimeMs
    return c >= p
  } catch {
    return false
  }
}

export function generateAndCacheCustomerAnalytics(): CustomerAnalytics[] {
  const sales = loadProcessed()
  const map = new Map<string, {
    id: string
    name: string
    totalSpend: number
    totalUnits: number
    orderCount: number
    dates: number[] // timestamps (unique days)
    lastDate?: number
    firstDate?: number
    bySku: Map<string, { name: string; units: number; last: number }>
    byMonth: Map<string, number>
  }>()

  for (const s of sales) {
    if (!s.customerId) continue
    const key = s.customerId
    const entry = map.get(key) || {
      id: key,
      name: s.customerName || 'Unknown',
      totalSpend: 0,
      totalUnits: 0,
      orderCount: 0,
      dates: [] as number[],
      firstDate: undefined as number | undefined,
      lastDate: undefined as number | undefined,
      bySku: new Map(),
      byMonth: new Map(),
    }

    entry.totalSpend += s.netSales || 0
    entry.totalUnits += s.qty || 0
    entry.orderCount += s.count || 0

    const d = new Date(typeof s.date === 'string' ? s.date : (s.date as any))
    const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    if (!entry.dates.includes(dayKey)) entry.dates.push(dayKey)
    entry.firstDate = Math.min(entry.firstDate ?? dayKey, dayKey)
    entry.lastDate = Math.max(entry.lastDate ?? dayKey, dayKey)

    const skuKey = s.sku || s.item
    const sku = entry.bySku.get(skuKey) || { name: s.item, units: 0, last: 0 }
    sku.units += s.qty || 0
    sku.last = Math.max(sku.last, dayKey)
    entry.bySku.set(skuKey, sku)

    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    entry.byMonth.set(m, (entry.byMonth.get(m) || 0) + (s.netSales || 0))

    map.set(key, entry)
  }

  const today = new Date()
  const customers: CustomerAnalytics[] = []

  for (const entry of map.values()) {
    const dates = entry.dates.sort((a, b) => a - b)
    const gaps: number[] = []
    for (let i = 1; i < dates.length; i++) gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24))
    const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 30

    const lastOrderDate = new Date(entry.lastDate || Date.now())
    const firstOrderDate = new Date(entry.firstDate || Date.now())
    const dslo = daysBetween(today, lastOrderDate)
    const churnRisk = Math.min(100, Math.round((dslo / Math.max(1, avgGap)) * 100))

    const topProducts = [...entry.bySku.entries()]
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 5)
      .map(([sku, v]) => ({ sku, productName: v.name, units: v.units }))

    const monthlySpend = [...entry.byMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, spend]) => ({ month, spend }))

    const inactiveProducts = [...entry.bySku.entries()]
      .filter(([, v]) => daysBetween(today, new Date(v.last)) > 60)
      .map(([sku]) => sku)

    const alerts: string[] = []
    if (dslo > 60) alerts.push('Inactive > 60 days')
    // Reduced purchase >50%: compare last full month vs average
    if (monthlySpend.length >= 3) {
      const values = monthlySpend.map(m => m.spend)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const last = values[values.length - 1]
      if (last < 0.5 * avg) alerts.push('Reduced purchase > 50%')
    }
    if (inactiveProducts.length > 0) alerts.push('Stopped buying a product')

    customers.push({
      customerId: entry.id,
      customerName: entry.name,
      totalSpend: Number(entry.totalSpend.toFixed(2)),
      totalUnits: Math.round(entry.totalUnits),
      averageOrderValue: entry.orderCount ? Number((entry.totalSpend / entry.orderCount).toFixed(2)) : entry.totalSpend,
      orderCount: entry.orderCount,
      firstOrderDate: firstOrderDate.toISOString().slice(0, 10),
      lastOrderDate: lastOrderDate.toISOString().slice(0, 10),
      averageDaysBetweenOrders: Number(avgGap.toFixed(1)),
      daysSinceLastOrder: dslo,
      churnRisk,
      topProducts,
      monthlySpend,
      inactiveProducts,
      alerts,
    })
  }

  const { cache } = getPaths()
  fs.writeFileSync(cache, JSON.stringify({ generatedAt: new Date().toISOString(), customers }, null, 2), 'utf-8')
  return customers
}

export function getCachedCustomerAnalytics(): CustomerAnalytics[] {
  if (isCacheFresh()) {
    const { cache } = getPaths()
    try {
      const raw = JSON.parse(fs.readFileSync(cache, 'utf-8'))
      return raw.customers as CustomerAnalytics[]
    } catch {
      // fall through to regenerate
    }
  }
  return generateAndCacheCustomerAnalytics()
}

