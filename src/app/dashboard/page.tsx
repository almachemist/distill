'use client'

import { useAuth } from '@/modules/auth/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.name || 'User'}!
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Barrels
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                0
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Volume (L)
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                0
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Pending Tasks
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                0
              </dd>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium">
              Add Barrel
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium">
              New Production
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-sm font-medium">
              Take Sample
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-md text-sm font-medium">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}