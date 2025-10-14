'use client'

import { useState, useEffect } from 'react'
import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { DistillationSessionCalculator } from '@/modules/production/services/distillation-session-calculator.service'
import { merchantMaeGinDistillation, rainforestGinDistillation, signatureDryGinDistillation } from '@/modules/production/sessions/merchant-mae-gin-distillation.session'
import LiveSessionTracker from '@/modules/production/components/LiveSessionTracker'
import LiveDistillationModal from '@/modules/production/components/LiveDistillationModal'
import DistillationCutsModal from '@/modules/production/components/DistillationCutsModal'
import LiveDistillationTracker from '@/modules/production/components/LiveDistillationTracker'

export default function BatchOverviewPage() {
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

  useEffect(() => {
    setLoading(true)
    try {
      const exampleSessions = [
        merchantMaeGinDistillation,
        rainforestGinDistillation,
        signatureDryGinDistillation
      ]

      const processedSessions = exampleSessions.map(session => 
        DistillationSessionCalculator.processDistillationSession(session)
      )

      setSessions(processedSessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load distillation sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter sessions by year, month, and search term
  const filteredSessions = sessions.filter(session => {
    const sessionYear = new Date(session.date).getFullYear()
    const sessionMonth = new Date(session.date).getMonth() + 1
    
    const yearMatch = sessionYear === selectedYear
    const monthMatch = selectedMonth === 'all' || sessionMonth.toString() === selectedMonth
    const searchMatch = searchTerm === '' || 
      session.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.spiritRun.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.still.toLowerCase().includes(searchTerm.toLowerCase())
    
    return yearMatch && monthMatch && searchMatch
  })

  // Group sessions by month for calendar view
  const sessionsByMonth = filteredSessions.reduce((acc, session) => {
    const month = new Date(session.date).getMonth() + 1
    const monthName = new Date(session.date).toLocaleString('en-US', { month: 'long' })
    
    if (!acc[month]) {
      acc[month] = { name: monthName, sessions: [] }
    }
    acc[month].sessions.push(session)
    return acc
  }, {} as Record<number, { name: string; sessions: DistillationSession[] }>)

  const months = [
    { value: 'all', label: 'All months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600 bg-green-100'
    if (efficiency >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getStatusIcon = (session: DistillationSession) => {
    const daysSince = Math.floor((new Date().getTime() - new Date(session.date).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince <= 7) return '🟢'
    if (daysSince <= 30) return '🟡'
    return '🔴'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Distillation Batch Overview</h1>
            <p className="text-xl text-blue-100 mb-8">
              Track, analyze, and manage your distillation runs with real-time insights
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold">{filteredSessions.length}</div>
                <div className="text-blue-100">Total Batches</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold">
                  {filteredSessions.reduce((sum, s) => sum + (s.lalOut || 0), 0).toFixed(1)}L
                </div>
                <div className="text-blue-100">LAL Produced</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold">
                  {filteredSessions.length > 0 ? 
                    (filteredSessions.reduce((sum, s) => sum + (s.lalEfficiency || 0), 0) / filteredSessions.length).toFixed(1) 
                    : 0}%
                </div>
                <div className="text-blue-100">Avg Efficiency</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold">
                  ${filteredSessions.reduce((sum, s) => sum + (s.costs?.totalAUD || 0), 0).toFixed(0)}
                </div>
                <div className="text-blue-100">Total Cost</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search batches, stills, or SKUs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                🔲 Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="space-y-8">
                {Object.entries(sessionsByMonth)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([month, data]) => (
                    <div key={month} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">
                          {data.name} {selectedYear}
                        </h2>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {data.sessions.length} batches
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.sessions.map((session) => (
                          <div
                            key={session.id}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                            onClick={() => {
                              setSelectedSession(session)
                              setShowDetailsModal(true)
                            }}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{getStatusIcon(session)}</span>
                                <div>
                                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {session.sku}
                                  </h3>
                                  <p className="text-sm text-gray-600">{session.spiritRun}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">
                                  {new Date(session.date).getDate()}/{month}
                                </div>
                                <div className="text-xs text-gray-400">{session.boilerOn}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Still:</span>
                                <span className="font-medium">{session.still}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">LAL:</span>
                                <span className="font-medium">{(session.lalOut || 0).toFixed(1)}L</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Efficiency:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(session.lalEfficiency || 0)}`}>
                                  {(session.lalEfficiency || 0).toFixed(1)}%
                                </span>
                              </div>
                              {session.costs && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Cost:</span>
                                  <span className="font-medium">${session.costs.totalAUD.toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedSession(session)
                                    setShowUnifiedTracker(true)
                                  }}
                                  className="bg-indigo-600 text-white px-2 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                                >
                                  🎯 Live Track
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedSession(session)
                                    setShowCutsModal(true)
                                  }}
                                  className="bg-purple-600 text-white px-2 py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                                >
                                  ⚗️ Cuts Only
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => {
                      setSelectedSession(session)
                      setShowDetailsModal(true)
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getStatusIcon(session)}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {session.sku}
                          </h3>
                          <p className="text-sm text-gray-600">{session.spiritRun}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{session.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Still:</span>
                        <span className="font-medium">{session.still}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">LAL:</span>
                        <span className="font-medium">{(session.lalOut || 0).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(session.lalEfficiency || 0)}`}>
                          {(session.lalEfficiency || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Still</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAL</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getStatusIcon(session)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{session.sku}</div>
                                <div className="text-sm text-gray-500">{session.spiritRun}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.still}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(session.lalOut || 0).toFixed(1)}L</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(session.lalEfficiency || 0)}`}>
                              {(session.lalEfficiency || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${session.costs?.totalAUD.toFixed(0) || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSession(session)
                                  setShowUnifiedTracker(true)
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Live Track
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSession(session)
                                  setShowCutsModal(true)
                                }}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Cuts Only
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedSession.sku} Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{selectedSession.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Still</label>
                  <p className="text-gray-900">{selectedSession.still}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                  <p className="text-gray-900">{selectedSession.chargeVolumeL}L</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ABV</label>
                  <p className="text-gray-900">{selectedSession.chargeABV}%</p>
                </div>
              </div>
              
              {selectedSession.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Tracker Modal */}
      {showLiveTracker && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Real-Time Tracking - {selectedSession.sku}
              </h3>
              <button
                onClick={() => setShowLiveTracker(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <LiveSessionTracker 
              session={selectedSession}
              onUpdate={(updatedSession) => {
                setSessions(prev => prev.map(s => 
                  s.id === updatedSession.id ? updatedSession : s
                ))
                setSelectedSession(updatedSession)
              }}
            />
          </div>
        </div>
      )}

      {/* Live Distillation Modal */}
      {showLiveDistillation && selectedSession && (
        <LiveDistillationModal
          session={selectedSession}
          isOpen={showLiveDistillation}
          onClose={() => setShowLiveDistillation(false)}
          onSave={(details) => {
            console.log('Saving distillation details:', details)
            // Here you would save to your database
            // For now, we'll just log it
            alert('Distillation details saved successfully!')
          }}
        />
      )}

      {/* Unified Live Distillation Tracker */}
      {showUnifiedTracker && selectedSession && (
        <LiveDistillationTracker
          session={selectedSession}
          isOpen={showUnifiedTracker}
          onClose={() => setShowUnifiedTracker(false)}
          onSave={(runData) => {
            console.log('Saving unified distillation run:', runData)
            // Here you would save to your database
            // For now, we'll just log it
            alert('Unified distillation run saved successfully!')
          }}
        />
      )}

      {/* Distillation Cuts Modal */}
      {showCutsModal && selectedSession && (
        <DistillationCutsModal
          session={selectedSession}
          isOpen={showCutsModal}
          onClose={() => setShowCutsModal(false)}
          onSave={(cutsData, powerData) => {
            console.log('Saving cuts data:', cutsData)
            console.log('Saving power data:', powerData)
            // Here you would save to your database
            // For now, we'll just log it
            alert('Cuts and power data saved successfully!')
          }}
        />
      )}
    </div>
  )
}