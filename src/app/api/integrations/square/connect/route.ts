import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSquareConfig } from '@/lib/square/config'
import crypto from 'crypto'

/**
 * GET /api/integrations/square/connect
 *
 * Initiates the Square OAuth flow by redirecting the user to Square's authorization page.
 * Generates a CSRF state token stored in cookies and passes it to Square.
 *
 * @see https://developer.squareup.com/docs/oauth-api/create-urls-for-square-authorization
 */
export async function GET() {
  try {
    // Verify the user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    }

    const config = getSquareConfig()

    if (!config.applicationId) {
      return NextResponse.json(
        { error: 'Square application ID is not configured' },
        { status: 500 }
      )
    }

    // Generate a CSRF state token
    const state = crypto.randomBytes(32).toString('hex')

    // Build the Square OAuth authorization URL
    const params = new URLSearchParams({
      client_id: config.applicationId,
      scope: config.scopes.join(' '),
      session: 'false',
      state,
    })

    const redirectUrl = `${config.oauthBaseUrl}/oauth2/authorize?${params.toString()}`

    // Store state in a cookie for CSRF verification in the callback
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('square_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Square OAuth connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Square OAuth' },
      { status: 500 }
    )
  }
}
