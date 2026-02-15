'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/modules/auth/hooks/useAuth'

/**
 * Sales analytics shape matching what the sales page expects.
 * Computed from square_orders + square_order_items + square_customers.
 */
export interface SalesAnalytics {
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
  byProduct: Array<{
    item: string
    category: string
    totalNetSales: number
    totalUnits: number
    avgPrice: number
    salesCount: number
  }>
  byChannel: Array<{
    channel: string
    totalNetSales: number
    totalUnits: number
    salesCount: number
  }>
  byCustomer: Array<{
    customerId: string
    customerName: string
    totalNetSales: number
    totalUnits: number
    purchaseCount: number
    avgTicket: number
  }>
  byMonth: Array<{
    month: number
    monthName: string
    totalNetSales: number
    totalUnits: number
    salesCount: number
    avgTicket: number
    isProjected: boolean
  }>
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Fetches and computes sales analytics from square_orders + square_order_items.
 * Returns the same shape as the legacy sales_analytics_2025.json.
 *
 * @returns React Query result with SalesAnalytics
 */
export function useSalesAnalytics() {
  const { user } = useAuth()
  const orgId = user?.organizationId

  return useQuery<SalesAnalytics | null>({
    queryKey: ['sales-analytics', orgId],
    queryFn: async () => {
      if (!orgId) return null
      const supabase = createClient()

      // Fetch all completed orders
      const { data: orders, error: ordErr } = await supabase
        .from('square_orders')
        .select('square_order_id, square_customer_id, total_money_cents, order_date, source')
        .eq('organization_id', orgId)
        .eq('state', 'COMPLETED')
        .order('order_date', { ascending: true })

      if (ordErr) throw ordErr
      if (!orders?.length) return null

      // Fetch all order items
      const orderIds = orders.map((o: any) => o.square_order_id)
      const { data: items } = await supabase
        .from('square_order_items')
        .select('square_order_id, item_name, category, quantity, total_price_cents')
        .eq('organization_id', orgId)
        .in('square_order_id', orderIds)

      // Fetch customers for name lookup
      const customerIds = [...new Set(orders.filter((o: any) => o.square_customer_id).map((o: any) => o.square_customer_id))]
      let customerMap = new Map<string, string>()
      if (customerIds.length > 0) {
        const { data: customers } = await supabase
          .from('square_customers')
          .select('square_customer_id, display_name')
          .eq('organization_id', orgId)
          .in('square_customer_id', customerIds)

        customerMap = new Map((customers || []).map((c: any) => [c.square_customer_id, c.display_name]))
      }

      // --- Compute analytics ---
      const allItems = items || []
      const totalNetSales = orders.reduce((s: number, o: any) => s + (o.total_money_cents || 0), 0) / 100
      const totalUnits = allItems.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0)
      const totalSalesCount = orders.length
      const avgTicket = totalSalesCount > 0 ? totalNetSales / totalSalesCount : 0

      const dates = orders.map((o: any) => o.order_date).filter(Boolean).sort()
      const uniqueProducts = new Set(allItems.map((i: any) => i.item_name)).size
      const uniqueCustomers = new Set(orders.filter((o: any) => o.square_customer_id).map((o: any) => o.square_customer_id)).size
      const uniqueChannels = new Set(orders.map((o: any) => o.source || 'Unknown').filter(Boolean)).size

      // By product
      const productMap = new Map<string, { category: string; sales: number; units: number; count: number }>()
      for (const item of allItems) {
        const key = item.item_name || 'Unknown'
        const e = productMap.get(key) || { category: item.category || '', sales: 0, units: 0, count: 0 }
        e.sales += (item.total_price_cents || 0) / 100
        e.units += Number(item.quantity) || 0
        e.count++
        productMap.set(key, e)
      }
      const byProduct = [...productMap.entries()]
        .map(([item, v]) => ({
          item,
          category: v.category,
          totalNetSales: Number(v.sales.toFixed(2)),
          totalUnits: v.units,
          avgPrice: v.units > 0 ? Number((v.sales / v.units).toFixed(2)) : 0,
          salesCount: v.count,
        }))
        .sort((a, b) => b.totalNetSales - a.totalNetSales)

      // By channel (source)
      const channelMap = new Map<string, { sales: number; units: number; count: number }>()
      for (const order of orders) {
        const ch = (order as any).source || 'Unknown'
        const e = channelMap.get(ch) || { sales: 0, units: 0, count: 0 }
        e.sales += ((order as any).total_money_cents || 0) / 100
        e.count++
        channelMap.set(ch, e)
      }
      // Add units per channel from items
      const orderChannelMap = new Map(orders.map((o: any) => [o.square_order_id, o.source || 'Unknown']))
      for (const item of allItems) {
        const ch = orderChannelMap.get(item.square_order_id) || 'Unknown'
        const e = channelMap.get(ch)
        if (e) e.units += Number(item.quantity) || 0
      }
      const byChannel = [...channelMap.entries()]
        .map(([channel, v]) => ({
          channel,
          totalNetSales: Number(v.sales.toFixed(2)),
          totalUnits: v.units,
          salesCount: v.count,
        }))
        .sort((a, b) => b.totalNetSales - a.totalNetSales)

      // By customer
      const custAgg = new Map<string, { sales: number; units: number; count: number }>()
      for (const order of orders) {
        const cid = (order as any).square_customer_id || 'anonymous'
        const e = custAgg.get(cid) || { sales: 0, units: 0, count: 0 }
        e.sales += ((order as any).total_money_cents || 0) / 100
        e.count++
        custAgg.set(cid, e)
      }
      for (const item of allItems) {
        const order = orders.find((o: any) => o.square_order_id === item.square_order_id)
        const cid = (order as any)?.square_customer_id || 'anonymous'
        const e = custAgg.get(cid)
        if (e) e.units += Number(item.quantity) || 0
      }
      const byCustomer = [...custAgg.entries()]
        .map(([cid, v]) => ({
          customerId: cid,
          customerName: customerMap.get(cid) || (cid === 'anonymous' ? 'Walk-in' : 'Unknown'),
          totalNetSales: Number(v.sales.toFixed(2)),
          totalUnits: v.units,
          purchaseCount: v.count,
          avgTicket: v.count > 0 ? Number((v.sales / v.count).toFixed(2)) : 0,
        }))
        .sort((a, b) => b.totalNetSales - a.totalNetSales)

      // By month
      const monthAgg = new Map<number, { sales: number; units: number; count: number }>()
      for (const order of orders) {
        const d = new Date((order as any).order_date)
        const m = d.getMonth() + 1
        const e = monthAgg.get(m) || { sales: 0, units: 0, count: 0 }
        e.sales += ((order as any).total_money_cents || 0) / 100
        e.count++
        monthAgg.set(m, e)
      }
      for (const item of allItems) {
        const order = orders.find((o: any) => o.square_order_id === item.square_order_id)
        if (order) {
          const d = new Date((order as any).order_date)
          const m = d.getMonth() + 1
          const e = monthAgg.get(m)
          if (e) e.units += Number(item.quantity) || 0
        }
      }
      const byMonth = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1
        const e = monthAgg.get(m) || { sales: 0, units: 0, count: 0 }
        return {
          month: m,
          monthName: MONTH_NAMES[i],
          totalNetSales: Number(e.sales.toFixed(2)),
          totalUnits: e.units,
          salesCount: e.count,
          avgTicket: e.count > 0 ? Number((e.sales / e.count).toFixed(2)) : 0,
          isProjected: false,
        }
      })

      return {
        summary: {
          totalNetSales: Number(totalNetSales.toFixed(2)),
          totalGrossSales: Number(totalNetSales.toFixed(2)),
          totalUnits,
          totalDiscounts: 0,
          totalSalesCount,
          avgTicket: Number(avgTicket.toFixed(2)),
          dateRange: { start: dates[0] || '', end: dates[dates.length - 1] || '' },
          uniqueProducts,
          uniqueCustomers,
          uniqueChannels,
        },
        byProduct,
        byChannel,
        byCustomer,
        byMonth,
      }
    },
    enabled: !!orgId,
  })
}
