import { NextResponse } from 'next/server'
import { getCachedCustomerAnalytics } from '@/modules/crm/analytics'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const customers = getCachedCustomerAnalytics()

    const table = customers.map(c => ({
      customerId: c.customerId,
      customerName: c.customerName,
      totalSpend: c.totalSpend,
      totalUnits: c.totalUnits,
      lastOrderDate: c.lastOrderDate,
      churnRisk: c.churnRisk,
      topProduct: c.topProducts[0]?.productName || '—',
      inactiveSince: c.daysSinceLastOrder,
      alerts: c.alerts || []
    }))

    return NextResponse.json({ customers: table }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (e) {
    console.error('GET /api/crm/customers error:', e)
    return NextResponse.json({ error: 'Failed to build CRM customers' }, { status: 500 })
  }
}
