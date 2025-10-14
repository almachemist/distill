'use client'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { DistillationSessionCalculator } from '@/modules/production/services/distillation-session-calculator.service'
import { merchantMaeGinDistillation, rainforestGinDistillation, signatureDryGinDistillation } from '@/modules/production/sessions/merchant-mae-gin-distillation.session'

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentSessions, setRecentSessions] = useState<DistillationSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const exampleSessions = [
        merchantMaeGinDistillation,
        rainforestGinDistillation,
        signatureDryGinDistillation
      ]

      const processedSessions = exampleSessions.map(session => 
        DistillationSessionCalculator.processDistillationSession(session)
      )

      setRecentSessions(processedSessions.slice(0, 3)) // Most recent 3
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const currentYear = new Date().getFullYear()
  const totalBatches = recentSessions.length
  const totalLAL = recentSessions.reduce((sum, s) => sum + (s.lalOut || 0), 0)
  const avgEfficiency = totalBatches > 0 ? 
    recentSessions.reduce((sum, s) => sum + (s.lalEfficiency || 0), 0) / totalBatches : 0

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.displayName || user?.email || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          Track your distillations and manage your production in real-time
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">{totalBatches}</div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Batches {currentYear}</div>
              <div className="text-xs text-gray-400">Recent distillations</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-green-600">{totalLAL.toFixed(1)}</div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">LAL Produced</div>
              <div className="text-xs text-gray-400">Pure alcohol liters</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-purple-600">{avgEfficiency.toFixed(1)}%</div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Avg Efficiency</div>
              <div className="text-xs text-gray-400">Distillation yield</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-orange-600">3</div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-500">Unique Gins</div>
              <div className="text-xs text-gray-400">Recipes in production</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/production/batch-overview"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors"
          >
            📊 View Batches
          </Link>
          <Link
            href="/dashboard/production/interactive-distillation"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors"
          >
            ⚗️ Interactive Panel
          </Link>
          <Link
            href="/dashboard/production/daily-details"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors"
          >
            📝 Daily Details
          </Link>
          <Link
            href="/dashboard/inventory"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors"
          >
            📦 Inventory
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Distillations</h2>
          <Link
            href="/dashboard/production/batch-overview"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all →
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No distillations found
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">⚗️</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{session.sku}</div>
                    <div className="text-sm text-gray-500">
                      {session.date} • {session.still} • {(session.lalOut || 0).toFixed(1)} LAL
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {(session.lalEfficiency || 0).toFixed(1)}% efficiency
                  </span>
                  <Link
                    href="/dashboard/production/batch-overview"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Production Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tip of the Day</h3>
        <p className="text-gray-700">
          Use <strong>Real-Time Tracking</strong> to record observations during distillation. 
          This helps identify patterns and improve the quality of your productions!
        </p>
        <Link
          href="/dashboard/production/batch-overview"
          className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Start tracking →
        </Link>
      </div>
    </div>
  )
}