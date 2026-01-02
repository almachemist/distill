'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tank, TankUpdateInput, TankHistoryEntry } from '@/modules/production/types/tank.types'
import { TankCard } from '@/modules/production/components/TankCard'
import { TankEditModal } from '@/modules/production/components/TankEditModal'

export default function TanksPage() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showRedistillationAlert, setShowRedistillationAlert] = useState(true)
  const [devCleared, setDevCleared] = useState(false)
  const [currentAction, setCurrentAction] = useState<null | 'transform' | 'infusion' | 'adjust' | 'combine' | 'history'>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<TankHistoryEntry[]>([])
  const [combineSource, setCombineSource] = useState<Tank | null>(null)
  const [combineSelectedIds, setCombineSelectedIds] = useState<string[]>([])
  const [combineNewName, setCombineNewName] = useState('')
  const [combineProductName, setCombineProductName] = useState('')
  const [isInfusionOpen, setIsInfusionOpen] = useState(false)
  const [infusionType, setInfusionType] = useState('')
  const [botanicals, setBotanicals] = useState<Array<{ id: string; name: string; unit: string; currentStock: number }>>([])
  const [botanicalSearch, setBotanicalSearch] = useState('')
  const [infusionItems, setInfusionItems] = useState<Array<{ id: string; name: string; unit: string; quantity: number }>>([])
  const [isTransformOpen, setIsTransformOpen] = useState(false)
  const [transformProductName, setTransformProductName] = useState('')
  const [availableRecipes, setAvailableRecipes] = useState<Array<{ id: string; name: string }>>([])
  const [transformRecipeId, setTransformRecipeId] = useState<string>('')
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [adjustAbv, setAdjustAbv] = useState<string>('')
  const [adjustVolume, setAdjustVolume] = useState<string>('')
  const [adjustNotes, setAdjustNotes] = useState<string>('')
  const supabase = createClient()
  const USE_STATIC = ['1','true','yes'].includes((process.env.NEXT_PUBLIC_USE_STATIC_DATA || '').toLowerCase())

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

  const loadTanks = async (retryCount: number = 0) => {
    try {
      setLoading(true)
      console.log('Loading tanks...')
      if ((USE_STATIC || process.env.NODE_ENV === 'development') && devCleared) {
        setTanks([])
        setLoading(false)
        setError(null)
        return
      }
      if (USE_STATIC || process.env.NODE_ENV === 'development') {
        const devOrg = '00000000-0000-0000-0000-000000000001'
        const now = new Date().toISOString()
        const devTanks: Tank[] = [
          {
            id: 'T-330-01',
            organization_id: devOrg,
            tank_id: 'T-330-01',
            tank_name: '330L Rum Blend',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Rum Blend',
            current_abv: 63.0,
            current_volume_l: 51,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-330-02',
            organization_id: devOrg,
            tank_id: 'T-330-02',
            tank_name: '330L Vodka (2nd Distillation)',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Vodka (Second Distillation)',
            current_abv: 86.7,
            current_volume_l: 250,
            status: 'pending_redistillation',
            notes: 'To be distilled again',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-615-01',
            organization_id: devOrg,
            tank_id: 'T-615-01',
            tank_name: '615L White Rum',
            tank_type: 'spirits',
            capacity_l: 615,
            product: 'White Rum',
            current_abv: null,
            current_volume_l: null,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-330-03',
            organization_id: devOrg,
            tank_id: 'T-330-03',
            tank_name: '330L Vodka (Double Distilled)',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Vodka (Double Distilled)',
            current_abv: 80.0,
            current_volume_l: 233,
            status: 'pending_redistillation',
            notes: 'Should be distilled again',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-400-01',
            organization_id: devOrg,
            tank_id: 'T-400-01',
            tank_name: '400L Cane Spirit 2501',
            tank_type: 'spirits',
            capacity_l: 400,
            product: 'Cane Spirit Batch 2501',
            current_abv: 64.5,
            current_volume_l: 20,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-317-01',
            organization_id: devOrg,
            tank_id: 'T-317-01',
            tank_name: '317L Cane Spirit 25-2 (No Lid)',
            tank_type: 'spirits',
            capacity_l: 317,
            has_lid: false,
            product: 'Cane Spirit Batch 25-2',
            current_abv: null,
            current_volume_l: null,
            status: 'unavailable',
            notes: 'Avoid use (no lid)',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-100-01',
            organization_id: devOrg,
            tank_id: 'T-100-01',
            tank_name: '100L Coffee Liqueur Infusion',
            tank_type: 'spirits',
            capacity_l: 100,
            product: 'Coffee Liqueur Infusion',
            current_abv: 44.0,
            current_volume_l: 30,
            status: 'infusing',
            extra_materials: { coffee_kg: 3 },
            started_on: new Date('2025-11-17T00:00:00.000Z').toISOString(),
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-230-01',
            organization_id: devOrg,
            tank_id: 'T-230-01',
            tank_name: '230L Coffee Liqueur Infusion',
            tank_type: 'spirits',
            capacity_l: 230,
            product: 'Coffee Liqueur Infusion',
            current_abv: null,
            current_volume_l: null,
            status: 'infusing',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          }
        ]
        setTanks(devTanks)
        setLoading(false)
        setError(null)
        return
      }
      const { data, error } = await supabase
        .from('tanks')
        .select('*')
        .order('tank_id')
      if (error) {
        const isNet = String(error?.message || '').toLowerCase().includes('failed to fetch')
        const isCfg = String(error?.message || '').toLowerCase().includes('supabase is not configured')
        if (isNet || isCfg) {
          const devOrg = '00000000-0000-0000-0000-000000000001'
          const now = new Date().toISOString()
          const devTanks: Tank[] = [
            {
              id: 'T-330-01',
              organization_id: devOrg,
              tank_id: 'T-330-01',
              tank_name: '330L Rum Blend',
              tank_type: 'spirits',
              capacity_l: 330,
              product: 'Rum Blend',
              current_abv: 63.0,
              current_volume_l: 51,
              status: 'holding',
              notes: null,
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            },
            {
              id: 'T-330-02',
              organization_id: devOrg,
              tank_id: 'T-330-02',
              tank_name: '330L Vodka (2nd Distillation)',
              tank_type: 'spirits',
              capacity_l: 330,
              product: 'Vodka (Second Distillation)',
              current_abv: 86.7,
              current_volume_l: 250,
              status: 'pending_redistillation',
              notes: 'To be distilled again',
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            },
            {
              id: 'T-615-01',
              organization_id: devOrg,
              tank_id: 'T-615-01',
              tank_name: '615L White Rum',
              tank_type: 'spirits',
              capacity_l: 615,
              product: 'White Rum',
              current_abv: null,
              current_volume_l: null,
              status: 'holding',
              notes: null,
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            },
            {
              id: 'T-330-03',
              organization_id: devOrg,
              tank_id: 'T-330-03',
              tank_name: '330L Vodka (Double Distilled)',
              tank_type: 'spirits',
              capacity_l: 330,
              product: 'Vodka (Double Distilled)',
              current_abv: 80.0,
              current_volume_l: 233,
              status: 'pending_redistillation',
              notes: 'Should be distilled again',
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            },
            {
              id: 'T-400-01',
              organization_id: devOrg,
              tank_id: 'T-400-01',
              tank_name: '400L Cane Spirit 2501',
              tank_type: 'spirits',
              capacity_l: 400,
              product: 'Cane Spirit Batch 2501',
              current_abv: 64.5,
              current_volume_l: 20,
              status: 'holding',
              notes: null,
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            },
            {
              id: 'T-317-01',
              organization_id: devOrg,
              tank_id: 'T-317-01',
              tank_name: '317L Cane Spirit 25-2 (No Lid)',
              tank_type: 'spirits',
              capacity_l: 317,
              has_lid: false,
              product: 'Cane Spirit Batch 25-2',
              current_abv: null,
              current_volume_l: null,
              status: 'unavailable',
              notes: 'Avoid use (no lid)',
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            },
            {
              id: 'T-100-01',
              organization_id: devOrg,
              tank_id: 'T-100-01',
              tank_name: '100L Coffee Liqueur Infusion',
              tank_type: 'spirits',
              capacity_l: 100,
              product: 'Coffee Liqueur Infusion',
              current_abv: 44.0,
              current_volume_l: 30,
              status: 'infusing',
              extra_materials: { coffee_kg: 3 },
              started_on: new Date('2025-11-17T00:00:00.000Z').toISOString(),
              notes: null,
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            },
            {
              id: 'T-230-01',
              organization_id: devOrg,
              tank_id: 'T-230-01',
              tank_name: '230L Coffee Liqueur Infusion',
              tank_type: 'spirits',
              capacity_l: 230,
              product: 'Coffee Liqueur Infusion',
              current_abv: null,
              current_volume_l: null,
              status: 'infusing',
              notes: null,
              last_updated_by: 'User',
              created_at: now,
              updated_at: now
            }
          ]
          setTanks(devCleared ? [] : devTanks)
          setError(null)
          return
        }
        if (retryCount < 2) {
          setTimeout(() => loadTanks(retryCount + 1), 1000)
          return
        }
        const devOrg = '00000000-0000-0000-0000-000000000001'
        const now = new Date().toISOString()
        const devTanks: Tank[] = [
          {
            id: 'T-330-01',
            organization_id: devOrg,
            tank_id: 'T-330-01',
            tank_name: '330L Rum Blend',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Rum Blend',
            current_abv: 63.0,
            current_volume_l: 51,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-330-02',
            organization_id: devOrg,
            tank_id: 'T-330-02',
            tank_name: '330L Vodka (2nd Distillation)',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Vodka (Second Distillation)',
            current_abv: 86.7,
            current_volume_l: 250,
            status: 'pending_redistillation',
            notes: 'To be distilled again',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-615-01',
            organization_id: devOrg,
            tank_id: 'T-615-01',
            tank_name: '615L White Rum',
            tank_type: 'spirits',
            capacity_l: 615,
            product: 'White Rum',
            current_abv: null,
            current_volume_l: null,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-330-03',
            organization_id: devOrg,
            tank_id: 'T-330-03',
            tank_name: '330L Vodka (Double Distilled)',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Vodka (Double Distilled)',
            current_abv: 80.0,
            current_volume_l: 233,
            status: 'pending_redistillation',
            notes: 'Should be distilled again',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-400-01',
            organization_id: devOrg,
            tank_id: 'T-400-01',
            tank_name: '400L Cane Spirit 2501',
            tank_type: 'spirits',
            capacity_l: 400,
            product: 'Cane Spirit Batch 2501',
            current_abv: 64.5,
            current_volume_l: 20,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-317-01',
            organization_id: devOrg,
            tank_id: 'T-317-01',
            tank_name: '317L Cane Spirit 25-2 (No Lid)',
            tank_type: 'spirits',
            capacity_l: 317,
            has_lid: false,
            product: 'Cane Spirit Batch 25-2',
            current_abv: null,
            current_volume_l: null,
            status: 'unavailable',
            notes: 'Avoid use (no lid)',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-100-01',
            organization_id: devOrg,
            tank_id: 'T-100-01',
            tank_name: '100L Coffee Liqueur Infusion',
            tank_type: 'spirits',
            capacity_l: 100,
            product: 'Coffee Liqueur Infusion',
            current_abv: 44.0,
            current_volume_l: 30,
            status: 'infusing',
            extra_materials: { coffee_kg: 3 },
            started_on: new Date('2025-11-17T00:00:00.000Z').toISOString(),
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-230-01',
            organization_id: devOrg,
            tank_id: 'T-230-01',
            tank_name: '230L Coffee Liqueur Infusion',
            tank_type: 'spirits',
            capacity_l: 230,
            product: 'Coffee Liqueur Infusion',
            current_abv: null,
            current_volume_l: null,
            status: 'infusing',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          }
        ]
        setTanks(devCleared ? [] : devTanks)
        setError(null)
        return
      }
      setTanks(data || [])
      if (!data || data.length === 0) {
        setError('No tanks found in database')
      }
    } catch (error: any) {
      if (USE_STATIC || process.env.NODE_ENV === 'development') {
        const devOrg = '00000000-0000-0000-0000-000000000001'
        const now = new Date().toISOString()
        const devTanks: Tank[] = [
          {
            id: 'T-330-01',
            organization_id: devOrg,
            tank_id: 'T-330-01',
            tank_name: '330L Rum Blend',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Rum Blend',
            current_abv: 63.0,
            current_volume_l: 51,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-330-02',
            organization_id: devOrg,
            tank_id: 'T-330-02',
            tank_name: '330L Vodka (2nd Distillation)',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Vodka (Second Distillation)',
            current_abv: 86.7,
            current_volume_l: 250,
            status: 'pending_redistillation',
            notes: 'To be distilled again',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-615-01',
            organization_id: devOrg,
            tank_id: 'T-615-01',
            tank_name: '615L White Rum',
            tank_type: 'spirits',
            capacity_l: 615,
            product: 'White Rum',
            current_abv: null,
            current_volume_l: null,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-330-03',
            organization_id: devOrg,
            tank_id: 'T-330-03',
            tank_name: '330L Vodka (Double Distilled)',
            tank_type: 'spirits',
            capacity_l: 330,
            product: 'Vodka (Double Distilled)',
            current_abv: 80.0,
            current_volume_l: 233,
            status: 'pending_redistillation',
            notes: 'Should be distilled again',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-400-01',
            organization_id: devOrg,
            tank_id: 'T-400-01',
            tank_name: '400L Cane Spirit 2501',
            tank_type: 'spirits',
            capacity_l: 400,
            product: 'Cane Spirit Batch 2501',
            current_abv: 64.5,
            current_volume_l: 20,
            status: 'holding',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-317-01',
            organization_id: devOrg,
            tank_id: 'T-317-01',
            tank_name: '317L Cane Spirit 25-2 (No Lid)',
            tank_type: 'spirits',
            capacity_l: 317,
            has_lid: false,
            product: 'Cane Spirit Batch 25-2',
            current_abv: null,
            current_volume_l: null,
            status: 'unavailable',
            notes: 'Avoid use (no lid)',
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-100-01',
            organization_id: devOrg,
            tank_id: 'T-100-01',
            tank_name: '100L Coffee Liqueur Infusion',
            tank_type: 'spirits',
            capacity_l: 100,
            product: 'Coffee Liqueur Infusion',
            current_abv: 44.0,
            current_volume_l: 30,
            status: 'infusing',
            extra_materials: { coffee_kg: 3 },
            started_on: new Date('2025-11-17T00:00:00.000Z').toISOString(),
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          },
          {
            id: 'T-230-01',
            organization_id: devOrg,
            tank_id: 'T-230-01',
            tank_name: '230L Coffee Liqueur Infusion',
            tank_type: 'spirits',
            capacity_l: 230,
            product: 'Coffee Liqueur Infusion',
            current_abv: null,
            current_volume_l: null,
            status: 'infusing',
            notes: null,
            last_updated_by: 'User',
            created_at: now,
            updated_at: now
          }
        ]
        setTanks(devCleared ? [] : devTanks)
        setError(null)
      } else {
        if (retryCount < 2) {
          setTimeout(() => loadTanks(retryCount + 1), 1000)
          return
        }
        console.error('Error loading tanks:', error)
        setError(error.message || 'Unknown error loading tanks')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (USE_STATIC || process.env.NODE_ENV === 'development') {
      setDevCleared(true)
      setTanks([])
      setError(null)
      return
    }
    setTanks([])
    setError(null)
  }

  const handleEdit = (tank: Tank) => {
    setSelectedTank(tank)
    setIsModalOpen(true)
  }

  const handleTransform = (tank: Tank) => {
    setSelectedTank(tank)
    setCurrentAction('transform')
    setTransformProductName(tank.product || '')
    setTransformRecipeId('')
    setIsTransformOpen(true)
    ;(async () => {
      try {
        if (USE_STATIC || process.env.NODE_ENV === 'development') {
          setAvailableRecipes([
            { id: 'recipe-spiced-rum', name: 'Spiced Rum' },
            { id: 'recipe-coffee-liqueur', name: 'Coffee Liqueur' },
            { id: 'recipe-signature-gin', name: 'Signature Dry Gin' }
          ])
          return
        }
        const { data } = await supabase.from('recipes').select('id, name').order('name')
        setAvailableRecipes((data || []).map((r: any) => ({ id: r.id, name: r.name })))
      } catch {
        setAvailableRecipes([])
      }
    })()
  }

  const handleAdjust = (tank: Tank) => {
    setSelectedTank(tank)
    setCurrentAction('adjust')
    setAdjustAbv((tank.current_abv ?? tank.abv ?? '') as any as string)
    setAdjustVolume((tank.current_volume_l ?? tank.volume ?? '') as any as string)
    setAdjustNotes('')
    setIsAdjustOpen(true)
  }

  const handleInfuse = async (tank: Tank) => {
    setSelectedTank(tank)
    setCurrentAction('infusion')
    setInfusionType('')
    setInfusionItems([])
    setIsInfusionOpen(true)
    try {
      if (USE_STATIC || process.env.NODE_ENV === 'development') {
        setBotanicals([
          { id: 'juniper', name: 'Juniper', unit: 'kg', currentStock: 50 },
          { id: 'coriander', name: 'Coriander Seed', unit: 'kg', currentStock: 40 },
          { id: 'vanilla', name: 'Vanilla Beans', unit: 'unit', currentStock: 200 },
          { id: 'coffee', name: 'Coffee Beans', unit: 'kg', currentStock: 80 }
        ])
        return
      }
      const res = await fetch('/api/inventory?category=Botanicals')
      const list = await res.json()
      const rows = Array.isArray(list) ? list : []
      setBotanicals(rows.map((r: any) => ({ id: r.id, name: r.name, unit: r.unit || 'unit', currentStock: Number(r.currentStock || 0) })))
    } catch {
      setBotanicals([])
    }
  }

  const handleViewHistory = async (tank: Tank) => {
    if (USE_STATIC || process.env.NODE_ENV === 'development') {
      setHistoryEntries([])
      setIsHistoryOpen(true)
      setCurrentAction('history')
      return
    }
    const { data, error } = await supabase
      .from('tank_history')
      .select('*')
      .eq('tank_id', tank.id)
      .order('created_at', { ascending: false })
    if (error) {
      setHistoryEntries([])
    } else {
      setHistoryEntries((data || []) as TankHistoryEntry[])
    }
    setIsHistoryOpen(true)
    setCurrentAction('history')
  }

  const handleCombine = (tank: Tank) => {
    setCombineSource(tank)
    setCombineSelectedIds([])
    setCombineNewName('')
    setCombineProductName('')
    setCurrentAction('combine')
  }

  const handleSave = async (tankId: string, updates: TankUpdateInput & { tank_id?: string, tank_name?: string, capacity_l?: number }) => {
    try {
      // Handle local/dev/static mode without Supabase writes
      if (USE_STATIC || process.env.NODE_ENV === 'development') {
        const now = new Date().toISOString()
        if (!tankId) {
          const newTankId = updates.tank_id || `TK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
          const newTank: Tank = {
            id: newTankId,
            organization_id: tanks[0]?.organization_id || '00000000-0000-0000-0000-000000000001',
            tank_id: newTankId,
            tank_name: updates.tank_name || '',
            tank_type: 'spirits',
            capacity_l: updates.capacity_l || 1000,
            product: updates.product ?? null,
            current_abv: updates.current_abv ?? null,
            current_volume_l: updates.current_volume_l ?? null,
            status: updates.status || 'empty',
            notes: updates.notes ?? null,
            last_updated_by: updates.last_updated_by,
            created_at: now,
            updated_at: now
          }
          setTanks([newTank, ...tanks])
        } else {
          setTanks(tanks.map(t => {
            if (t.id !== tankId) return t
            return {
              ...t,
              tank_name: updates.tank_name ?? t.tank_name,
              capacity_l: updates.capacity_l ?? t.capacity_l,
              product: updates.product ?? t.product,
              current_abv: updates.current_abv ?? t.current_abv,
              current_volume_l: updates.current_volume_l ?? t.current_volume_l,
              status: updates.status ?? t.status,
              notes: updates.notes ?? t.notes,
              last_updated_by: updates.last_updated_by,
              updated_at: now
            }
          }))
        }
        setCurrentAction(null)
        return
      }

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
              action: currentAction === 'transform' ? 'Transform product'
                : currentAction === 'adjust' ? 'Adjustment'
                : currentAction === 'infusion' ? 'Infusion'
                : 'Updated tank',
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
        setCurrentAction(null)
      }

      // Reload tanks
      await loadTanks()
    } catch (error) {
      console.error('Error saving tank:', error)
      throw error
    }
  }

  const performCombine = async () => {
    if (!combineSource) return
    const ids = [combineSource.id, ...combineSelectedIds]
    const selected = tanks.filter(t => ids.includes(t.id))
    const volumes = selected.map(t => Number(t.current_volume_l || t.volume || 0))
    const totalVolume = volumes.reduce((a, b) => a + b, 0)
    if (totalVolume <= 0) {
      setCurrentAction(null)
      return
    }
    const abvPairs = selected.map(t => {
      const v = Number(t.current_volume_l || t.volume || 0)
      const a = Number(t.current_abv || t.abv || 0)
      return { v, a: Number.isFinite(a) ? a : 0 }
    })
    const weightedAbv = abvPairs.reduce((sum, p) => sum + (p.v * p.a), 0) / (totalVolume || 1)
    const newTankName = combineNewName.trim() || `${combineSource.tank_name || combineSource.tank_id} Blend`
    const productName = combineProductName.trim() || (combineSource.product ? `${combineSource.product} Blend` : 'Blend')
    const capacitySum = selected.reduce((sum, t) => sum + Number(t.capacity_l || t.capacity || 0), 0)
    const now = new Date().toISOString()

    if (USE_STATIC || process.env.NODE_ENV === 'development') {
      const newId = `BLEND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const newTank: Tank = {
        id: newId,
        organization_id: combineSource.organization_id,
        tank_id: newId,
        tank_name: newTankName,
        tank_type: 'spirits',
        capacity_l: capacitySum || 1000,
        product: productName,
        current_abv: Number.isFinite(weightedAbv) ? Number(weightedAbv.toFixed(2)) : null,
        current_volume_l: Number(totalVolume.toFixed(2)),
        status: 'holding',
        notes: null,
        last_updated_by: 'Blend',
        created_at: now,
        updated_at: now
      }
      const updated = tanks.map(t => {
        if (ids.includes(t.id)) {
          return {
            ...t,
            current_volume_l: 0,
            notes: `Merged into ${newTankName}`,
            updated_at: now,
            last_updated_by: 'Blend'
          }
        }
        return t
      })
      setTanks([newTank, ...updated])
      setCombineSource(null)
      setCombineSelectedIds([])
      setCombineNewName('')
      setCombineProductName('')
      setCurrentAction(null)
      return
    }

    const { data: newTankRow, error: insertErr } = await supabase
      .from('tanks')
      .insert({
        organization_id: combineSource.organization_id,
        tank_id: `${combineSource.tank_id}-BLEND-${Date.now()}`,
        tank_name: newTankName,
        tank_type: 'spirits',
        capacity_l: capacitySum || 1000,
        product: productName,
        current_abv: Number.isFinite(weightedAbv) ? Number(weightedAbv.toFixed(2)) : null,
        current_volume_l: Number(totalVolume.toFixed(2)),
        status: 'holding',
        notes: null,
        last_updated_by: 'Blend'
      })
      .select()
      .single()
    if (insertErr) {
      return
    }
    await supabase
      .from('tank_history')
      .insert({
        organization_id: combineSource.organization_id,
        tank_id: newTankRow?.id || `${combineSource.tank_id}-BLEND`,
        action: 'Blend in',
        user_name: 'Blend',
        previous_values: null,
        new_values: {
          tank_name: newTankName,
          capacity_l: capacitySum || 1000,
          product: productName,
          current_abv: Number.isFinite(weightedAbv) ? Number(weightedAbv.toFixed(2)) : null,
          current_volume_l: Number(totalVolume.toFixed(2)),
          status: 'holding',
          notes: null,
          last_updated_by: 'Blend'
        },
        notes: `Created by blending ${ids.join(', ')}`
      })
    for (const t of selected) {
      const prev = {
        tank_name: t.tank_name,
        capacity_l: t.capacity_l,
        product: t.product,
        current_abv: t.current_abv,
        current_volume_l: t.current_volume_l,
        status: t.status,
        notes: t.notes
      }
      const updates = {
        current_volume_l: 0,
        notes: `Merged into ${newTankName}`,
        last_updated_by: 'Blend'
      }
      await supabase
        .from('tanks')
        .update(updates)
        .eq('id', t.id)
      await supabase
        .from('tank_history')
        .insert({
          organization_id: t.organization_id,
          tank_id: t.id,
          action: 'Blend out',
          user_name: 'Blend',
          previous_values: prev,
          new_values: updates,
          notes: `Merged into ${newTankName}`
        })
    }
    await loadTanks()
    setCombineSource(null)
    setCombineSelectedIds([])
    setCombineNewName('')
    setCombineProductName('')
    setCurrentAction(null)
  }

  const performTransform = async () => {
    if (!selectedTank) return
    const updates: TankUpdateInput & { notes?: string } = {
      product: transformProductName.trim() || null,
      last_updated_by: 'Transform'
    }
    if (transformRecipeId) {
      const recipeName = availableRecipes.find(r => r.id === transformRecipeId)?.name || transformRecipeId
      updates.notes = [selectedTank.notes || '', `Linked recipe: ${recipeName}`].filter(Boolean).join('; ')
    }
    await handleSave(selectedTank.id, updates)
    setIsTransformOpen(false)
    setSelectedTank(null)
    setCurrentAction(null)
  }

  const performAdjust = async () => {
    if (!selectedTank) return
    const updates: TankUpdateInput = {
      current_abv: adjustAbv ? Number(adjustAbv) : null,
      current_volume_l: adjustVolume ? Number(adjustVolume) : null,
      notes: adjustNotes?.trim() ? adjustNotes.trim() : selectedTank.notes || null,
      last_updated_by: 'Adjustment'
    }
    await handleSave(selectedTank.id, updates)
    setIsAdjustOpen(false)
    setSelectedTank(null)
    setCurrentAction(null)
  }

  const performInfusion = async () => {
    if (!selectedTank) return
    const now = new Date().toISOString()
    const extraMaterials: Record<string, number> = {}
    for (const it of infusionItems) {
      if (!it.name || !Number.isFinite(it.quantity) || it.quantity <= 0) continue
      const key = it.name.toLowerCase().replace(/\s+/g, '_')
      extraMaterials[key] = (extraMaterials[key] || 0) + Number(it.quantity)
    }
    const updates: TankUpdateInput = {
      infusion_type: infusionType.trim() || null,
      extra_materials: Object.keys(extraMaterials).length ? extraMaterials : null,
      started_on: now,
      status: 'infusing',
      last_updated_by: 'Infusion'
    }
    if (infusionItems.length > 0 && !(USE_STATIC || process.env.NODE_ENV === 'development')) {
      try {
        const changes = infusionItems
          .filter(it => Number.isFinite(it.quantity) && it.quantity > 0)
          .map(it => ({ id: it.id, delta: -Math.abs(it.quantity), note: `Infusion ${selectedTank.tank_id} - ${infusionType || 'ingredients'}` }))
        const res = await fetch('/api/inventory/movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: `Tank ${selectedTank.tank_id} infusion`, reason: 'consume', changes })
        })
        const json = await res.json()
        if (!res.ok) {
          console.warn('Inventory movements error:', json?.error)
        }
      } catch (e) {
        console.warn('Failed to consume inventory for infusion:', (e as any)?.message)
      }
    }
    await handleSave(selectedTank.id, updates)
    setIsInfusionOpen(false)
    setSelectedTank(null)
    setCurrentAction(null)
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
            onClick={() => loadTanks()}
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
          <h1 className="text-3xl font-bold text-graphite">Production Tanks</h1>
          <p className="text-[#777777] mt-2">Monitor and manage all production tanks</p>
        </div>
        <div className="flex items-center gap-3">
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
            className="px-6 py-3 bg-copper hover:bg-copper/90 text-white rounded-lg font-medium transition"
          >
            + Add New Tank
          </button>
          <button
            onClick={handleClearAll}
            className="px-6 py-3 bg-graphite hover:opacity-90 text-white rounded-lg font-medium transition"
          >
            Clear All Tanks
          </button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">Total Tanks</div>
          <div className="text-3xl font-bold text-graphite">{totalTanks}</div>
        </div>
        <div className="bg-beige rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">In Use</div>
          <div className="text-3xl font-bold text-graphite">{tanksInUse}</div>
        </div>
        <div className="bg-beige rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">Empty</div>
          <div className="text-3xl font-bold text-graphite">{emptyTanks}</div>
        </div>
        <div className="bg-beige rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">Utilization</div>
          <div className="text-3xl font-bold text-graphite">{utilizationPercent.toFixed(0)}%</div>
          <div className="text-xs text-graphite mt-1">
            {totalVolume.toFixed(0)}L / {totalCapacity.toFixed(0)}L
          </div>
        </div>
      </div>

      {/* Redistillation Alert */}
      {redistillationTanks.length > 0 && showRedistillationAlert && (
        <div className="bg-copper-10 border-l-4 border-copper p-4 mb-6 rounded-r-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-copper" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-graphite">
                  {redistillationTanks.length} tank{redistillationTanks.length > 1 ? 's' : ''} pending redistillation
                </h3>
                <div className="mt-2 text-sm text-[#777777]">
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
              className="flex-shrink-0 ml-4 text-copper hover:opacity-80"
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
        <div className="bg-copper-10 border border-copper-30 rounded-lg p-6">
          <p className="text-graphite">No tanks found in database.</p>
          <p className="text-sm text-[#777777] mt-2">Run the import script to load real tank inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tanks.map(tank => (
            <TankCard
              key={tank.id}
              tank={tank}
              onEdit={handleEdit}
              onTransform={handleTransform}
              onInfuse={handleInfuse}
              onAdjust={handleAdjust}
              onCombine={handleCombine}
              onViewHistory={handleViewHistory}
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
            setCurrentAction(null)
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {isTransformOpen && selectedTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-copper text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Transform Product</h2>
              <p className="text-sm mt-1">{selectedTank.tank_id} • {selectedTank.tank_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New product name</label>
                <input
                  type="text"
                  value={transformProductName}
                  onChange={(e) => setTransformProductName(e.target.value)}
                  className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                  placeholder="Spiced Rum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link recipe (optional)</label>
                <select
                  value={transformRecipeId}
                  onChange={(e) => setTransformRecipeId(e.target.value)}
                  className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                >
                  <option value="">Select recipe...</option>
                  {availableRecipes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
              <button
                onClick={() => { setIsTransformOpen(false); setSelectedTank(null); setCurrentAction(null) }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={performTransform}
                className="px-6 py-2 bg-copper hover:bg-copper/90 text-white rounded-lg transition"
              >
                Transform
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdjustOpen && selectedTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-copper-red text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Adjust Volume / ABV</h2>
              <p className="text-sm mt-1">{selectedTank.tank_id} • {selectedTank.tank_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ABV (%)</label>
                  <input
                    type="number"
                    value={adjustAbv}
                    onChange={(e) => setAdjustAbv(e.target.value)}
                    className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="40.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume (L)</label>
                  <input
                    type="number"
                    value={adjustVolume}
                    onChange={(e) => setAdjustVolume(e.target.value)}
                    className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                    step="0.1"
                    min="0"
                    placeholder="500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper"
                  placeholder="Evaporation, transfer loss, measurement update..."
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
              <button
                onClick={() => { setIsAdjustOpen(false); setSelectedTank(null); setCurrentAction(null) }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={performAdjust}
                className="px-6 py-2 bg-copper hover:bg-copper/90 text-white rounded-lg transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {isInfusionOpen && selectedTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-copper-amber text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Add Ingredients / Infusion</h2>
              <p className="text-sm mt-1">{selectedTank.tank_id} • {selectedTank.tank_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Infusion type</label>
                <input
                  type="text"
                  value={infusionType}
                  onChange={(e) => setInfusionType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="coffee, spice, vanilla..."
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700 mb-2">Botanicals</div>
                  <input
                    type="text"
                    value={botanicalSearch}
                    onChange={(e) => setBotanicalSearch(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    placeholder="Search..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {botanicals
                    .filter(b => b.name.toLowerCase().includes(botanicalSearch.toLowerCase()))
                    .map(b => {
                      const existing = infusionItems.find(it => it.id === b.id)
                      return (
                        <div key={b.id} className="border rounded-lg p-3 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{b.name}</div>
                            <div className="text-xs text-gray-600">Available: {b.currentStock} {b.unit}</div>
                          </div>
                          <input
                            type="number"
                            value={existing?.quantity?.toString() || ''}
                            onChange={(e) => {
                              const q = e.target.value === '' ? 0 : Number(e.target.value)
                              setInfusionItems(prev => {
                                const others = prev.filter(it => it.id !== b.id)
                                return [...others, { id: b.id, name: b.name, unit: b.unit, quantity: Number.isFinite(q) ? q : 0 }]
                              })
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            placeholder={`0 ${b.unit}`}
                            min="0"
                            step="0.1"
                          />
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
              <button
                onClick={() => { setIsInfusionOpen(false); setSelectedTank(null); setCurrentAction(null) }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={performInfusion}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {currentAction === 'combine' && combineSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-700 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Combine Tanks</h2>
              <p className="text-sm mt-1">{combineSource.tank_id} • {(combineSource.current_volume_l || combineSource.volume || 0).toFixed(0)}L @ {(combineSource.current_abv || combineSource.abv || 0).toFixed(1)}%</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Select tanks to combine</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tanks.filter(t => t.id !== combineSource.id).map(t => {
                    const vol = Number(t.current_volume_l || t.volume || 0)
                    const abv = Number(t.current_abv || t.abv || 0)
                    const checked = combineSelectedIds.includes(t.id)
                    return (
                      <label key={t.id} className="flex items-center gap-3 border rounded-lg p-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...combineSelectedIds, t.id]
                              : combineSelectedIds.filter(id => id !== t.id)
                            setCombineSelectedIds(next)
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{t.tank_id} • {t.tank_name}</div>
                          <div className="text-sm text-gray-600">{vol.toFixed(0)}L @ {Number.isFinite(abv) ? abv.toFixed(1) : '—'}%</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New tank name</label>
                  <input
                    type="text"
                    value={combineNewName}
                    onChange={(e) => setCombineNewName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Coffee Liqueur Blend"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product name</label>
                  <input
                    type="text"
                    value={combineProductName}
                    onChange={(e) => setCombineProductName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Coffee Liqueur"
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
              <button
                onClick={() => {
                  setCombineSource(null)
                  setCombineSelectedIds([])
                  setCombineNewName('')
                  setCombineProductName('')
                  setCurrentAction(null)
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={performCombine}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Combine
              </button>
            </div>
          </div>
        </div>
      )}

      {isHistoryOpen && selectedTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gray-800 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Tank History</h2>
              <p className="text-sm mt-1">{selectedTank.tank_id} • {selectedTank.tank_name}</p>
            </div>
            <div className="p-6 space-y-3">
              {historyEntries.length === 0 ? (
                <div className="text-gray-600 text-sm">No history entries found.</div>
              ) : (
                historyEntries.map((h) => (
                  <div key={h.id} className="border rounded-lg p-3">
                    <div className="text-sm text-gray-900">{new Date(h.created_at).toLocaleString()}</div>
                    <div className="text-sm font-semibold text-gray-800">{h.action}</div>
                    {h.notes && <div className="text-sm text-gray-600">{h.notes}</div>}
                  </div>
                ))
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => {
                  setIsHistoryOpen(false)
                  setSelectedTank(null)
                  setCurrentAction(null)
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
