'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductionOverview } from '@/modules/production/components/ProductionOverview'

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'distillation-sessions' | 'start-batch' | 'bottling'>('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production</h1>
          <p className="text-gray-600 mt-2">Manage gin production batches, distillation sessions, and bottling operations</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Production Overview', description: 'General production status and metrics' },
            { key: 'distillation-sessions', label: 'Distillation Sessions FY 2025-2026', description: 'Track distillation runs with cost analysis' },
            { key: 'start-batch', label: 'Start Batch', description: 'Initiate new production batches' },
            { key: 'bottling', label: 'Bottling Run', description: 'Manage bottling operations' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-xs font-normal text-gray-400">{tab.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div>
            <ProductionOverview />
          </div>
        )}

        {activeTab === 'distillation-sessions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-md bg-orange-100 mb-4">
                <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Distillation Sessions Financial Year 2025-2026</h3>
              <p className="text-gray-600 mb-4">
                Track and analyze your distillation runs with automatic cost calculations, efficiency metrics, and financial year reporting
              </p>
              <Link
                href="/dashboard/production/distillation-sessions"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                View Distillation Sessions
              </Link>
            </div>

            {/* Financial Year Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Sessions This FY</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">12</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Efficiency</dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">75.9%</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total LAL Produced</dt>
                  <dd className="mt-1 text-3xl font-semibold text-blue-600">2,847</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Cost per LAL</dt>
                  <dd className="mt-1 text-3xl font-semibold text-purple-600">$6.11</dd>
                </div>
              </div>
            </div>

            {/* Recent Sessions Preview */}
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Sessions</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <p>• <strong>Merchant Mae Gin</strong> - SPIRIT-GIN-MM-002 (Mar 13, 2025) - 75.9% efficiency</p>
                  <p>• <strong>Rainforest Gin</strong> - SPIRIT-GIN-RF-001 (Mar 10, 2025) - 78.2% efficiency</p>
                  <p>• <strong>Signature Dry Gin</strong> - SPIRIT-GIN-SD-001 (Mar 8, 2025) - 73.4% efficiency</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'start-batch' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-md bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start New Production Batch</h3>
              <p className="text-gray-600 mb-4">
                Initiate a new gin production batch with recipe selection and ingredient calculations
              </p>
              <Link
                href="/dashboard/production/start-batch"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Start New Batch
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'bottling' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-md bg-blue-100 mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bottling Run Management</h3>
              <p className="text-gray-600 mb-4">
                Manage bottling operations, track packaging costs, and monitor finished product inventory
              </p>
              <Link
                href="/dashboard/production/bottling"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Manage Bottling Runs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}