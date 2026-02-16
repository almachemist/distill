'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DistillationSession, DistillationCost } from '@/modules/production/types/distillation-session.types'
import { DistillationSessionCalculator } from '@/modules/production/services/distillation-session-calculator.service'
import { useDistillationRuns } from '@/modules/production/hooks/useDistillationRuns'
import { mapDbRowsToSessions } from '@/modules/production/services/distillation-session.mapper'
import { useAuth } from '@/modules/auth/hooks/useAuth'

type ModernCostBreakdown = {
  ethanolCost: number
  botanicalCost: number
  laborCost: number
  utilityCost: number
  totalCost: number
  costPerLAL: number
  costPerLiter: number
}

const isLegacyCost = (costs: DistillationSession['costs']): costs is DistillationCost =>
  !!costs && 'totalAUD' in costs

const isModernCost = (costs: DistillationSession['costs']): costs is ModernCostBreakdown =>
  !!costs && 'totalCost' in (costs as ModernCostBreakdown)

export function getTotalCostValue(costs?: DistillationSession['costs']) {
  if (!costs) return 0
  if (isLegacyCost(costs)) return costs.totalAUD || 0
  if (isModernCost(costs)) return costs.totalCost || 0
  return 0
}

export function getCostPerLALValue(session: DistillationSession) {
  const costs = session.costs
  if (!costs) return null
  if (isLegacyCost(costs)) {
    if (costs.costPerLAL != null) return costs.costPerLAL
    if (session.lalOut) return (costs.totalAUD || 0) / session.lalOut
    return null
  }
  if (isModernCost(costs)) {
    if (costs.costPerLAL != null) return costs.costPerLAL
    if (session.lalOut) return (costs.totalCost || 0) / session.lalOut
    return null
  }
  return null
}

export function getEfficiencyColor(efficiency: number) {
  if (efficiency >= 80) return 'text-green-600 bg-green-100'
  if (efficiency >= 60) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

export function getStatusIcon(session: DistillationSession) {
  const daysSince = Math.floor((new Date().getTime() - new Date(session.date).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSince <= 7) return '●'
  return '○'
}

export function getSessionStatus(session: DistillationSession): 'draft' | 'started' | 'completed' {
  const hasPhaseData = session.phases && Object.values(session.phases).some(phase =>
    Array.isArray(phase) ? phase.length > 0 : phase && Object.keys(phase).length > 0
  )
  const outputEntries = Array.isArray(session.outputs) ? session.outputs : []
  const hasOutputData = outputEntries.length > 0
  if (hasOutputData) return 'completed'
  if (hasPhaseData) return 'started'
  return 'draft'
}

export const MONTHS = [
  { value: 'all', label: 'All months' },
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
]

export function useBatchOverview() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<DistillationSession[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedSession, setSelectedSession] = useState<DistillationSession | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showLiveTracker, setShowLiveTracker] = useState(false)
  const [showLiveDistillation, setShowLiveDistillation] = useState(false)
  const [showCutsModal, setShowCutsModal] = useState(false)
  const [showUnifiedTracker, setShowUnifiedTracker] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'grid' | 'list'>('calendar')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSimpleEditModal, setShowSimpleEditModal] = useState(false)
  const [editingSession, setEditingSession] = useState<DistillationSession | null>(null)

  const { data: dbRows, isLoading: runsLoading, error: runsError } = useDistillationRuns()

  useEffect(() => {
    if (runsLoading) { setLoading(true); return }
    if (runsError) {
      setError(runsError instanceof Error ? runsError.message : 'Failed to load distillation runs')
      setLoading(false)
      return
    }
    try {
      const mapped = mapDbRowsToSessions(dbRows || [])
      const processedSessions = mapped.map(session =>
        DistillationSessionCalculator.processDistillationSession(session)
      )
      setSessions(processedSessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process distillation sessions')
    } finally {
      setLoading(false)
    }
  }, [dbRows, runsLoading, runsError])

  const filteredSessions = useMemo(() => sessions.filter(session => {
    const sessionYear = new Date(session.date).getFullYear()
    const sessionMonth = new Date(session.date).getMonth() + 1
    const yearMatch = sessionYear === selectedYear
    const monthMatch = selectedMonth === 'all' || sessionMonth.toString() === selectedMonth
    const searchMatch = searchTerm === '' ||
      session.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.still.toLowerCase().includes(searchTerm.toLowerCase())
    return yearMatch && monthMatch && searchMatch
  }), [sessions, selectedYear, selectedMonth, searchTerm])

  const sessionsByMonth = useMemo(() => filteredSessions.reduce((acc, session) => {
    const month = new Date(session.date).getMonth() + 1
    const monthName = new Date(session.date).toLocaleString('en-US', { month: 'long' })
    if (!acc[month]) acc[month] = { name: monthName, sessions: [] }
    acc[month].sessions.push(session)
    return acc
  }, {} as Record<number, { name: string; sessions: DistillationSession[] }>), [filteredSessions])

  return {
    user, loading, error,
    sessions, setSessions,
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    selectedSession, setSelectedSession,
    showDetailsModal, setShowDetailsModal,
    showLiveTracker, setShowLiveTracker,
    showLiveDistillation, setShowLiveDistillation,
    showCutsModal, setShowCutsModal,
    showUnifiedTracker, setShowUnifiedTracker,
    viewMode, setViewMode,
    searchTerm, setSearchTerm,
    showEditModal, setShowEditModal,
    showSimpleEditModal, setShowSimpleEditModal,
    editingSession, setEditingSession,
    filteredSessions, sessionsByMonth,
  }
}
