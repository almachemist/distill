'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function BatchSummaryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const recipe = searchParams.get('recipe')
  const target = searchParams.get('target')
  const transactions = searchParams.get('transactions')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Started Successfully</h1>
          <p className="text-gray-600 mt-1">
            Your gin batch has been started and inventory consumed
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800">
              Batch Started
            </h3>
            <p className="text-green-700">
              All ingredients have been consumed from inventory
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-green-700 font-medium">Recipe</div>
            <div className="text-green-900">{recipe || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-green-700 font-medium">Batch Size</div>
            <div className="text-green-900">{target}L</div>
          </div>
          <div>
            <div className="text-green-700 font-medium">Transactions</div>
            <div className="text-green-900">{transactions} CONSUME records</div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => router.push('/dashboard/production/orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View Production Orders
        </button>
        <button
          onClick={() => router.push('/dashboard/inventory')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Check Inventory
        </button>
        <button
          onClick={() => router.push('/dashboard/recipes')}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Start Another Batch
        </button>
      </div>
    </div>
  )
}








