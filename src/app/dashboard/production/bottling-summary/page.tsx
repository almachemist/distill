'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function BottlingSummaryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const tank = searchParams.get('tank')
  const size = searchParams.get('size')
  const units = searchParams.get('units')
  const transactions = searchParams.get('transactions')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bottling Run Started Successfully</h1>
          <p className="text-gray-600 mt-1">
            Your bottling run has been started and packaging consumed
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
              Bottling Run Started
            </h3>
            <p className="text-green-700">
              All packaging materials have been consumed from inventory
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-green-700 font-medium">Source Tank</div>
            <div className="text-green-900">{tank || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-green-700 font-medium">Unit Size</div>
            <div className="text-green-900">{size}ml</div>
          </div>
          <div>
            <div className="text-green-700 font-medium">Units</div>
            <div className="text-green-900">{units} bottles</div>
          </div>
          <div>
            <div className="text-green-700 font-medium">Transactions</div>
            <div className="text-green-900">{transactions} CONSUME records</div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => router.push('/dashboard/production/bottling')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Start Another Run
        </button>
        <button
          onClick={() => router.push('/dashboard/inventory')}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Check Inventory
        </button>
        <button
          onClick={() => router.push('/dashboard/production')}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Production
        </button>
      </div>
    </div>
  )
}

















