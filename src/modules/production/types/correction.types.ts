/**
 * Correction Patch System
 * 
 * Provides audit trail for batch data corrections
 */

import type { Json } from '@/types/supabase'

export interface CorrectionPatch {
  id: string
  user: string
  timestamp: string // ISO
  fieldPath: string // e.g., "cuts.hearts.volumeL"
  oldValue: Json | undefined
  newValue: Json | undefined
  reason?: string // optional
}

export interface BatchCorrection {
  batchId: string
  patches: CorrectionPatch[]
}




