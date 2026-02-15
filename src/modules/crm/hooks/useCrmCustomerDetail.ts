'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/modules/auth/hooks/useAuth'

/**
 * Detailed customer profile built from square_customers + square_orders + square_order_items.
 */
export interface CrmCustomerDetail {
  customerId: string
  customerName: string
  email: string | null
  phone: string | null
  companyName: string | null
  totalSpend: number
  totalUnits: number
  averageOrderValue: number
  orderCount: number
  firstOrderDate: string
  lastOrderDate: string
  averageDaysBetweenOrders: number
  daysSinceLastOrder: number
  churnRisk: number
  topProducts: { sku: string; productName: string; units: number }[]
  monthlySpend: { month: string; spend: number }[]
  inactiveProducts: string[]
  alerts: string[]
}

/**
 * Fetches a single customer's full CRM profile from Supabase.
 * Aggregates order items for top products and monthly spend breakdown.
 *
 * @param squareCustomerId - The Square customer ID (from URL param)
 * @returns React Query result with CrmCustomerDetail
 */
export function useCrmCustomerDetail(squareCustomerId: string | null) {
  const { user } = useAuth()
  const orgId = user?.organizationId

  return useQuery<CrmCustomerDetail | null>({
    queryKey: ['crm-customer-detail', orgId, squareCustomerId],
    queryFn: async () => {
      if (!orgId || !squareCustomerId) return null
      const supabase = createClient()

      // Fetch the customer record
      const { data: customer, error: custError } = await supabase
        .from('square_customers')
        .select('*')
        .eq('organization_id', orgId)
        .eq('square_customer_id', squareCustomerId)
        .single()

      if (custError || !customer) return null

      // Fetch orders for this customer
      const { data: orders } = await supabase
        .from('square_orders')
        .select('square_order_id, order_date, total_money_cents, currency')
        .eq('organization_id', orgId)
        .eq('square_customer_id', squareCustomerId)
        .eq('state', 'COMPLETED')
        .order('order_date', { ascending: true })

      // Fetch order items for all this customer's orders
      const orderIds = (orders || []).map((o: any) => o.square_order_id)
      let items: any[] = []
      if (orderIds.length > 0) {
        const { data: itemData } = await supabase
          .from('square_order_items')
          .select('item_name, variation_name, quantity, total_price_cents, square_order_id')
          .eq('organization_id', orgId)
          .in('square_order_id', orderIds)

        items = itemData || []
      }

      // Compute metrics
      const today = new Date()
      const totalSpend = (customer.total_spend_cents || 0) / 100
      const totalUnits = customer.total_units || 0
      const orderCount = customer.order_count || (orders?.length || 0)
      const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0

      const firstDate = customer.first_order_date || ''
      const lastDate = customer.last_order_date || ''
      const daysSince = lastDate
        ? Math.max(0, Math.round((today.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 999

      let avgDaysBetween = 30
      if (firstDate && lastDate && orderCount > 1) {
        const rangeDays = Math.max(1, Math.round(
          (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)
        ))
        avgDaysBetween = Math.round(rangeDays / (orderCount - 1))
      }

      const churnRisk = Math.min(100, Math.round((daysSince / Math.max(1, avgDaysBetween)) * 100))

      // Top products by units
      const productMap = new Map<string, { name: string; units: number; lastSeen: string }>()
      for (const item of items) {
        const key = item.item_name || 'Unknown'
        const existing = productMap.get(key) || { name: key, units: 0, lastSeen: '' }
        existing.units += Number(item.quantity) || 0
        // Track last seen via order date
        const orderMatch = (orders || []).find((o: any) => o.square_order_id === item.square_order_id)
        if (orderMatch?.order_date && orderMatch.order_date > existing.lastSeen) {
          existing.lastSeen = orderMatch.order_date
        }
        productMap.set(key, existing)
      }

      const topProducts = [...productMap.entries()]
        .sort((a, b) => b[1].units - a[1].units)
        .slice(0, 10)
        .map(([sku, v]) => ({ sku, productName: v.name, units: v.units }))

      // Inactive products (not purchased in 60+ days)
      const cutoff = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
      const inactiveProducts = [...productMap.entries()]
        .filter(([, v]) => v.lastSeen && v.lastSeen < cutoff)
        .map(([sku]) => sku)

      // Monthly spend from orders
      const monthMap = new Map<string, number>()
      for (const order of (orders || [])) {
        const d = new Date(order.order_date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthMap.set(key, (monthMap.get(key) || 0) + (order.total_money_cents || 0) / 100)
      }
      const monthlySpend = [...monthMap.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, spend]) => ({ month, spend }))

      // Alerts
      const alerts: string[] = []
      if (daysSince > 60) alerts.push('Inactive > 60 days')
      if (monthlySpend.length >= 3) {
        const values = monthlySpend.map((m) => m.spend)
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const last = values[values.length - 1]
        if (last < 0.5 * avg) alerts.push('Reduced purchase > 50%')
      }
      if (inactiveProducts.length > 0) alerts.push('Stopped buying a product')

      return {
        customerId: customer.square_customer_id,
        customerName: customer.display_name || 'Unknown',
        email: customer.email,
        phone: customer.phone,
        companyName: customer.company_name,
        totalSpend,
        totalUnits,
        averageOrderValue: Number(avgOrderValue.toFixed(2)),
        orderCount,
        firstOrderDate: firstDate,
        lastOrderDate: lastDate,
        averageDaysBetweenOrders: avgDaysBetween,
        daysSinceLastOrder: daysSince,
        churnRisk,
        topProducts,
        monthlySpend,
        inactiveProducts,
        alerts,
      }
    },
    enabled: !!orgId && !!squareCustomerId,
  })
}
