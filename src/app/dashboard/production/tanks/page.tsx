'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tank, TankUpdateInput } from '@/modules/production/types/tank.types'
import { TankCard } from '@/modules/production/components/TankCard'
import { TankEditModal } from '@/modules/production/components/TankEditModal'

export default function TanksPage() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
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
      const { data, error } = await supabase
        .from('tanks')
        .select('*')
        .order('tank_id')

      if (error) throw error
      setTanks(data || [])
    } catch (error) {
      console.error('Error loading tanks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tank: Tank) => {
    setSelectedTank(tank)
    setIsModalOpen(true)
  }

  const handleSave = async (tankId: string, updates: TankUpdateInput) => {
    try {
      // Save to database
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

      // Reload tanks
      await loadTanks()
    } catch (error) {
      console.error('Error saving tank:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Loading tanks...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Tanks</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all production tanks</p>
      </div>

      {/* Tank Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tanks.map(tank => (
          <TankCard
            key={tank.id}
            tank={tank}
            onEdit={handleEdit}
          />
        ))}
      </div>

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
        />
      )}
    </div>
  )
}

