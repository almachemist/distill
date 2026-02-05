import { NextResponse } from 'next/server'
import { getCachedCustomerAnalytics } from '@/modules/crm/analytics'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type ContextWithIdParam = { params: { id: string } }

export async function GET(
  _req: Request,
  context: ContextWithIdParam
) {
  try {
    const { id } = context.params
    const customers = getCachedCustomerAnalytics()
    const customer = customers.find(c => c.customerId === id)
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ customer }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (e) {
    console.error('GET /api/crm/customer/[id] error:', e)
    return NextResponse.json({ error: 'Failed to load customer' }, { status: 500 })
  }
}
