'use client'

import { useState, useEffect } from 'react'
import { useOrganization, useUpdateOrganization } from '@/modules/settings/hooks/useOrganization'

const TIMEZONES = [
  'Australia/Brisbane',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Darwin',
  'Australia/Hobart',
  'Pacific/Auckland',
  'UTC',
]

const CURRENCIES = [
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'NZD', label: 'NZD — New Zealand Dollar' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
]

/**
 * Organization settings tab.
 * Allows owners/admins to update org name, timezone, currency, and logo URL.
 */
export default function OrganizationTab() {
  const { data: org, isLoading } = useOrganization()
  const updateOrg = useUpdateOrganization()

  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState('Australia/Brisbane')
  const [currency, setCurrency] = useState('AUD')
  const [logoUrl, setLogoUrl] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (org) {
      setName(org.name || '')
      setTimezone(org.timezone || 'Australia/Brisbane')
      setCurrency(org.currency || 'AUD')
      setLogoUrl(org.logo_url || '')
    }
  }, [org])

  const handleSave = async () => {
    setMessage(null)
    try {
      await updateOrg.mutateAsync({
        name: name.trim(),
        timezone,
        currency,
        logo_url: logoUrl.trim() || null,
      })
      setMessage({ type: 'success', text: 'Organization updated successfully.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update organization.' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">Organization</h2>
        <p className="text-sm text-neutral-500">Manage your distillery&apos;s settings and branding.</p>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-neutral-600 mb-1">
              Organization name
            </label>
            <input
              id="orgName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-copper/50 focus:border-copper outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={org?.slug || '—'}
              disabled
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-neutral-600 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-copper/50 focus:border-copper outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-neutral-600 mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-copper/50 focus:border-copper outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-neutral-600 mb-1">
            Logo URL
          </label>
          <input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-copper/50 focus:border-copper outline-none"
          />
          <p className="text-xs text-neutral-400 mt-1">Optional. Used in reports and exports.</p>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateOrg.isPending || !name.trim()}
          className="px-5 py-2 bg-copper hover:bg-copper/90 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updateOrg.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
