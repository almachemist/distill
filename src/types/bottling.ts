// Bottling Run Types for Distillery Management System

export type ProductType =
  | 'gin'
  | 'vodka'
  | 'rum'
  | 'cane_spirit'
  | 'spiced_rum'
  | 'pineapple_rum'
  | 'coffee_liqueur'
  | 'other_liqueur'

export type BottlingMode = 'simple' | 'blend'

export type BatchStatus = 'in_tank' | 'in_barrel' | 'bottled' | 'archived' | 'draft' | 'in_progress' | 'completed'

// Unified Batch type that works with both gin and rum batches
export interface Batch {
  id: string
  batchCode: string        // e.g. RAIN-24-3, RUM-23-1, CS-2024-001
  productName: string      // e.g. Rainforest Gin, Devil's Thumb Rum
  productType: ProductType
  volumeLitres: number     // liquid currently available
  abvPercent: number       // current ABV
  lal: number              // litres of absolute alcohol
  tankCode?: string        // e.g. T-330-A, Cask 36
  status: BatchStatus
  distilledAt?: string     // ISO date string
  notes?: string
}

export interface SelectedBatch {
  batch: Batch
  volumeToUseLitres: number
  lal: number
}

export interface DilutionPhase {
  id: string
  date: string
  waterAdded_L: number
  notes?: string
}

export interface BottleEntry {
  size_ml: number
  quantity: number
  volumeBottled_L: number
  lalBottled: number
}

export interface BottlingSummary {
  totalVolume_L: number
  totalLAL: number
  blendedABV: number
  totalWaterAdded_L: number
  finalVolume_L: number
  finalABV: number
  totalBottled_L: number
  remainingVolume_L: number
}

export interface BottlingRun {
  id?: string
  productType: ProductType
  mode: BottlingMode
  productName: string
  selectedBatches: SelectedBatch[]
  dilutionPhases: DilutionPhase[]
  bottleEntries: BottleEntry[]
  summary: BottlingSummary
  createdAt?: string
  isTest?: boolean
  notes?: string
}

// Helper function to determine bottling mode based on selected batches
export function getBottlingMode(batches: Batch[]): BottlingMode {
  if (batches.length === 0) return 'simple'

  const blendTypes: ProductType[] = ['rum', 'cane_spirit', 'spiced_rum', 'pineapple_rum']
  const hasBlendType = batches.some(b => blendTypes.includes(b.productType))

  return hasBlendType || batches.length > 1 ? 'blend' : 'simple'
}

// Calculate LAL (Litres of Absolute Alcohol)
export function calculateLAL(volume_L: number, abv_percent: number): number {
  return (volume_L * abv_percent) / 100
}

// Calculate blended ABV from total LAL and total volume
export function calculateBlendedABV(totalLAL: number, totalVolume_L: number): number {
  if (totalVolume_L === 0) return 0
  return (totalLAL / totalVolume_L) * 100
}

// Calculate water needed to reach target ABV
export function calculateWaterNeeded(
  currentLAL: number,
  currentVolume_L: number,
  targetABV: number
): number {
  if (targetABV === 0) return 0
  const currentABV = calculateBlendedABV(currentLAL, currentVolume_L)
  if (currentABV <= targetABV) return 0
  
  const finalVolume = (currentLAL / targetABV) * 100
  return finalVolume - currentVolume_L
}

// Calculate final ABV after adding water
export function calculateFinalABV(
  totalLAL: number,
  initialVolume_L: number,
  waterAdded_L: number
): number {
  const finalVolume = initialVolume_L + waterAdded_L
  if (finalVolume === 0) return 0
  return (totalLAL / finalVolume) * 100
}

// Calculate bottling summary
export function calculateBottlingSummary(
  selectedBatches: SelectedBatch[],
  dilutionPhases: DilutionPhase[],
  bottleEntries: BottleEntry[]
): BottlingSummary {
  // Calculate totals from selected batches
  const totalVolume_L = selectedBatches.reduce((sum, sb) => sum + sb.volumeToUseLitres, 0)
  const totalLAL = selectedBatches.reduce((sum, sb) => sum + sb.lal, 0)
  const blendedABV = calculateBlendedABV(totalLAL, totalVolume_L)

  // Calculate total water added from dilution phases
  const totalWaterAdded_L = dilutionPhases.reduce((sum, phase) => sum + (phase.waterAdded_L || 0), 0)
  const finalVolume_L = totalVolume_L + totalWaterAdded_L
  const finalABV = calculateFinalABV(totalLAL, totalVolume_L, totalWaterAdded_L)

  // Calculate total bottled
  const totalBottled_L = bottleEntries.reduce((sum, entry) => sum + (entry.volumeBottled_L || 0), 0)
  const remainingVolume_L = finalVolume_L - totalBottled_L

  return {
    totalVolume_L,
    totalLAL,
    blendedABV,
    totalWaterAdded_L,
    finalVolume_L,
    finalABV,
    totalBottled_L,
    remainingVolume_L
  }
}

// Helper: Convert API batch data to unified Batch type
export function normalizeBatch(apiBatch: unknown): Batch | null {
  try {
    const b = apiBatch as Record<string, unknown>
    let productType: ProductType = 'gin'
    if (typeof b.product_type === 'string') {
      productType = b.product_type as ProductType
    } else if (typeof b.productType === 'string') {
      productType = b.productType as ProductType
    }

    const batchCode =
      (b.batch_id as string) ||
      (b.batchCode as string) ||
      (b.run_id as string) ||
      (b.id as string) ||
      'UNKNOWN'

    const productName =
      (b.product_name as string) ||
      (b.productName as string) ||
      (b.recipe as string) ||
      (b.display_name as string) ||
      (b.sku as string) ||
      batchCode

    const volumeLitres =
      (b.volume_L as number) ||
      (b.volumeLitres as number) ||
      (b.volume_filled_l as number) ||
      (b.hearts_volume_l as number) ||
      0

    const abvPercent =
      (b.abv_percent as number) ||
      (b.abvPercent as number) ||
      (b.fill_abv_percent as number) ||
      (b.hearts_abv_percent as number) ||
      0

    const lal = calculateLAL(volumeLitres, abvPercent)

    const tankCode =
      (b.tank as string) ||
      (b.tankCode as string) ||
      (b.cask_number as string) ||
      undefined

    let status: BatchStatus = 'in_tank'
    if (typeof b.status === 'string') {
      status = b.status as BatchStatus
    }

    const distilledAt =
      (b.distilled_date as string) ||
      (b.distilledAt as string) ||
      (b.date as string) ||
      (b.distillation_date as string) ||
      undefined

    return {
      id: (b.id as string) || batchCode,
      batchCode,
      productName,
      productType,
      volumeLitres,
      abvPercent,
      lal,
      tankCode,
      status,
      distilledAt,
      notes: (b.notes as string | undefined)
    }
  } catch (error) {
    console.error('Error normalizing batch:', error, apiBatch)
    return null
  }
}

// Helper: Filter batches available for bottling
export function getAvailableBatches(batches: Batch[]): Batch[] {
  return batches.filter(b =>
    b.volumeLitres > 0 &&
    b.abvPercent > 0 &&
    (b.status === 'in_tank' || b.status === 'in_barrel' || b.status === 'completed')
  )
}
