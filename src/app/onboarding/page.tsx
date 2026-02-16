'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlaskConical, Building2, Globe, CreditCard, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useOrganization, useUpdateOrganization } from '@/modules/settings/hooks/useOrganization'

const STEPS = ['Distillery', 'Preferences', 'Plan'] as const
type Step = (typeof STEPS)[number]

const TIMEZONES = [
  'Australia/Brisbane', 'Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth',
  'Pacific/Auckland', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Singapore',
]

const CURRENCIES = ['AUD', 'USD', 'NZD', 'GBP', 'EUR', 'CAD', 'JPY', 'SGD']

const PLANS = [
  { id: 'free', label: 'Free', price: 0, desc: '3 users, 50 barrels, 20 batches/mo', cta: 'Start free' },
  { id: 'starter', label: 'Starter', price: 49, desc: '5 users, 100 barrels, 50 batches/mo', cta: '14-day free trial' },
  { id: 'professional', label: 'Professional', price: 99, desc: '15 users, 500 barrels, unlimited batches', cta: '14-day free trial', popular: true },
  { id: 'enterprise', label: 'Enterprise', price: 249, desc: 'Unlimited everything + priority support', cta: '14-day free trial' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: org, isLoading: orgLoading } = useOrganization()
  const updateOrg = useUpdateOrganization()

  const [step, setStep] = useState<Step>('Distillery')
  const [orgName, setOrgName] = useState('')
  const [timezone, setTimezone] = useState('Australia/Brisbane')
  const [currency, setCurrency] = useState('AUD')
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [saving, setSaving] = useState(false)

  // Prefill once org data loads
  if (org && !orgName && org.name) {
    setOrgName(org.name)
    if (org.timezone) setTimezone(org.timezone)
    if (org.currency) setCurrency(org.currency)
  }

  const stepIndex = STEPS.indexOf(step)

  const handleNext = async () => {
    if (step === 'Distillery') {
      if (!orgName.trim()) return
      setStep('Preferences')
    } else if (step === 'Preferences') {
      setStep('Plan')
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      // Save org settings
      await updateOrg.mutateAsync({
        name: orgName.trim(),
        timezone,
        currency,
      })

      if (selectedPlan !== 'free' && org?.id) {
        // Redirect to Stripe checkout
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: selectedPlan, organizationId: org.id }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
          return
        }
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-copper"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      {/* Header */}
      <header className="py-6 px-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-copper flex items-center justify-center">
            <FlaskConical className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-graphite tracking-tight">Distil</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < stepIndex ? 'bg-copper text-white' :
                  i === stepIndex ? 'bg-copper text-white' :
                  'bg-copper/20 text-copper'
                }`}>
                  {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i === stepIndex ? 'text-graphite' : 'text-graphite/50'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`w-12 h-0.5 ${i < stepIndex ? 'bg-copper' : 'bg-copper/20'}`} />}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="bg-white rounded-2xl border border-copper-15 shadow-sm p-8">
            {step === 'Distillery' && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <Building2 className="w-10 h-10 text-copper mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-graphite">Welcome to Distil!</h2>
                  <p className="text-graphite/60 mt-1">Let&apos;s set up your distillery</p>
                </div>
                <div>
                  <label htmlFor="org_name" className="block text-sm font-medium text-graphite mb-2">Distillery name</label>
                  <input id="org_name" type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Devil's Thumb Distillery"
                    className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
                </div>
                <button onClick={handleNext} disabled={!orgName.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 'Preferences' && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <Globe className="w-10 h-10 text-copper mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-graphite">Preferences</h2>
                  <p className="text-graphite/60 mt-1">Configure your region settings</p>
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-graphite mb-2">Timezone</label>
                  <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite">
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-graphite mb-2">Currency</label>
                  <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('Distillery')}
                    className="flex-1 px-6 py-3 border border-copper-30 text-graphite rounded-lg font-medium hover:bg-beige transition-colors">Back</button>
                  <button onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper/90 transition-colors">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'Plan' && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <CreditCard className="w-10 h-10 text-copper mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-graphite">Choose a plan</h2>
                  <p className="text-graphite/60 mt-1">Start free, upgrade anytime. All paid plans include a 14-day trial.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PLANS.map((plan) => (
                    <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                      className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                        selectedPlan === plan.id ? 'border-copper bg-copper/5' : 'border-copper-15 hover:border-copper/50'
                      }`}>
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-3 bg-copper text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Popular</span>
                      )}
                      <h4 className="font-semibold text-graphite">{plan.label}</h4>
                      <p className="text-xl font-bold text-graphite mt-1">
                        {plan.price === 0 ? '$0' : `$${plan.price}`}<span className="text-xs font-normal text-graphite/50">/mo</span>
                      </p>
                      <p className="text-xs text-graphite/60 mt-1">{plan.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('Preferences')}
                    className="flex-1 px-6 py-3 border border-copper-30 text-graphite rounded-lg font-medium hover:bg-beige transition-colors">Back</button>
                  <button onClick={handleFinish} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
                    {saving ? 'Setting up...' : selectedPlan === 'free' ? 'Get started' : 'Start free trial'}
                    {!saving && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
