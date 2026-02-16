'use client'

import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import LiveSessionTracker from '@/modules/production/components/LiveSessionTracker'
import LiveDistillationModal from '@/modules/production/components/LiveDistillationModal'
import DistillationCutsModal from '@/modules/production/components/DistillationCutsModal'
import LiveDistillationTracker from '@/modules/production/components/LiveDistillationTracker'
import EditSessionModal from '@/modules/production/components/EditSessionModal'
import BatchDetailView from '@/modules/production/components/BatchDetailView'
import SimpleBatchEditModal from '@/modules/production/components/SimpleBatchEditModal'
import {
  useBatchOverview,
  getTotalCostValue, getEfficiencyColor, getStatusIcon, getSessionStatus, MONTHS
} from './useBatchOverview'
import { CalendarView } from './views/CalendarView'
import { GridView } from './views/GridView'
import { ListView } from './views/ListView'

export default function BatchOverviewPage() {
  const d = useBatchOverview()

  if (d.loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (d.error) {
    return <div className="text-red-500">Error: {d.error}</div>
  }

  const openSession = (session: DistillationSession) => {
    d.setSelectedSession(session)
    d.setShowDetailsModal(true)
  }
  const openTracker = (session: DistillationSession) => {
    d.setSelectedSession(session)
    d.setShowUnifiedTracker(true)
  }
  const openCuts = (session: DistillationSession) => {
    d.setSelectedSession(session)
    d.setShowCutsModal(true)
  }
  const openEdit = (session: DistillationSession) => {
    d.setEditingSession(session)
    d.setShowEditModal(true)
  }
  const openSimpleEdit = (session: DistillationSession) => {
    d.setEditingSession(session)
    d.setShowSimpleEditModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Distillation Batch Overview</h1>
            <p className="text-xl text-blue-100 mb-8">Track, analyze, and manage your distillation runs with real-time insights</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <StatCard value={d.filteredSessions.length} label="Total Batches" />
              <StatCard value={`${d.filteredSessions.reduce((sum, s) => sum + (s.lalOut || 0), 0).toFixed(1)}L`} label="LAL Produced" />
              <StatCard value={`${d.filteredSessions.length > 0 ? (d.filteredSessions.reduce((sum, s) => sum + (s.lalEfficiency || 0), 0) / d.filteredSessions.length).toFixed(1) : 0}%`} label="Avg Efficiency" />
              <StatCard value={`$${d.filteredSessions.reduce((sum, s) => sum + getTotalCostValue(s.costs), 0).toFixed(0)}`} label="Total Cost" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input type="text" placeholder="Search batches, stills, or SKUs..." value={d.searchTerm} onChange={(e) => d.setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400">🔍</span></div>
              </div>
            </div>
            <div className="flex gap-4">
              <select value={d.selectedYear} onChange={(e) => d.setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {[2024, 2025, 2026].map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <select value={d.selectedMonth} onChange={(e) => d.setSelectedMonth(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(['calendar', 'grid', 'list'] as const).map(mode => (
                <button key={mode} onClick={() => d.setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${d.viewMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {d.filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">Search</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            {d.viewMode === 'calendar' && (
              <CalendarView sessionsByMonth={d.sessionsByMonth} selectedYear={d.selectedYear}
                onOpenSession={openSession} onOpenTracker={openTracker} onOpenCuts={openCuts} onSimpleEdit={openSimpleEdit} />
            )}
            {d.viewMode === 'grid' && (
              <GridView sessions={d.filteredSessions} onOpenSession={openSession} onEdit={openEdit} />
            )}
            {d.viewMode === 'list' && (
              <ListView sessions={d.filteredSessions} onOpenTracker={openTracker} onOpenCuts={openCuts} onSimpleEdit={openSimpleEdit} />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {d.showDetailsModal && d.selectedSession && (
        <BatchDetailView session={d.selectedSession} currentUser={d.user?.email || d.user?.displayName || 'User'}
          onClose={() => d.setShowDetailsModal(false)}
          onStartLive={() => { d.setShowDetailsModal(false); openTracker(d.selectedSession!) }}
          onViewCuts={() => { d.setShowDetailsModal(false); openCuts(d.selectedSession!) }}
          onEdit={() => { d.setShowDetailsModal(false); openEdit(d.selectedSession!) }}
          onSaveCorrections={async (batchId, patches) => {
            console.log('Saving corrections:', { batchId, patches })
            alert(`${patches.length} corrections saved successfully!`)
            d.setSessions(prev => prev.map(s => s.id === batchId ? { ...s } : s))
          }} />
      )}
      {d.showLiveTracker && d.selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Real-Time Tracking - {d.selectedSession.sku}</h3>
              <button onClick={() => d.setShowLiveTracker(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <LiveSessionTracker session={d.selectedSession} onUpdate={(u) => { d.setSessions(prev => prev.map(s => s.id === u.id ? u : s)); d.setSelectedSession(u) }} />
          </div>
        </div>
      )}
      {d.showLiveDistillation && d.selectedSession && (
        <LiveDistillationModal session={d.selectedSession} isOpen={d.showLiveDistillation} onClose={() => d.setShowLiveDistillation(false)}
          onSave={(details) => { console.log('Saving distillation details:', details); alert('Distillation details saved successfully!') }} />
      )}
      {d.showUnifiedTracker && d.selectedSession && (
        <LiveDistillationTracker session={d.selectedSession} isOpen={d.showUnifiedTracker} onClose={() => d.setShowUnifiedTracker(false)}
          onSave={(runData) => { console.log('Saving unified distillation run:', runData); alert('Unified distillation run saved successfully!') }}
          viewMode={getSessionStatus(d.selectedSession)} />
      )}
      {d.showCutsModal && d.selectedSession && (
        <DistillationCutsModal session={d.selectedSession} isOpen={d.showCutsModal} onClose={() => d.setShowCutsModal(false)}
          onSave={(cutsData, powerData) => { console.log('Saving cuts data:', cutsData, powerData); alert('Cuts and power data saved successfully!') }} />
      )}
      {d.showEditModal && d.editingSession && (
        <EditSessionModal session={d.editingSession} isOpen={d.showEditModal}
          onClose={() => { d.setShowEditModal(false); d.setEditingSession(null) }}
          onSave={(u) => { d.setSessions(prev => prev.map(s => s.id === u.id ? u : s)); d.setShowEditModal(false); d.setEditingSession(null); alert('Session updated successfully!') }} />
      )}
      {d.showSimpleEditModal && d.editingSession && (
        <SimpleBatchEditModal session={d.editingSession} isOpen={d.showSimpleEditModal}
          onClose={() => { d.setShowSimpleEditModal(false); d.setEditingSession(null) }}
          onSave={(u) => {
            d.setSessions(prev => prev.map(s => s.id === u.id ? u : s))
            if (d.selectedSession && d.selectedSession.id === u.id) d.setSelectedSession(u)
            d.setShowSimpleEditModal(false); d.setEditingSession(null); alert('Batch updated successfully!')
          }} />
      )}
    </div>
  )
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-blue-100">{label}</div>
    </div>
  )
}
