'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import { LotsPicker } from '@/modules/inventory/components/LotsPicker' // TODO: Create LotsPicker component
import { StockRepository } from '@/modules/inventory/services/stock.repository'

interface LotAllocation {
  lot_id: string
  lot_code: string
  qty: number
  uom: string
}

interface PackagingNeed {
  item_id: string
  item_name: string
  category: string
  required_qty: number
  uom: string
  allocations: LotAllocation[]
  is_complete: boolean
  is_optional: boolean
}

export function BottlingRun() {
  const [sourceTank, setSourceTank] = useState('Tank-001') // Placeholder
  const [unitSize, setUnitSize] = useState(700) // ml
  const [runSize, setRunSize] = useState(100) // units
  const [closureType, setClosureType] = useState<'cork' | 'cap'>('cork')
  const [useCartons, setUseCartons] = useState(true)
  const [packagingNeeds, setPackagingNeeds] = useState<PackagingNeed[]>([])
  const [packagingItems, setPackagingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const stockRepo = new StockRepository()

  useEffect(() => {
    loadPackagingItems()
  }, [])

  useEffect(() => {
    calculatePackagingNeeds()
  }, [unitSize, runSize, closureType, useCartons, packagingItems])

  const loadPackagingItems = async () => {
    try {
      setLoading(true)
      
      // In development mode, use mock organization ID
      let organizationId = '00000000-0000-0000-0000-000000000001'
      
      if (process.env.NODE_ENV !== 'development') {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!profile?.organization_id) {
          throw new Error('User has no organization')
        }
        
        organizationId = profile.organization_id
      }
      
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Get all items for now (will be filtered later as packaging items are added)
      const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name')

      if (error) {
        console.error('Database error:', error)
        throw new Error(`Database query failed: ${error.message}`)
      }
      
      console.log('Loaded items for bottling:', items)
      setPackagingItems(items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packaging items')
    } finally {
      setLoading(false)
    }
  }

  const calculatePackagingNeeds = () => {
    if (packagingItems.length === 0) {
      setPackagingNeeds([])
      return
    }

    const needs: PackagingNeed[] = []

    // Bottles - look for packaging_bottle category or items with "bottle" in name
    const bottleItem = packagingItems.find(item => 
      (item.category === 'packaging_bottle') || 
      (item.name.toLowerCase().includes('bottle') && item.name.includes(`${unitSize}ml`))
    ) || packagingItems.find(item => 
      item.category === 'packaging_bottle' || item.name.toLowerCase().includes('bottle')
    )
    
    if (bottleItem) {
      needs.push({
        item_id: bottleItem.id,
        item_name: bottleItem.name,
        category: bottleItem.category || 'packaging_bottle',
        required_qty: runSize,
        uom: 'each',
        allocations: [],
        is_complete: false,
        is_optional: false
      })
    }

    // Closures (cork or cap)
    const closureItem = packagingItems.find(item => {
      if (closureType === 'cork') {
        return (item.category === 'packaging_closure' && item.name.toLowerCase().includes('cork')) ||
               item.name.toLowerCase().includes('cork')
      } else {
        return (item.category === 'packaging_closure' && 
               (item.name.toLowerCase().includes('cap') || item.name.toLowerCase().includes('lid'))) ||
               item.name.toLowerCase().includes('cap') || item.name.toLowerCase().includes('lid')
      }
    })

    if (closureItem) {
      needs.push({
        item_id: closureItem.id,
        item_name: closureItem.name,
        category: closureItem.category,
        required_qty: runSize,
        uom: 'each',
        allocations: [],
        is_complete: false,
        is_optional: false
      })
    }

    // Labels (front and back)
    const frontLabelItem = packagingItems.find(item => 
      item.name.toLowerCase().includes('front') && item.category === 'packaging_label'
    )
    const backLabelItem = packagingItems.find(item => 
      item.name.toLowerCase().includes('back') && item.category === 'packaging_label'
    )

    if (frontLabelItem) {
      needs.push({
        item_id: frontLabelItem.id,
        item_name: frontLabelItem.name,
        category: frontLabelItem.category,
        required_qty: runSize,
        uom: 'each',
        allocations: [],
        is_complete: false,
        is_optional: false
      })
    }

    if (backLabelItem) {
      needs.push({
        item_id: backLabelItem.id,
        item_name: backLabelItem.name,
        category: backLabelItem.category,
        required_qty: runSize,
        uom: 'each',
        allocations: [],
        is_complete: false,
        is_optional: false
      })
    }

    // Cartons (optional)
    if (useCartons) {
      const cartonItem = packagingItems.find(item => 
        item.category === 'packaging_carton'
      )
      
      if (cartonItem) {
        const cartonsNeeded = Math.ceil(runSize / 6) // 6 bottles per carton
        needs.push({
          item_id: cartonItem.id,
          item_name: cartonItem.name,
          category: cartonItem.category,
          required_qty: cartonsNeeded,
          uom: 'each',
          allocations: [],
          is_complete: false,
          is_optional: true
        })
      }
    }

    setPackagingNeeds(needs)
  }

  const updatePackagingAllocations = (itemId: string, allocations: LotAllocation[]) => {
    setPackagingNeeds(prev => prev.map(need => {
      if (need.item_id === itemId) {
        const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.qty, 0)
        const isComplete = Math.abs(totalAllocated - need.required_qty) < 0.001
        return { ...need, allocations, is_complete: isComplete }
      }
      return need
    }))
  }

  const canConfirm = () => {
    const requiredNeeds = packagingNeeds.filter(need => !need.is_optional)
    return requiredNeeds.every(need => need.is_complete) && requiredNeeds.length > 0
  }

  const handleConfirm = async () => {
    if (!canConfirm()) return

    try {
      setSubmitting(true)

      // Prepare all CONSUME transactions for packaging
      const transactions = []
      for (const need of packagingNeeds) {
        for (const allocation of need.allocations) {
          transactions.push({
            txn_type: 'CONSUME' as const,
            item_id: need.item_id,
            lot_id: allocation.lot_id,
            qty: allocation.qty,
            uom: allocation.uom,
            note: `Bottling run - ${runSize} units @ ${unitSize}ml - Source: ${sourceTank}`
          })
        }
      }

      // Post all transactions as a batch
      await stockRepo.postBatchTxns(transactions)

      // Redirect to bottling summary
      router.push(`/dashboard/production/bottling-summary?tank=${sourceTank}&size=${unitSize}&units=${runSize}&transactions=${transactions.length}`)

    } catch (err) {
      alert('Failed to start bottling run: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  const groupedNeeds = packagingNeeds.reduce((acc, need) => {
    if (!acc[need.category]) {
      acc[need.category] = []
    }
    acc[need.category].push(need)
    return acc
  }, {} as Record<string, PackagingNeed[]>)

  const categoryOrder = ['packaging_bottle', 'packaging_closure', 'packaging_label', 'packaging_carton', 'packaging_other']
  const categoryNames = {
    packaging_bottle: 'Bottles',
    packaging_closure: 'Closures',
    packaging_label: 'Labels',
    packaging_carton: 'Cartons',
    packaging_other: 'Other Packaging'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Production
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Bottling Run</h1>
          <p className="text-gray-600 mt-1">
            Configure packaging requirements and allocate stock
          </p>
        </div>
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Debug:</strong> Found {packagingItems.length} packaging items, {packagingNeeds.length} packaging needs
          </p>
        </div>
      )}

      {/* No packaging items warning */}
      {packagingItems.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-blue-900 font-medium">No Packaging Items Found</h3>
          <p className="text-blue-700 text-sm mt-1">
            To start bottling runs, you need to create packaging items first. Go to the Recipes page and use "Seed Data" to create sample items.
          </p>
          <button
            onClick={() => router.push('/dashboard/recipes')}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Recipes to Seed Data
          </button>
        </div>
      )}

      {/* Run Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Run Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Tank
            </label>
            <input
              type="text"
              value={sourceTank}
              onChange={(e) => setSourceTank(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tank ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Size (ml)
            </label>
            <select
              value={unitSize}
              onChange={(e) => setUnitSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={200}>200ml</option>
              <option value={700}>700ml</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Run Size (units)
            </label>
            <input
              type="number"
              min="1"
              value={runSize}
              onChange={(e) => setRunSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closure Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cork"
                  checked={closureType === 'cork'}
                  onChange={(e) => setClosureType(e.target.value as 'cork' | 'cap')}
                  className="mr-2"
                />
                Cork
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cap"
                  checked={closureType === 'cap'}
                  onChange={(e) => setClosureType(e.target.value as 'cork' | 'cap')}
                  className="mr-2"
                />
                Cap/Lid
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useCartons}
              onChange={(e) => setUseCartons(e.target.checked)}
              className="mr-2"
            />
            Use cartons (6 bottles per carton)
          </label>
        </div>
      </div>

      {/* Packaging Requirements */}
      <div className="space-y-6">
        {categoryOrder.map(category => {
          const categoryNeeds = groupedNeeds[category]
          if (!categoryNeeds || categoryNeeds.length === 0) return null

          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {categoryNames[category as keyof typeof categoryNames]} ({categoryNeeds.length} items)
              </h3>
              
              <div className="space-y-4">
                {categoryNeeds.map((need) => (
                  <div key={need.item_id} className="p-4 border rounded bg-gray-50">
                    <div className="font-medium">{need.item_name}{need.is_optional ? ' (optional)' : ''}</div>
                    <div className="text-sm text-gray-600">Required: {need.required_qty} {need.uom}</div>
                    <div className="text-xs text-gray-400 mt-2">TODO: Implement LotsPicker component for lot selection</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary and Confirm */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Bottling Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div>
            <div className="text-blue-700 font-medium">Total Units</div>
            <div className="text-blue-900">{runSize}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Unit Size</div>
            <div className="text-blue-900">{unitSize}ml</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Packaging Items</div>
            <div className="text-blue-900">{packagingNeeds.filter(n => !n.is_optional).length}</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Ready</div>
            <div className={canConfirm() ? 'text-green-700' : 'text-red-700'}>
              {canConfirm() ? '✓ Yes' : '✗ No'}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm() || submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Starting Bottling...' : 'Confirm & Start Bottling'}
          </button>
        </div>
      </div>
    </div>
  )
}
