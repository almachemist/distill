'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tank, TankUpdateInput } from '@/modules/production/types/tank.types'
import { TankCard } from '@/modules/production/components/TankCard'
import { TankEditModal } from '@/modules/production/components/TankEditModal'

export default function TanksPage() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showRedistillationAlert, setShowRedistillationAlert] = useState(true)
  const supabase = createClient()

  // Calculate summary statistics
  const totalTanks = tanks.length
  const tanksInUse = tanks.filter(t => t.status !== 'empty' && t.status !== 'cleaning' && t.status !== 'unavailable').length
  const emptyTanks = tanks.filter(t => t.status === 'empty').length
  const totalVolume = tanks.reduce((sum, t) => sum + (t.current_volume_l || t.volume || 0), 0)
  const totalCapacity = tanks.reduce((sum, t) => sum + (t.capacity_l || t.capacity || 0), 0)
  const utilizationPercent = totalCapacity > 0 ? (totalVolume / totalCapacity) * 100 : 0
  const redistillationTanks = tanks.filter(t => t.status === 'pending_redistillation')

  useEffect(() => {
    loadTanks()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('tanks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tanks' },
        () => {
          loadTanks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadTanks = async () => {
    try {
      console.log('Loading tanks...')
      const { data, error } = await supabase
        .from('tanks')
        .select('*')
        .order('tank_id')

      if (error) {
        console.error('Supabase error:', error)
        setError(`Failed to load tanks: ${error.message}`)
        throw error
      }
      console.log('Loaded tanks:', data)
      setTanks(data || [])
      if (!data || data.length === 0) {
        setError('No tanks found in database')
      }
    } catch (error: any) {
      console.error('Error loading tanks:', error)
      setError(error.message || 'Unknown error loading tanks')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tank: Tank) => {
    setSelectedTank(tank)
    setIsModalOpen(true)
  }

  const handleSave = async (tankId: string, updates: TankUpdateInput & { tank_id?: string, tank_name?: string, capacity_l?: number }) => {
    try {
      if (!tankId) {
        // Creating new tank
        const { error } = await supabase
          .from('tanks')
          .insert({
            organization_id: tanks[0]?.organization_id || '00000000-0000-0000-0000-000000000001',
            tank_id: updates.tank_id,
            tank_name: updates.tank_name,
            tank_type: 'spirits',
            capacity_l: updates.capacity_l || 1000,
            product: updates.product,
            current_abv: updates.current_abv,
            current_volume_l: updates.current_volume_l,
            status: updates.status || 'empty',
            notes: updates.notes,
            last_updated_by: updates.last_updated_by
          })

        if (error) throw error
      } else {
        // Updating existing tank
        const { error } = await supabase
          .from('tanks')
          .update(updates)
          .eq('id', tankId)

        if (error) throw error

        // Log to history
        const tank = tanks.find(t => t.id === tankId)
        if (tank) {
          await supabase
            .from('tank_history')
            .insert({
              organization_id: tank.organization_id,
              tank_id: tankId,
              action: 'Updated tank',
              user_name: updates.last_updated_by,
              previous_values: {
                tank_name: tank.tank_name,
                capacity_l: tank.capacity_l,
                product: tank.product,
                current_abv: tank.current_abv,
                current_volume_l: tank.current_volume_l,
                status: tank.status,
                notes: tank.notes
              },
              new_values: updates,
              notes: `Updated by ${updates.last_updated_by}`
            })
        }
      }

      // Reload tanks
      await loadTanks()
    } catch (error) {
      console.error('Error saving tank:', error)
      throw error
    }
  }

  const handleDelete = async (tankId: string) => {
    try {
      const { error } = await supabase
        .from('tanks')
        .delete()
        .eq('id', tankId)

      if (error) throw error

      // Reload tanks
      await loadTanks()
    } catch (error) {
      console.error('Error deleting tank:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="text-gray-600 text-lg">Loading tanks...</div>
          <div className="mt-4 text-sm text-gray-500">Connecting to Supabase...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading Tanks</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadTanks}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Tanks</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all production tanks</p>
        </div>
        <button
          onClick={() => {
            const newTank: Tank = {
              id: '',
              organization_id: tanks[0]?.organization_id || '',
              tank_id: '',
              tank_name: '',
              tank_type: 'spirits',
              capacity_l: 1000,
              status: 'empty',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setSelectedTank(newTank)
            setIsModalOpen(true)
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          + Add New Tank
        </button>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Tanks</div>
          <div className="text-3xl font-bold text-gray-900">{totalTanks}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-700 mb-1">In Use</div>
          <div className="text-3xl font-bold text-blue-900">{tanksInUse}</div>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Empty</div>
          <div className="text-3xl font-bold text-gray-900">{emptyTanks}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-700 mb-1">Utilization</div>
          <div className="text-3xl font-bold text-green-900">{utilizationPercent.toFixed(0)}%</div>
          <div className="text-xs text-green-600 mt-1">
            {totalVolume.toFixed(0)}L / {totalCapacity.toFixed(0)}L
          </div>
        </div>
      </div>

      {/* Redistillation Alert */}
      {redistillationTanks.length > 0 && showRedistillationAlert && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  {redistillationTanks.length} tank{redistillationTanks.length > 1 ? 's' : ''} pending redistillation
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <ul className="list-disc list-inside space-y-1">
                    {redistillationTanks.map(tank => (
                      <li key={tank.id}>
                        {tank.tank_id}: {tank.product} ({(tank.current_volume_l || tank.volume || 0).toFixed(0)}L @ {(tank.current_abv || tank.abv || 0).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowRedistillationAlert(false)}
              className="flex-shrink-0 ml-4 text-orange-500 hover:text-orange-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tank Grid */}
      {tanks.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">No tanks found in database.</p>
          <p className="text-sm text-yellow-700 mt-2">Run the import script to load real tank inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tanks.map(tank => (
            <TankCard
              key={tank.id}
              tank={tank}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedTank && (
        <TankEditModal
          tank={selectedTank}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTank(null)
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

