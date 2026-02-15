import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSquareConfig } from '@/lib/square/config'

/**
 * POST /api/integrations/square/disconnect
 *
 * Revokes the Square OAuth token and deletes the connection row from Supabase.
 * Synced data (orders, customers, etc.) remains in the database.
 *
 * @see https://developer.squareup.com/docs/oauth-api/revoke-and-limit-tokens
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

    // Fetch the existing connection to get the access token for revocation
    const { data: connection } = await supabase
      .from('square_connections')
      .select('id, access_token, merchant_id')
      .eq('organization_id', profile.organization_id)
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'No Square connection found' }, { status: 404 })
    }

    // Revoke the token with Square
    const config = getSquareConfig()
    try {
      await fetch(`${config.apiBaseUrl}/oauth2/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Client ${config.applicationSecret}`,
        },
        body: JSON.stringify({
          client_id: config.applicationId,
          access_token: connection.access_token,
        }),
      })
    } catch (revokeError) {
      // Log but don't block — token may already be expired
      console.warn('Square token revocation failed (non-fatal):', revokeError)
    }

    // Delete the connection row
    const { error: deleteError } = await supabase
      .from('square_connections')
      .delete()
      .eq('id', connection.id)

    if (deleteError) {
      console.error('Failed to delete Square connection:', deleteError)
      return NextResponse.json({ error: 'Failed to remove connection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Square disconnect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
