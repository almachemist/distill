'use client'

import { useRouter } from 'next/navigation'

export function ProductionOverview() {
  const router = useRouter()

  const productionOptions = [
    {
      title: 'Start Batch',
      description: 'Begin a new gin production batch with recipe scaling and ingredient allocation',
      icon: 'B',
      path: '/dashboard/production/start-batch',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Bottling Run', 
      description: 'Start a new bottling run with packaging allocation and inventory tracking',
      icon: 'R',
      path: '/dashboard/production/bottling',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Production Orders',
      description: 'View and manage all production orders and batch history',
      icon: 'O',
      path: '/dashboard/production/orders',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production</h1>
          <p className="text-gray-600 mt-2">Manage gin production batches and bottling operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productionOptions.map((option) => (
          <div
            key={option.path}
            onClick={() => router.push(option.path)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center text-white text-xl`}>
                {option.icon}
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-sm text-gray-600">{option.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Start</h3>
        <p className="text-blue-700 text-sm mb-4">
          To begin production, first ensure you have recipes and inventory seeded in the system.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/recipes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            View Recipes
          </button>
          <button
            onClick={() => router.push('/dashboard/inventory')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            View Inventory
          </button>
        </div>
      </div>
    </div>
  )
}
