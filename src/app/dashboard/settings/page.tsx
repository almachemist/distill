'use client'

import { useState } from 'react'
import ProfileTab from './tabs/ProfileTab'
import OrganizationTab from './tabs/OrganizationTab'
import TeamTab from './tabs/TeamTab'
import SubscriptionTab from './tabs/SubscriptionTab'
import IntegrationsTab from './tabs/IntegrationsTab'

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'organization', label: 'Organization', icon: '🏢' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'subscription', label: 'Subscription', icon: '💳' },
  { id: 'integrations', label: 'Integrations', icon: '🔗' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-graphite tracking-tight">Settings</h1>
        <p className="text-graphite/60 mt-1">Manage your account, organization, and integrations</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-graphite border border-copper-30'
                      : 'text-graphite/60 hover:text-graphite hover:bg-white/50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 lg:p-8">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'organization' && <OrganizationTab />}
            {activeTab === 'team' && <TeamTab />}
            {activeTab === 'subscription' && <SubscriptionTab />}
            {activeTab === 'integrations' && <IntegrationsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
