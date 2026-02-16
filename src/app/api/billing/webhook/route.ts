import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PRICE_TIER_MAP, TIER_LIMITS } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Use service role client for webhook (no user session)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars for webhook')
  return createClient(url, key)
}

/**
 * POST /api/billing/webhook
 * Stripe webhook handler for subscription lifecycle events.
 */
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const orgId = session.metadata?.organization_id
        const tier = session.metadata?.tier
        if (orgId && tier && session.subscription) {
          const limits = TIER_LIMITS[tier] || TIER_LIMITS.free
          await supabase.from('organizations').update({
            stripe_subscription_id: session.subscription as string,
            subscription_tier: tier,
            subscription_status: 'trialing',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            ...limits,
          }).eq('id', orgId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const orgId = subscription.metadata?.organization_id
        if (orgId) {
          const priceId = subscription.items.data[0]?.price?.id
          const tier = priceId ? (PRICE_TIER_MAP[priceId] || 'free') : 'free'
          const limits = TIER_LIMITS[tier] || TIER_LIMITS.free
          await supabase.from('organizations').update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            trial_ends_at: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            ...limits,
          }).eq('id', orgId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const orgId = subscription.metadata?.organization_id
        if (orgId) {
          const limits = TIER_LIMITS.free
          await supabase.from('organizations').update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            trial_ends_at: null,
            ...limits,
          }).eq('id', orgId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subId = (invoice as any).subscription
        if (subId) {
          // Find org by subscription ID
          const { data: orgs } = await supabase
            .from('organizations')
            .select('id')
            .eq('stripe_subscription_id', subId)
            .limit(1)
          if (orgs?.[0]) {
            await supabase.from('organizations').update({
              subscription_status: 'past_due',
            }).eq('id', orgs[0].id)
          }
        }
        break
      }

      default:
        // Unhandled event type
        break
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
