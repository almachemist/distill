import { NextRequest, NextResponse } from 'next/server'
import { getSquareConfig } from '@/lib/square/config'
import crypto from 'crypto'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * POST /api/integrations/square/webhook
 *
 * Receives real-time webhook events from Square POS.
 * Validates the Square webhook signature before processing.
 * Handles: order.created, order.updated, customer.created, customer.updated
 *
 * NOTE: Webhooks arrive without user session context, so we use the service role
 * client here to bypass RLS. The organization_id is resolved from the merchant_id.
 *
 * @see https://developer.squareup.com/docs/webhooks/overview
 */
export async function POST(request: NextRequest) {
  const config = getSquareConfig()

  // Read the raw body for signature verification
  const rawBody = await request.text()

  // Verify webhook signature
  if (config.webhookSignatureKey) {
    const signature = request.headers.get('x-square-hmacsha256-signature')
    const notificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/integrations/square/webhook`

    if (!verifySignature(rawBody, signature, config.webhookSignatureKey, notificationUrl)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event.type
  const merchantId = event.merchant_id
  const data = event.data?.object

  if (!merchantId || !data) {
    return NextResponse.json({ error: 'Missing merchant_id or data' }, { status: 400 })
  }

  // Create service-role client for webhook processing (no user session available)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error('Supabase service role not configured for webhook processing')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const supabase = createServiceClient(supabaseUrl, serviceKey)

  // Look up the organization_id from the merchant_id
  const { data: connection } = await supabase
    .from('square_connections')
    .select('organization_id')
    .eq('merchant_id', merchantId)
    .single()

  if (!connection) {
    // No matching org — might be a stale webhook
    return NextResponse.json({ ok: true, skipped: true })
  }

  const orgId = connection.organization_id

  try {
    switch (eventType) {
      case 'order.created':
      case 'order.updated':
        await handleOrderEvent(supabase, orgId, data.order)
        break

      case 'customer.created':
      case 'customer.updated':
        await handleCustomerEvent(supabase, orgId, data.customer)
        break

      default:
        // Ignore unhandled event types
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(`Square webhook error (${eventType}):`, error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

/**
 * Verify the Square webhook HMAC-SHA256 signature.
 *
 * @param body - Raw request body string
 * @param signature - Value of x-square-hmacsha256-signature header
 * @param signatureKey - Webhook signature key from Square dashboard
 * @param notificationUrl - The webhook URL registered with Square
 * @returns true if signature is valid
 */
function verifySignature(
  body: string,
  signature: string | null,
  signatureKey: string,
  notificationUrl: string
): boolean {
  if (!signature) return false

  const hmac = crypto.createHmac('sha256', signatureKey)
  hmac.update(notificationUrl + body)
  const expected = hmac.digest('base64')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

/**
 * Upsert a Square order and its line items.
 */
async function handleOrderEvent(supabase: any, orgId: string, order: any) {
  if (!order?.id) return

  await supabase.from('square_orders').upsert(
    {
      organization_id: orgId,
      square_order_id: order.id,
      square_customer_id: order.customer_id || null,
      location_id: order.location_id,
      state: order.state,
      total_money_cents: order.total_money?.amount || 0,
      currency: order.total_money?.currency || 'AUD',
      order_date: order.created_at,
      closed_at: order.closed_at || null,
      source: order.source?.name || null,
      metadata: {
        tenders: order.tenders || [],
        discounts: order.discounts || [],
        taxes: order.taxes || [],
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,square_order_id' }
  )

  if (order.line_items?.length) {
    // Clear existing items for this order
    await supabase
      .from('square_order_items')
      .delete()
      .eq('organization_id', orgId)
      .eq('square_order_id', order.id)

    const items = order.line_items.map((item: any) => ({
      organization_id: orgId,
      square_order_id: order.id,
      square_item_id: item.catalog_object_id || null,
      item_name: item.name || 'Unknown',
      variation_name: item.variation_name || null,
      quantity: parseFloat(item.quantity) || 1,
      unit_price_cents: item.base_price_money?.amount || 0,
      total_price_cents: item.total_money?.amount || 0,
      category: item.item_type || null,
      sku: null,
    }))

    await supabase.from('square_order_items').insert(items)
  }
}

/**
 * Upsert a Square customer record.
 */
async function handleCustomerEvent(supabase: any, orgId: string, customer: any) {
  if (!customer?.id) return

  const displayName = [customer.given_name, customer.family_name]
    .filter(Boolean)
    .join(' ') || customer.company_name || 'Unknown'

  await supabase.from('square_customers').upsert(
    {
      organization_id: orgId,
      square_customer_id: customer.id,
      display_name: displayName,
      email: customer.email_address || null,
      phone: customer.phone_number || null,
      company_name: customer.company_name || null,
      metadata: {
        reference_id: customer.reference_id,
        note: customer.note,
        preferences: customer.preferences,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,square_customer_id' }
  )
}
