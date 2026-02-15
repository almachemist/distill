'use client'

import { useOrganization } from '@/modules/settings/hooks/useOrganization'

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-red-100 text-red-800',
  inactive: 'bg-neutral-100 text-neutral-600',
}

/**
 * Subscription settings tab.
 * Shows current plan, limits, and links to Stripe Customer Portal for billing management.
 */
export default function SubscriptionTab() {
  const { data: org, isLoading } = useOrganization()

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

  const tierLabel = TIER_LABELS[org.subscription_tier] || org.subscription_tier
  const statusStyle = STATUS_STYLES[org.subscription_status] || STATUS_STYLES.inactive

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">Subscription</h2>
        <p className="text-sm text-neutral-500">Manage your plan and billing details.</p>
      </div>

      {/* Current plan */}
      <section className="border border-neutral-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">{tierLabel}</h3>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle}`}>
              {org.subscription_status}
            </span>
          </div>
          {org.stripe_customer_id && (
            <a
              href={`/api/billing/portal`}
              className="px-5 py-2 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Manage billing
            </a>
          )}
        </div>

        {org.trial_ends_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-6">
            Trial ends {new Date(org.trial_ends_at).toLocaleDateString('en-AU', { dateStyle: 'long' })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UsageCard
            label="Team members"
            current={null}
            max={org.max_users}
          />
          <UsageCard
            label="Barrels tracked"
            current={null}
            max={org.max_barrels}
          />
          <UsageCard
            label="Batches / month"
            current={null}
            max={org.max_batches_per_month}
          />
        </div>
      </section>

      {/* Billing info */}
      {!org.stripe_customer_id && (
        <section className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
          <p className="text-neutral-600 mb-2">No billing account linked yet.</p>
          <p className="text-sm text-neutral-400">
            When you upgrade, billing will be managed through Stripe.
          </p>
        </section>
      )}
    </div>
  )
}

/**
 * Displays a usage metric card with current/max values.
 */
function UsageCard({ label, current, max }: { label: string; current: number | null; max: number }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-4">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-neutral-900">
        {current !== null ? `${current} / ${max}` : max === 999 ? 'Unlimited' : `Up to ${max}`}
      </p>
    </div>
  )
}
