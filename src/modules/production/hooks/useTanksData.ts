'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tank, TankUpdateInput, TankHistoryEntry } from '@/modules/production/types/tank.types'

export function useTanksData() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showRedistillationAlert, setShowRedistillationAlert] = useState(true)
  const [currentAction, setCurrentAction] = useState<null | 'transform' | 'infusion' | 'adjust' | 'combine' | 'history'>(null)

  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<TankHistoryEntry[]>([])

  // Combine state
  const [combineSource, setCombineSource] = useState<Tank | null>(null)
  const [combineSelectedIds, setCombineSelectedIds] = useState<string[]>([])
  const [combineTargetId, setCombineTargetId] = useState<string>('')
  const [combineNewName, setCombineNewName] = useState('')
  const [combineProductName, setCombineProductName] = useState('')

  // Infusion state
  const [isInfusionOpen, setIsInfusionOpen] = useState(false)
  const [infusionType, setInfusionType] = useState('')
  const [botanicals, setBotanicals] = useState<Array<{ id: string; name: string; unit: string; currentStock: number }>>([])
  const [botanicalSearch, setBotanicalSearch] = useState('')
  const [infusionItems, setInfusionItems] = useState<Array<{ id: string; name: string; unit: string; quantity: number }>>([])

  // Transform state
  const [isTransformOpen, setIsTransformOpen] = useState(false)
  const [transformProductName, setTransformProductName] = useState('')
  const [availableRecipes, setAvailableRecipes] = useState<Array<{ id: string; name: string }>>([])
  const [transformRecipeId, setTransformRecipeId] = useState<string>('')

  // Adjust state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [adjustAbv, setAdjustAbv] = useState<string>('')
  const [adjustVolume, setAdjustVolume] = useState<string>('')
  const [adjustNotes, setAdjustNotes] = useState<string>('')

  const supabase = createClient()

  // Summary statistics
  const totalTanks = tanks.length
  const tanksInUse = tanks.filter(t => t.status !== 'empty' && t.status !== 'cleaning' && t.status !== 'unavailable').length
  const emptyTanks = tanks.filter(t => t.status === 'empty').length
  const totalVolume = tanks.reduce((sum, t) => sum + (t.current_volume_l || t.volume || 0), 0)
  const totalCapacity = tanks.reduce((sum, t) => sum + (t.capacity_l || t.capacity || 0), 0)
  const utilizationPercent = totalCapacity > 0 ? (totalVolume / totalCapacity) * 100 : 0
  const redistillationTanks = tanks.filter(t => t.status === 'pending_redistillation')

  const loadTanks = useCallback(async (retryCount: number = 0) => {
    try {
      setLoading(true)
      const url = typeof window !== 'undefined'
        ? `${window.location.origin}/api/production/tanks`
        : '/api/production/tanks'
      const res = await fetch(url, { cache: 'no-store' })
      let data: Tank[] = []
      let apiError: string | null = null
      try {
        const json = await res.json()
        data = Array.isArray(json?.tanks) ? json.tanks : []
        apiError = typeof json?.error === 'string' && json.error ? json.error : null
      } catch {
        apiError = 'Failed to parse response'
      }
      if (!res.ok || apiError) {
        if (retryCount < 2) {
          setTimeout(() => loadTanks(retryCount + 1), 1000)
          return
        }
        setError(String(apiError || `HTTP ${res.status}`))
        return
      }
      setTanks(data || [])
      if (!data || data.length === 0) {
        setError('No tanks found in database')
      }
    } catch (error: any) {
      if (retryCount < 2) {
        setTimeout(() => loadTanks(retryCount + 1), 1000)
        return
      }
      const msg = typeof error?.message === 'string' ? error.message : 'Unknown error loading tanks'
      console.error('Error loading tanks:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTanks()

    const channel = supabase
      .channel('tanks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tanks' },
        () => { loadTanks() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleClearAll = useCallback(async () => {
    setTanks([])
    setError(null)
  }, [])

  const handleEdit = useCallback((tank: Tank) => {
    setSelectedTank(tank)
    setIsModalOpen(true)
  }, [])

  const handleTransform = useCallback((tank: Tank) => {
    setSelectedTank(tank)
    setCurrentAction('transform')
    setTransformProductName(tank.product || '')
    setTransformRecipeId('')
    setIsTransformOpen(true)
    ;(async () => {
      try {
        const { data } = await supabase.from('recipes').select('id, name').order('name')
        setAvailableRecipes((data || []).map((r: any) => ({ id: r.id, name: r.name })))
      } catch {
        setAvailableRecipes([])
      }
    })()
  }, [supabase])

  const handleAdjust = useCallback((tank: Tank) => {
    setSelectedTank(tank)
    setCurrentAction('adjust')
    setAdjustAbv((tank.current_abv ?? tank.abv ?? '') as any as string)
    setAdjustVolume((tank.current_volume_l ?? tank.volume ?? '') as any as string)
    setAdjustNotes('')
    setIsAdjustOpen(true)
  }, [])

  const handleInfuse = useCallback(async (tank: Tank) => {
    setSelectedTank(tank)
    setCurrentAction('infusion')
    setInfusionType('')
    setInfusionItems([])
    setIsInfusionOpen(true)
    try {
      const res = await fetch('/api/inventory?category=Botanicals')
      const list = await res.json()
      const rows = Array.isArray(list) ? list : []
      setBotanicals(rows.map((r: any) => ({ id: r.id, name: r.name, unit: r.unit || 'unit', currentStock: Number(r.currentStock || 0) })))
    } catch {
      setBotanicals([])
    }
  }, [])

  const handleViewHistory = useCallback(async (tank: Tank) => {
    setSelectedTank(tank)
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
  }, [supabase])

  const handleCombine = useCallback((tank: Tank) => {
    setCombineSource(tank)
    setCombineSelectedIds([])
    setCombineTargetId(tank.id)
    setCombineNewName('')
    setCombineProductName('')
    setCurrentAction('combine')
  }, [])

  const handleSave = useCallback(async (tankId: string, updates: TankUpdateInput & { tank_id?: string, tank_name?: string, capacity_l?: number }) => {
    try {
      if (!tankId) {
        const { error } = await supabase
          .from('tanks')
          .insert({
            organization_id: tanks[0]?.organization_id || await (await import('@/lib/auth/get-org-id')).getOrganizationId(),
            tank_id: updates.tank_id,
            tank_name: updates.tank_name,
            tank_type: 'spirits',
            capacity_l: updates.capacity_l || 1000,
            product: updates.product,
            current_abv: updates.current_abv,
            current_volume_l: updates.current_volume_l,
            status: updates.status || 'empty',
            notes: updates.notes,
            last_updated_by: updates.last_updated_by,
            batch_id: (updates as any)?.batch_id
          })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tanks')
          .update(updates)
          .eq('id', tankId)
        if (error) throw error

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
      await loadTanks()
    } catch (error) {
      console.error('Error saving tank:', error)
      throw error
    }
  }, [supabase, tanks, currentAction, loadTanks])

  const handleDelete = useCallback(async (tankId: string) => {
    try {
      const { error } = await supabase.from('tanks').delete().eq('id', tankId)
      if (error) throw error
      await loadTanks()
    } catch (error) {
      console.error('Error deleting tank:', error)
      throw error
    }
  }, [supabase, loadTanks])

  const performCombine = useCallback(async () => {
    if (!combineSource) return
    const fallbackTarget = combineTargetId || (combineSelectedIds[0] || '')
    if (!fallbackTarget) { alert('Select a destination tank'); return }
    const srcIds = [combineSource.id, ...combineSelectedIds].filter(id => id !== fallbackTarget)
    const dest = tanks.find(t => t.id === fallbackTarget)
    if (!dest) return

    const inferPrefix = (name?: string | null) => {
      const n = (name || '').toLowerCase()
      if (n.includes('gin')) return 'GIN'
      if (n.includes('vodka')) return 'VODKA'
      if (n.includes('rum')) return 'RUM'
      if (n.includes('cane')) return 'CS'
      if (n.includes('liqueur')) return 'LIQ'
      return 'BLEND'
    }
    const genBatchId = (base?: string | null) => {
      const prefix = inferPrefix(base)
      const yr = new Date().getFullYear().toString().slice(-2)
      const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
      return `${prefix}-${yr}-${rand}`
    }

    const destVol = Number(dest.current_volume_l || dest.volume || 0)
    const destAbvRaw = Number(dest.current_abv || dest.abv || 0)
    const destAbv = Number.isFinite(destAbvRaw) ? destAbvRaw : 0
    const sources = tanks.filter(t => srcIds.includes(t.id))
    const sourcePairs = sources.map(t => {
      const v = Number(t.current_volume_l || t.volume || 0)
      const aRaw = Number(t.current_abv || t.abv || 0)
      const a = Number.isFinite(aRaw) ? aRaw : 0
      return { v, a }
    })
    const sourceTankIds = sources.map(s => s.tank_id).filter(Boolean)
    const productParts = [
      ...(dest.product ? [dest.product] : dest.tank_name ? [dest.tank_name] : []),
      ...sources.map(s => (s.product ? s.product : (s.tank_name || s.tank_id)))
    ].map(s => String(s || '').trim()).filter(Boolean)
    const uniqueProducts = Array.from(new Set(productParts))
    const combinedProductName = (combineProductName.trim() || (uniqueProducts.length ? uniqueProducts.join(' + ') : 'Blend'))
    const blendedIds = [dest.tank_id, ...sourceTankIds].filter(Boolean)
    const combinedTankName = (combineNewName.trim() || `Blend of ${blendedIds.join(' + ')}`)
    const sourceVolume = sourcePairs.reduce((sum, p) => sum + p.v, 0)
    if (sourceVolume <= 0) { alert('No source volume to merge'); setCurrentAction(null); return }
    const totalVol = destVol + sourceVolume
    const totalAlcohol = (destVol * destAbv) + sourcePairs.reduce((sum, p) => sum + (p.v * p.a), 0)
    const newAbv = totalAlcohol / (totalVol || 1)

    const prevDest = { tank_name: dest.tank_name, capacity_l: dest.capacity_l, product: dest.product, current_abv: dest.current_abv, current_volume_l: dest.current_volume_l, status: dest.status, notes: dest.notes }
    const newBatchId = genBatchId(dest.product || dest.tank_name)
    const destUpdates = {
      current_volume_l: Number(totalVol.toFixed(2)),
      current_abv: Number.isFinite(newAbv) ? Number(newAbv.toFixed(2)) : null,
      product: combinedProductName || dest.product,
      tank_name: combinedTankName || dest.tank_name,
      batch_id: newBatchId,
      notes: [`Merged from ${sourceTankIds.join(', ')}`, dest.notes || ''].filter(Boolean).join('; '),
      last_updated_by: 'Blend'
    }
    await supabase.from('tanks').update(destUpdates).eq('id', dest.id)
    await supabase.from('tank_history').insert({ organization_id: dest.organization_id, tank_id: dest.id, action: 'Blend in', user_name: 'Blend', previous_values: prevDest, new_values: destUpdates, notes: `Merged sources: ${srcIds.join(', ')}; New batch: ${newBatchId}` })

    for (const t of sources) {
      const prev = { tank_name: t.tank_name, capacity_l: t.capacity_l, product: t.product, current_abv: t.current_abv, current_volume_l: t.current_volume_l, status: t.status, notes: t.notes }
      const updates = { current_volume_l: 0, status: 'empty' as const, product: null, current_abv: null, tank_name: null, notes: [`Merged into ${dest.tank_id}`, t.notes || ''].filter(Boolean).join('; '), last_updated_by: 'Blend' }
      await supabase.from('tanks').update(updates).eq('id', t.id)
      await supabase.from('tank_history').insert({ organization_id: t.organization_id, tank_id: t.id, action: 'Blend out', user_name: 'Blend', previous_values: prev, new_values: updates, notes: `Merged into ${dest.tank_id}` })
    }
    await loadTanks()
    setCombineSource(null); setCombineSelectedIds([]); setCombineTargetId(''); setCombineNewName(''); setCombineProductName(''); setCurrentAction(null)
  }, [combineSource, combineTargetId, combineSelectedIds, combineProductName, combineNewName, tanks, supabase, loadTanks])

  const performTransform = useCallback(async () => {
    if (!selectedTank) return
    const updates: TankUpdateInput & { notes?: string } = { product: transformProductName.trim() || null, last_updated_by: 'Transform' }
    if (transformRecipeId) {
      const recipeName = availableRecipes.find(r => r.id === transformRecipeId)?.name || transformRecipeId
      updates.notes = [selectedTank.notes || '', `Linked recipe: ${recipeName}`].filter(Boolean).join('; ')
    }
    await handleSave(selectedTank.id, updates)
    setIsTransformOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [selectedTank, transformProductName, transformRecipeId, availableRecipes, handleSave])

  const performAdjust = useCallback(async () => {
    if (!selectedTank) return
    const updates: TankUpdateInput = {
      current_abv: adjustAbv ? Number(adjustAbv) : null,
      current_volume_l: adjustVolume ? Number(adjustVolume) : null,
      notes: adjustNotes?.trim() ? adjustNotes.trim() : selectedTank.notes || null,
      last_updated_by: 'Adjustment'
    }
    await handleSave(selectedTank.id, updates)
    setIsAdjustOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [selectedTank, adjustAbv, adjustVolume, adjustNotes, handleSave])

  const performInfusion = useCallback(async () => {
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
    if (infusionItems.length > 0) {
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
        if (!res.ok) console.warn('Inventory movements error:', json?.error)
      } catch (e) {
        console.warn('Failed to consume inventory for infusion:', (e as any)?.message)
      }
    }
    await handleSave(selectedTank.id, updates)
    setIsInfusionOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [selectedTank, infusionItems, infusionType, handleSave])

  const closeModal = useCallback(() => {
    setIsModalOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [])

  const closeTransform = useCallback(() => {
    setIsTransformOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [])

  const closeAdjust = useCallback(() => {
    setIsAdjustOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [])

  const closeInfusion = useCallback(() => {
    setIsInfusionOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [])

  const closeCombine = useCallback(() => {
    setCombineSource(null); setCombineSelectedIds([]); setCombineTargetId(''); setCombineNewName(''); setCombineProductName(''); setCurrentAction(null)
  }, [])

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false); setSelectedTank(null); setCurrentAction(null)
  }, [])

  const openNewTank = useCallback(() => {
    const newTank: Tank = {
      id: '',
      organization_id: tanks[0]?.organization_id || '',
      tank_id: '',
      tank_name: '',
      tank_type: 'spirits',
      capacity_l: 1000,
      status: 'empty',
      batch_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setSelectedTank(newTank)
    setIsModalOpen(true)
  }, [tanks])

  return {
    // Data
    tanks, loading, error, selectedTank,
    // Summary
    totalTanks, tanksInUse, emptyTanks, totalVolume, totalCapacity, utilizationPercent, redistillationTanks,
    showRedistillationAlert, setShowRedistillationAlert,
    // Edit modal
    isModalOpen, closeModal, handleEdit, handleSave, handleDelete, openNewTank,
    // Transform
    isTransformOpen, transformProductName, setTransformProductName, transformRecipeId, setTransformRecipeId, availableRecipes,
    handleTransform, performTransform, closeTransform,
    // Adjust
    isAdjustOpen, adjustAbv, setAdjustAbv, adjustVolume, setAdjustVolume, adjustNotes, setAdjustNotes,
    handleAdjust, performAdjust, closeAdjust,
    // Infusion
    isInfusionOpen, infusionType, setInfusionType, botanicals, botanicalSearch, setBotanicalSearch, infusionItems, setInfusionItems,
    handleInfuse, performInfusion, closeInfusion,
    // Combine
    currentAction, combineSource, combineSelectedIds, setCombineSelectedIds, combineTargetId, setCombineTargetId,
    handleCombine, performCombine, closeCombine,
    // History
    isHistoryOpen, historyEntries, handleViewHistory, closeHistory,
    // Actions
    handleClearAll, loadTanks,
  }
}
