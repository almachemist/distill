'use client'

import { useState } from 'react'
import { useOrganization } from '@/modules/settings/hooks/useOrganization'
import { useAuth } from '@/modules/auth/hooks/useAuth'

const TIERS = [
  {
    id: 'free',
    label: 'Free',
    price: 0,
    features: ['3 team members', '50 barrels', '20 batches/month'],
  },
  {
    id: 'starter',
    label: 'Starter',
    price: 49,
    features: ['5 team members', '100 barrels', '50 batches/month', '14-day free trial'],
  },
  {
    id: 'professional',
    label: 'Professional',
    price: 99,
    popular: true,
    features: ['15 team members', '500 barrels', 'Unlimited batches', '14-day free trial'],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 249,
    features: ['Unlimited users', 'Unlimited barrels', 'Unlimited batches', 'Priority support', '14-day free trial'],
  },
]

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-red-100 text-red-800',
  inactive: 'bg-neutral-100 text-neutral-600',
}

export default function SubscriptionTab() {
  const { data: org, isLoading } = useOrganization()
  const { user } = useAuth()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const handleCheckout = async (tier: string) => {
    if (!org?.id) return
    setLoadingTier(tier)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, organizationId: org.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to create checkout session')
    } catch {
      alert('Failed to start checkout')
    } finally {
      setLoadingTier(null)
    }
  }

  const handlePortal = async () => {
    if (!org?.id) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: org.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to open billing portal')
    } catch {
      alert('Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    )
  }

  if (!org) {
    return <p className="text-neutral-500 py-8 text-center">Organization not found.</p>
  }

  const currentTier = org.subscription_tier || 'free'
  const statusStyle = STATUS_STYLES[org.subscription_status] || STATUS_STYLES.inactive

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">Subscription</h2>
        <p className="text-sm text-neutral-500">Manage your plan and billing details.</p>
      </div>

      {/* Current plan banner */}
      <section className="border border-neutral-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 capitalize">{currentTier}</h3>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle}`}>
              {org.subscription_status}
            </span>
          </div>
          {org.stripe_customer_id && (
            <button onClick={handlePortal} disabled={portalLoading}
              className="px-5 py-2 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {portalLoading ? 'Opening...' : 'Manage billing'}
            </button>
          )}
        </div>

        {org.trial_ends_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-4">
            Trial ends {new Date(org.trial_ends_at).toLocaleDateString('en-AU', { dateStyle: 'long' })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UsageCard label="Team members" max={org.max_users} />
          <UsageCard label="Barrels tracked" max={org.max_barrels} />
          <UsageCard label="Batches / month" max={org.max_batches_per_month} />
        </div>
      </section>

      {/* Pricing grid */}
      <section>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier) => {
            const isCurrent = tier.id === currentTier
            return (
              <div key={tier.id} className={`relative rounded-xl border p-5 transition-shadow ${
                tier.popular ? 'border-copper shadow-md' : 'border-neutral-200'
              } ${isCurrent ? 'bg-copper/5' : 'bg-white'}`}>
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-copper text-white text-xs font-medium px-3 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <h4 className="text-lg font-semibold text-neutral-900">{tier.label}</h4>
                <p className="text-2xl font-bold text-neutral-900 mt-2">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                  {tier.price > 0 && <span className="text-sm font-normal text-neutral-500">/mo AUD</span>}
                </p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-copper mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <span className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-500">
                      Current plan
                    </span>
                  ) : tier.id === 'free' ? (
                    <span className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium bg-neutral-50 text-neutral-400">
                      —
                    </span>
                  ) : (
                    <button onClick={() => handleCheckout(tier.id)} disabled={loadingTier === tier.id}
                      className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium bg-copper text-white hover:bg-copper/90 transition-colors disabled:opacity-50">
                      {loadingTier === tier.id ? 'Redirecting...' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function UsageCard({ label, max }: { label: string; max: number }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-4">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-neutral-900">
        {max >= 999 ? 'Unlimited' : `Up to ${max}`}
      </p>
    </div>
  )
}
