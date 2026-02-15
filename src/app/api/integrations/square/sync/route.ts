import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSquareConfig } from '@/lib/square/config'

/**
 * POST /api/integrations/square/sync
 *
 * Triggers a manual sync of orders and customers from Square.
 * Pulls data from the last 30 days (or since last_sync_at).
 * Updates sync_status on the connection row throughout the process.
 *
 * @returns JSON with sync summary (orders/customers synced counts)
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    const orgId = profile.organization_id

    // Fetch the Square connection
    const { data: connection } = await supabase
      .from('square_connections')
      .select('*')
      .eq('organization_id', orgId)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'No Square connection found' }, { status: 404 })
    }

    // Mark sync as in progress
    await supabase
      .from('square_connections')
      .update({ sync_status: 'syncing', updated_at: new Date().toISOString() })
      .eq('id', connection.id)

    const config = getSquareConfig()
    const accessToken = connection.access_token
    let ordersSynced = 0
    let customersSynced = 0

    try {
      // Determine sync window: from last_sync_at or 30 days ago
      const sinceDate = connection.last_sync_at
        ? new Date(connection.last_sync_at)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // --- Sync Orders ---
      ordersSynced = await syncOrders(config, accessToken, orgId, sinceDate, connection.location_ids || [], supabase)

      // --- Sync Customers ---
      customersSynced = await syncCustomers(config, accessToken, orgId, supabase)

      // Mark sync as complete
      await supabase
        .from('square_connections')
        .update({
          sync_status: 'idle',
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id)

      return NextResponse.json({
        success: true,
        ordersSynced,
        customersSynced,
      })
    } catch (syncError) {
      console.error('Square sync error:', syncError)

      // Mark sync as errored
      await supabase
        .from('square_connections')
        .update({ sync_status: 'error', updated_at: new Date().toISOString() })
        .eq('id', connection.id)

      return NextResponse.json(
        { error: 'Sync failed', details: syncError instanceof Error ? syncError.message : 'Unknown error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Square sync route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Sync orders from Square for the given locations since a given date.
 * Uses the Square Search Orders API with pagination.
 *
 * @param config - Square API config
 * @param accessToken - Square OAuth access token
 * @param orgId - Organization UUID
 * @param sinceDate - Fetch orders created after this date
 * @param locationIds - Square location IDs to query
 * @param supabase - Supabase client instance
 * @returns Number of orders upserted
 */
async function syncOrders(
  config: ReturnType<typeof getSquareConfig>,
  accessToken: string,
  orgId: string,
  sinceDate: Date,
  locationIds: string[],
  supabase: any
): Promise<number> {
  if (!locationIds.length) return 0

  let cursor: string | undefined
  let totalSynced = 0

  do {
    const body: any = {
      location_ids: locationIds,
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: sinceDate.toISOString(),
            },
          },
          state_filter: {
            states: ['COMPLETED'],
          },
        },
        sort: {
          sort_field: 'CREATED_AT',
          sort_order: 'DESC',
        },
      },
      limit: 100,
    }
    if (cursor) body.cursor = cursor

    const res = await fetch(`${config.apiBaseUrl}/v2/orders/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Square orders search failed (${res.status}): ${errBody}`)
    }

    const data = await res.json()
    const orders = data.orders || []

    for (const order of orders) {
      // Upsert order
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

      // Upsert line items
      if (order.line_items?.length) {
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

        // Delete existing items for this order, then insert fresh
        await supabase
          .from('square_order_items')
          .delete()
          .eq('organization_id', orgId)
          .eq('square_order_id', order.id)

        await supabase.from('square_order_items').insert(items)
      }

      totalSynced++
    }

    cursor = data.cursor
  } while (cursor)

  return totalSynced
}

/**
 * Sync customers from Square.
 * Uses the Square List Customers API with pagination.
 *
 * @param config - Square API config
 * @param accessToken - Square OAuth access token
 * @param orgId - Organization UUID
 * @param supabase - Supabase client instance
 * @returns Number of customers upserted
 */
async function syncCustomers(
  config: ReturnType<typeof getSquareConfig>,
  accessToken: string,
  orgId: string,
  supabase: any
): Promise<number> {
  let cursor: string | undefined
  let totalSynced = 0

  do {
    const params = new URLSearchParams({ limit: '100' })
    if (cursor) params.set('cursor', cursor)

    const res = await fetch(`${config.apiBaseUrl}/v2/customers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      const errBody = await res.text()
      throw new Error(`Square customers list failed (${res.status}): ${errBody}`)
    }

    const data = await res.json()
    const customers = data.customers || []

    for (const customer of customers) {
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
      totalSynced++
    }

    cursor = data.cursor
  } while (cursor)

  return totalSynced
}
