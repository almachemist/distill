'use client'

import { useState } from 'react'
import { ProductionTab } from '@/modules/production/components/ProductionTab'
import { BatchesTab } from '@/modules/production/components/BatchesTab'

type Tab = 'production' | 'batches'

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('production')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Production</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage production batches and view historical data
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('production')}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${
                activeTab === 'production'
                  ? 'border-copper text-copper'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border-strong'
              }
            `}
          >
            Production
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
              ${
                activeTab === 'batches'
                  ? 'border-copper text-copper'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border-strong'
              }
            `}
          >
            Batches
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'production' && <ProductionTab />}
        {activeTab === 'batches' && <BatchesTab />}
      </div>
    </div>
  )
}

