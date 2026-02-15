import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSquareConfig } from '@/lib/square/config'

/**
 * GET /api/integrations/square/callback
 *
 * Handles the OAuth callback from Square after user authorization.
 * Exchanges the authorization code for access/refresh tokens and stores them in Supabase.
 *
 * @see https://developer.squareup.com/docs/oauth-api/obtain-and-manage-tokens
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')
  const settingsUrl = new URL('/dashboard/settings', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

  // Handle errors from Square (user denied, etc.)
  if (errorParam) {
    settingsUrl.searchParams.set('square_error', errorParam)
    return NextResponse.redirect(settingsUrl)
  }

  if (!code || !state) {
    settingsUrl.searchParams.set('square_error', 'missing_params')
    return NextResponse.redirect(settingsUrl)
  }

  // Verify CSRF state token
  const storedState = request.cookies.get('square_oauth_state')?.value
  if (!storedState || storedState !== state) {
    settingsUrl.searchParams.set('square_error', 'invalid_state')
    return NextResponse.redirect(settingsUrl)
  }

  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    }

    // Get the user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      settingsUrl.searchParams.set('square_error', 'no_organization')
      return NextResponse.redirect(settingsUrl)
    }

    // Exchange authorization code for tokens
    const config = getSquareConfig()
    const tokenUrl = `${config.apiBaseUrl}/oauth2/token`

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.applicationId,
        client_secret: config.applicationSecret,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Square token exchange failed:', tokenData)
      settingsUrl.searchParams.set('square_error', 'token_exchange_failed')
      return NextResponse.redirect(settingsUrl)
    }

    // Fetch merchant info to get merchant_id and locations
    const merchantResponse = await fetch(`${config.apiBaseUrl}/v2/merchants/me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const merchantData = await merchantResponse.json()
    const merchantId = merchantData.merchant?.id || null

    // Fetch locations
    let locationIds: string[] = []
    try {
      const locResponse = await fetch(`${config.apiBaseUrl}/v2/locations`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const locData = await locResponse.json()
      locationIds = (locData.locations || []).map((loc: any) => loc.id)
    } catch {
      // Non-fatal — locations can be synced later
    }

    // Upsert connection in Supabase
    const { error: upsertError } = await supabase
      .from('square_connections')
      .upsert(
        {
          organization_id: profile.organization_id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          merchant_id: merchantId,
          location_ids: locationIds,
          token_expires_at: tokenData.expires_at || null,
          sync_status: 'idle',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id' }
      )

    if (upsertError) {
      console.error('Failed to store Square connection:', upsertError)
      settingsUrl.searchParams.set('square_error', 'storage_failed')
      return NextResponse.redirect(settingsUrl)
    }

    // Clear the CSRF cookie and redirect to settings with success
    settingsUrl.searchParams.set('square_connected', '1')
    const response = NextResponse.redirect(settingsUrl)
    response.cookies.delete('square_oauth_state')
    return response
  } catch (error) {
    console.error('Square OAuth callback error:', error)
    settingsUrl.searchParams.set('square_error', 'unexpected_error')
    return NextResponse.redirect(settingsUrl)
  }
}
