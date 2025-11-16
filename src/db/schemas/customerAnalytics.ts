export interface CustomerTopProduct {
  sku: string
  productName: string
  units: number
}

export interface CustomerMonthlySpend {
  month: string // YYYY-MM
  spend: number
}

export interface CustomerAnalytics {
  customerId: string
  customerName: string

  totalSpend: number
  totalUnits: number
  averageOrderValue: number
  orderCount: number

  firstOrderDate: string
  lastOrderDate: string
  averageDaysBetweenOrders: number
  daysSinceLastOrder: number
  churnRisk: number // 0-100

  topProducts: CustomerTopProduct[]
  monthlySpend: CustomerMonthlySpend[]
  inactiveProducts: string[]

  alerts?: string[]
}

