'use client'

import { useState } from 'react'
import { ProductionTab } from '@/modules/production/components/ProductionTab'
import { BatchesTab } from '@/modules/production/components/BatchesTab'

type Tab = 'production' | 'batches'

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('production')

  return (
    <div className="bg-neutral-50">
      {/* Header */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-semibold text-neutral-900">Production</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage production batches and view historical data
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('production')}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'production'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }
              `}
            >
              Production
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === 'batches'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }
              `}
            >
              Batches
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'production' && <ProductionTab />}
        {activeTab === 'batches' && <BatchesTab />}
      </div>
    </div>
  )
}

