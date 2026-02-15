'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/modules/auth/hooks/useAuth'

/**
 * Shape expected by the CRM ClientGroups component.
 * Each "group" is a single Square customer mapped to this view.
 * When customer_groups config is implemented, multiple Square customers
 * can be merged into one group via aliases.
 */
export interface CrmCustomerGroup {
  id: string
  groupName: string
  aliases: string[]
  emails: string[]
  totalSpend: number
  totalUnits: number
  firstPurchase: string
  lastPurchase: string
  daysSinceLastOrder: number
  averageDaysBetweenOrders: number
  churnRisk: number
  childAccounts: CrmChildAccount[]
}

export interface CrmChildAccount {
  customerId: string
  customerName: string
  totalSpend: number
  totalUnits: number
  firstOrderDate: string
  lastOrderDate: string
  daysSinceLastOrder: number
  averageDaysBetweenOrders: number
  churnRisk: number
}

const CRM_KEY = ['crm-customers'] as const

/**
 * Fetches Square customers from Supabase and maps them to CRM group format.
 * Each Square customer becomes a single-member "group" for now.
 *
 * @returns React Query result with CrmCustomerGroup[]
 */
export function useCrmCustomers() {
  const { user } = useAuth()
  const orgId = user?.organizationId

  return useQuery<CrmCustomerGroup[]>({
    queryKey: [...CRM_KEY, orgId],
    queryFn: async () => {
      if (!orgId) return []
      const supabase = createClient()

      const { data: customers, error } = await supabase
        .from('square_customers')
        .select('*')
        .eq('organization_id', orgId)
        .order('total_spend_cents', { ascending: false })

      if (error) throw error
      if (!customers?.length) return []

      const today = new Date()

      return customers.map((c: any): CrmCustomerGroup => {
        const totalSpend = (c.total_spend_cents || 0) / 100
        const totalUnits = c.total_units || 0
        const firstDate = c.first_order_date || ''
        const lastDate = c.last_order_date || ''

        const daysSince = lastDate
          ? Math.max(0, Math.round((today.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)))
          : 999

        // Estimate average days between orders from order_count and date range
        const orderCount = c.order_count || 1
        let avgDaysBetween = 30
        if (firstDate && lastDate && orderCount > 1) {
          const rangeDays = Math.max(1, Math.round(
            (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)
          ))
          avgDaysBetween = Math.round(rangeDays / (orderCount - 1))
        }

        const churnRisk = Math.min(100, Math.round((daysSince / Math.max(1, avgDaysBetween)) * 100))

        const child: CrmChildAccount = {
          customerId: c.square_customer_id,
          customerName: c.display_name || 'Unknown',
          totalSpend,
          totalUnits,
          firstOrderDate: firstDate,
          lastOrderDate: lastDate,
          daysSinceLastOrder: daysSince,
          averageDaysBetweenOrders: avgDaysBetween,
          churnRisk,
        }

        return {
          id: c.id,
          groupName: c.display_name || 'Unknown',
          aliases: [c.display_name].filter(Boolean),
          emails: [c.email].filter(Boolean),
          totalSpend,
          totalUnits,
          firstPurchase: firstDate,
          lastPurchase: lastDate,
          daysSinceLastOrder: daysSince,
          averageDaysBetweenOrders: avgDaysBetween,
          churnRisk,
          childAccounts: [child],
        }
      })
    },
    enabled: !!orgId,
  })
}
