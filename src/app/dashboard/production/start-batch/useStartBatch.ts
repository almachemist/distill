"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RecipeRepository } from '@/modules/recipes/services/recipe.repository'
import type { EthanolSelection } from '@/modules/production/components/EthanolBatchSelector'
import type { BotanicalSelection } from '@/modules/production/components/BotanicalSelector'
import type { PackagingSelection } from '@/modules/production/components/PackagingSelector'

const calculateLAL = (volume: number, abv: number): number =>
  Math.round((volume * abv / 100) * 10) / 10

export function useStartBatch() {
  const router = useRouter()
  const searchParams = useSearchParams() as URLSearchParams | null
  const recipeRepo = new RecipeRepository()

  const [recipes, setRecipes] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [productType, setProductType] = useState<'gin' | 'vodka' | 'ethanol'>('gin')
  const [selectedRecipeId, setSelectedRecipeId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [ethanolSelection, setEthanolSelection] = useState<EthanolSelection | null>(null)
  const [waterVolume, setWaterVolume] = useState(500)
  const [stillUsed, setStillUsed] = useState('Carrie')
  const [botanicals, setBotanicals] = useState<BotanicalSelection[]>([])
  const [packaging, setPackaging] = useState<PackagingSelection[]>([])
  const [otherComponents, setOtherComponents] = useState<Array<{ name: string; volume: number; abv: number }>>([])
  const [notes, setNotes] = useState('')
  const [showBotanicals, setShowBotanicals] = useState(false)
  const [showPackaging, setShowPackaging] = useState(false)
  const [tankIdParam, setTankIdParam] = useState<string | null>(null)
  const [tankVolume, setTankVolume] = useState<number>(0)
  const [tankAbv, setTankAbv] = useState<number>(0)

  // Calculations
  const ethanolVolume = tankIdParam ? tankVolume : (ethanolSelection?.quantity_l || 0)
  const ethanolABV = tankIdParam ? tankAbv : (ethanolSelection?.abv || 0)
  const ethanolLAL = calculateLAL(ethanolVolume, ethanolABV)
  const otherLAL = otherComponents.reduce((sum, comp) => sum + calculateLAL(comp.volume, comp.abv), 0)
  const totalVolume = ethanolVolume + waterVolume + otherComponents.reduce((sum, c) => sum + c.volume, 0)
  const totalLAL = ethanolLAL + otherLAL
  const avgABV = totalVolume > 0 ? (totalLAL / totalVolume) * 100 : 0

  // Cost calculations
  const ethanolCost = tankIdParam ? 0 : (ethanolSelection?.total_cost || 0)
  const botanicalCost = botanicals.reduce((sum, b) => sum + b.total_cost, 0)
  const packagingCost = packaging.reduce((sum, p) => sum + p.total_cost, 0)
  const totalCost = ethanolCost + botanicalCost + packagingCost

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

  const loadRecipes = useCallback(async () => {
    try {
      const data = await recipeRepo.fetchRecipes()
      setRecipes(data)
      if (data.length > 0 && !selectedRecipeId) {
        setSelectedRecipeId(data[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    }
  }, [recipeRepo, selectedRecipeId])

  useEffect(() => { loadRecipes() }, [loadRecipes])

  useEffect(() => {
    const rid = searchParams?.get('redistillTankId')
    const vol = searchParams?.get('volume')
    const abv = searchParams?.get('abv')
    const pt = searchParams?.get('productType')
    if (rid) {
      setTankIdParam(rid)
      setTankVolume(vol ? Number(vol) : 0)
      setTankAbv(abv ? Number(abv) : 0)
      setProductType(pt === 'ethanol' ? 'ethanol' : 'vodka')
      setBatchId(`VODKA-${rid}`)
    } else if (pt === 'vodka' || pt === 'ethanol' || pt === 'gin') {
      setProductType(pt as any)
    }
  }, [searchParams])

  const addOtherComponent = useCallback(() => {
    setOtherComponents(prev => [...prev, { name: '', volume: 0, abv: 0 }])
  }, [])

  const updateOtherComponent = useCallback((index: number, field: 'name' | 'volume' | 'abv', value: string | number) => {
    setOtherComponents(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const removeOtherComponent = useCallback((index: number) => {
    setOtherComponents(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (productType === 'gin' && !selectedRecipeId) { setError('Please select a gin recipe'); return }
    if (!batchId) { setError('Please enter a Batch ID'); return }
    if (!tankIdParam && !ethanolSelection) { setError('Please select an ethanol batch from inventory'); return }

    setLoading(true)
    setError(null)

    try {
      const components = [
        tankIdParam
          ? { name: `Tank ${tankIdParam}`, type: 'ethanol', volume_l: tankVolume, abv_percent: tankAbv, lal: ethanolLAL }
          : { name: ethanolSelection!.item_name, type: 'ethanol', volume_l: ethanolSelection!.quantity_l, abv_percent: ethanolSelection!.abv, lal: ethanolLAL },
        { name: 'Water', type: 'water', volume_l: waterVolume, abv_percent: 0, lal: 0 },
        ...otherComponents.map((c: any) => ({
          name: c.name, type: 'other', volume_l: c.volume, abv_percent: c.abv || 0, lal: (c.volume * (c.abv || 0)) / 100
        }))
      ]

      const preparationData = {
        productType, recipeId: selectedRecipeId || null, batchId, date, startTime, stillUsed,
        components, totalVolume, averageABV: avgABV, totalLAL, totalCost, notes
      }

      // 1. Create production run
      const createRes = await fetch('/api/production/runs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create', batch_id: batchId,
          product_type: productType === 'ethanol' ? 'vodka' : productType,
          product_name: selectedRecipe?.name || productType,
          recipe_id: selectedRecipeId || null, date, still_used: stillUsed,
          step_payload: { step_0_preparation: preparationData },
        })
      })
      if (!createRes.ok) { const errData = await createRes.json(); throw new Error(errData.error || 'Failed to create production run') }
      const runData = await createRes.json()
      const runId = runData.run_id

      // 2. Save charge columns
      await fetch('/api/production/runs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_draft', run_id: runId,
          columns: { charge_components: components, charge_total_volume_l: totalVolume, charge_total_abv_percent: avgABV, charge_total_lal: totalLAL, notes }
        })
      })

      // 3. Consume inventory (non-blocking)
      if (!tankIdParam && ethanolSelection) {
        try {
          await fetch('/api/production/batches-with-inventory', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              batch_id: batchId, batch_type: productType === 'ethanol' ? 'vodka' : productType,
              product_name: selectedRecipe?.name || productType, date, still_used: stillUsed, notes,
              ethanol: ethanolSelection, water_quantity_l: waterVolume,
              botanicals: botanicals.length > 0 ? botanicals : undefined,
              packaging: packaging.length > 0 ? packaging : undefined,
              created_by: 'current_user',
              organization_id: await (await import('@/lib/auth/get-org-id')).getOrganizationId()
            })
          })
        } catch (invErr) { console.warn('Inventory integration failed (non-blocking):', invErr) }
      }

      // 4. localStorage backward compatibility
      localStorage.setItem('distillation_preparation', JSON.stringify(preparationData))

      // 5. Navigate
      if (productType === 'gin') {
        router.push(`/dashboard/production/botanical-steeping?runId=${runId}&recipeId=${selectedRecipeId}&batchId=${batchId}`)
      } else {
        router.push(`/dashboard/production/heating?runId=${runId}&batchId=${batchId}`)
      }
    } catch (err: any) {
      console.error('Error saving batch:', err)
      setError(err.message || 'Failed to save batch. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [productType, selectedRecipeId, batchId, tankIdParam, ethanolSelection, tankVolume, tankAbv, ethanolLAL,
    waterVolume, otherComponents, date, startTime, stillUsed, selectedRecipe, totalVolume, avgABV, totalLAL,
    totalCost, notes, botanicals, packaging, router])

  const canSubmit = !!batchId && (productType !== 'gin' || !!selectedRecipeId) && (!!tankIdParam || !!ethanolSelection)

  return {
    recipes, loading, error, productType, setProductType, selectedRecipeId, setSelectedRecipeId,
    batchId, setBatchId, date, setDate, startTime, setStartTime,
    ethanolSelection, setEthanolSelection, waterVolume, setWaterVolume,
    stillUsed, setStillUsed, botanicals, setBotanicals, packaging, setPackaging,
    otherComponents, addOtherComponent, updateOtherComponent, removeOtherComponent,
    notes, setNotes, showBotanicals, setShowBotanicals, showPackaging, setShowPackaging,
    tankIdParam, tankVolume, setTankVolume, tankAbv, setTankAbv,
    ethanolVolume, ethanolABV, ethanolLAL, totalVolume, totalLAL, avgABV,
    ethanolCost, botanicalCost, packagingCost, totalCost,
    selectedRecipe, canSubmit, handleSubmit,
  }
}
