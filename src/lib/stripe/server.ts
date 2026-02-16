import Stripe from 'stripe'

let _stripe: Stripe | null = null

/** Lazily initialised Stripe client – avoids crashing at build time when env vars are absent. */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY environment variable')
    _stripe = new Stripe(key, { apiVersion: '2026-01-28.clover', typescript: true })
  }
  return _stripe
}

/** Map subscription tier to Stripe price ID */
export const TIER_PRICE_MAP: Record<string, string> = {
  starter: 'price_1T1I3HF5cJQ9rWgyyJejBJv9',
  professional: 'price_1T1I3MF5cJQ9rWgyEkYcOvCP',
  enterprise: 'price_1T1I3RF5cJQ9rWgyxx7thJBK',
}

/** Map Stripe price ID back to tier */
export const PRICE_TIER_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(TIER_PRICE_MAP).map(([tier, priceId]) => [priceId, tier])
)

/** Tier limits configuration */
export const TIER_LIMITS: Record<string, { max_users: number; max_barrels: number; max_batches_per_month: number }> = {
  free: { max_users: 3, max_barrels: 50, max_batches_per_month: 20 },
  starter: { max_users: 5, max_barrels: 100, max_batches_per_month: 50 },
  professional: { max_users: 15, max_barrels: 500, max_batches_per_month: 999 },
  enterprise: { max_users: 999, max_barrels: 999, max_batches_per_month: 999 },
}
