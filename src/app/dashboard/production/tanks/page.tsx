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
  const supabase = createClient()

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
          <p className="text-sm text-gray-500 mt-1">Found {tanks.length} tanks</p>
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

      {/* Tank Grid */}
      {tanks.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">No tanks found. Please run the database migration.</p>
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

