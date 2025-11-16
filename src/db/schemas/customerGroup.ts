import type { CustomerAnalytics } from './customerAnalytics'

export type CustomerGroupDef = {
  groupName: string
  aliases: string[]
  emails?: string[]
  notes?: string
}

export type GroupChild = Pick<
  CustomerAnalytics,
  | 'customerId'
  | 'customerName'
  | 'totalSpend'
  | 'totalUnits'
  | 'firstOrderDate'
  | 'lastOrderDate'
  | 'daysSinceLastOrder'
  | 'averageDaysBetweenOrders'
  | 'churnRisk'
>

export type CustomerGroupView = {
  id: string
  groupName: string
  aliases: string[]
  emails?: string[]
  totalSpend: number
  totalUnits: number
  firstPurchase: string
  lastPurchase: string
  daysSinceLastOrder: number
  averageDaysBetweenOrders: number
  churnRisk: number
  childAccounts: GroupChild[]
}

