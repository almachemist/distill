import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, TIER_PRICE_MAP } from '@/lib/stripe/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/billing/checkout
 * Creates a Stripe Checkout Session for upgrading a subscription.
 * Body: { tier: 'starter' | 'professional' | 'enterprise', organizationId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { tier, organizationId } = await req.json()

    if (!tier || !organizationId) {
      return NextResponse.json({ error: 'Missing tier or organizationId' }, { status: 400 })
    }

    const priceId = TIER_PRICE_MAP[tier]
    if (!priceId) {
      return NextResponse.json({ error: `Invalid tier: ${tier}` }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user has access to this org
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only owners and admins can manage billing' }, { status: 403 })
    }

    // Get or create Stripe customer
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id, name')
      .eq('id', organizationId)
      .single()

    let customerId = org?.stripe_customer_id

    if (!customerId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      const customer = await getStripe().customers.create({
        email: profile?.email || user.email || '',
        name: org?.name || '',
        metadata: { organization_id: organizationId, supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId)
    }

    // Create checkout session
    const origin = req.headers.get('origin') || 'http://localhost:3000'

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/settings?tab=subscription&checkout=success`,
      cancel_url: `${origin}/dashboard/settings?tab=subscription&checkout=canceled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { organization_id: organizationId, tier },
      },
      metadata: { organization_id: organizationId, tier },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
