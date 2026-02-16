import { useState, useEffect, useCallback } from 'react'
import { DistillationSession } from '../types/distillation-session.types'
import { CorrectionPatch } from '../types/correction.types'

// Helper to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
}

// Helper to set nested value immutably
const setNestedValue = (obj: any, path: string, value: any): any => {
  const clone = structuredClone(obj)
  const keys = path.split('.')
  let ref = clone
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!ref[keys[i]]) ref[keys[i]] = {}
    ref = ref[keys[i]]
  }
  
  ref[keys[keys.length - 1]] = value
  return clone
}

interface UseBatchEditingOptions {
  session: DistillationSession
  currentUser: string
  onSaveCorrections?: (batchId: string, patches: CorrectionPatch[]) => Promise<void>
}

export function useBatchEditing({ session, currentUser, onSaveCorrections }: UseBatchEditingOptions) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSession, setEditedSession] = useState<DistillationSession>(session)
  const [pendingPatches, setPendingPatches] = useState<CorrectionPatch[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Sync editedSession when session changes (unless we're editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedSession(session)
      setPendingPatches([])
    }
  }, [session, isEditing])

  // Use edited session for display when editing
  const displaySession = isEditing ? editedSession : session

  const applyPatch = useCallback((fieldPath: string, newVal: any) => {
    const oldVal = getNestedValue(editedSession, fieldPath)
    
    // Skip if value hasn't changed
    if (oldVal === newVal) return

    // Validate based on field type
    if (fieldPath.includes('volumeL') || fieldPath.includes('volume_L')) {
      if (typeof newVal === 'number' && newVal < 0) return
    }
    if (fieldPath.includes('abv') || fieldPath.includes('abv_percent')) {
      if (typeof newVal === 'number' && (newVal < 0 || newVal > 96)) return
    }
    if (fieldPath.includes('time')) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (typeof newVal === 'string' && !timeRegex.test(newVal) && newVal !== '') return
    }

    // Create patch record
    const patch: CorrectionPatch = {
      id: crypto.randomUUID(),
      user: currentUser,
      timestamp: new Date().toISOString(),
      fieldPath,
      oldValue: oldVal ?? null,
      newValue: newVal,
    }

    // Add to pending patches
    setPendingPatches((prev) => {
      const filtered = prev.filter((p) => p.fieldPath !== fieldPath)
      return [...filtered, patch]
    })

    // Apply to edited session
    setEditedSession((prev) => {
      const updated = setNestedValue(prev, fieldPath, newVal)
      
      // Auto-calculate LAL if volume and ABV are both available
      if (fieldPath.includes('volumeL') || fieldPath.includes('volume_L') || 
          fieldPath.includes('abv') || fieldPath.includes('abv_percent')) {
        const volumePath = fieldPath.includes('volumeL') || fieldPath.includes('volume_L') 
          ? fieldPath 
          : fieldPath.replace(/abv.*$/, fieldPath.includes('volumeL') ? 'volumeL' : 'volume_L')
        const abvPath = fieldPath.includes('abv') || fieldPath.includes('abv_percent')
          ? fieldPath
          : fieldPath.replace(/volume.*$/, fieldPath.includes('abv_percent') ? 'abv_percent' : 'abv')
        
        const volume = getNestedValue(updated, volumePath)
        const abv = getNestedValue(updated, abvPath)
        
        if (typeof volume === 'number' && typeof abv === 'number' && abv > 0) {
          const lalPath = fieldPath.replace(/volume.*$/, 'lal').replace(/abv.*$/, 'lal')
          const calculatedLAL = Number((volume * (abv / 100)).toFixed(1))
          return setNestedValue(updated, lalPath, calculatedLAL)
        }
      }
      
      return updated
    })
  }, [editedSession, currentUser])

  const handleSaveCorrections = useCallback(async () => {
    if (pendingPatches.length === 0) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      if (onSaveCorrections) {
        await onSaveCorrections(session.id, pendingPatches)
      } else {
        console.warn('onSaveCorrections not provided. Patches:', pendingPatches)
      }
      
      setPendingPatches([])
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save corrections:', error)
      alert('Failed to save corrections. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [pendingPatches, session.id, onSaveCorrections])

  const handleCancelEditing = useCallback(() => {
    setEditedSession(session)
    setPendingPatches([])
    setIsEditing(false)
  }, [session])

  const startEditing = useCallback(() => setIsEditing(true), [])

  const updateNotes = useCallback((value: string) => {
    setEditedSession(prev => ({ ...prev, notes: value }))
    const patch: CorrectionPatch = {
      id: crypto.randomUUID(),
      user: currentUser,
      timestamp: new Date().toISOString(),
      fieldPath: 'notes',
      oldValue: session.notes ?? null,
      newValue: value,
    }
    setPendingPatches((prev) => {
      const filtered = prev.filter((p) => p.fieldPath !== 'notes')
      return [...filtered, patch]
    })
  }, [currentUser, session.notes])

  return {
    isEditing,
    isSaving,
    displaySession,
    pendingPatches,
    applyPatch,
    startEditing,
    handleSaveCorrections,
    handleCancelEditing,
    updateNotes,
  }
}
