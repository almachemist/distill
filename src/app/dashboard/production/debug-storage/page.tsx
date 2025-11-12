'use client'

import { useEffect, useState } from 'react'

export default function DebugStoragePage() {
  const [data, setData] = useState<Record<string, any>>({})

  useEffect(() => {
    const allData: Record<string, any> = {}
    const keys = Object.keys(localStorage)
    const relevantKeys = keys.filter(k => 
      k.startsWith('batch_') || k.startsWith('distillation_')
    )

    relevantKeys.forEach(key => {
      try {
        allData[key] = JSON.parse(localStorage.getItem(key) || '{}')
      } catch (e) {
        allData[key] = { error: 'Failed to parse' }
      }
    })

    setData(allData)
  }, [])

  const handleClear = (key: string) => {
    if (confirm(`Delete "${key}"?`)) {
      localStorage.removeItem(key)
      window.location.reload()
    }
  }

  const handleClearAll = () => {
    if (confirm('Delete ALL batch and distillation data?')) {
      Object.keys(data).forEach(key => localStorage.removeItem(key))
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LocalStorage Debug</h1>
            <p className="text-sm text-gray-600 mt-1">
              Inspect and manage batch data stored in browser
            </p>
          </div>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Clear All Data
          </button>
        </div>

        {Object.keys(data).length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No batch or distillation data found in localStorage</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{key}</h3>
                    {value.batchId && (
                      <p className="text-sm text-gray-600 mt-1">
                        Batch ID: {value.batchId} | Date: {value.date || 'N/A'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleClear(key)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm font-medium border border-red-200"
                  >
                    Delete
                  </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {value.totalVolume !== undefined && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 font-medium uppercase">Total Volume</div>
                      <div className="text-lg font-bold text-blue-900">{value.totalVolume} L</div>
                    </div>
                  )}
                  {value.totalABV !== undefined && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium uppercase">Avg ABV</div>
                      <div className="text-lg font-bold text-green-900">{value.totalABV}%</div>
                    </div>
                  )}
                  {value.totalLAL !== undefined && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-purple-600 font-medium uppercase">Total LAL</div>
                      <div className="text-lg font-bold text-purple-900">{value.totalLAL}</div>
                    </div>
                  )}
                  {value.still && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 font-medium uppercase">Still</div>
                      <div className="text-lg font-bold text-gray-900">{value.still}</div>
                    </div>
                  )}
                </div>

                {/* Cuts Summary */}
                {(value.foreshots || value.heads || value.hearts || value.tails) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Cuts</h4>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      {value.foreshots && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="text-red-700 font-medium">Foreshots</div>
                          <div className="text-red-900">{value.foreshots.length} entries</div>
                        </div>
                      )}
                      {value.heads && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2">
                          <div className="text-orange-700 font-medium">Heads</div>
                          <div className="text-orange-900">{value.heads.length} entries</div>
                        </div>
                      )}
                      {value.hearts && (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <div className="text-green-700 font-medium">Hearts</div>
                          <div className="text-green-900">{value.hearts.length} entries</div>
                        </div>
                      )}
                      {value.tails && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="text-blue-700 font-medium">Tails</div>
                          <div className="text-blue-900">{value.tails.length} entries</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw JSON */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View Raw JSON
                  </summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



