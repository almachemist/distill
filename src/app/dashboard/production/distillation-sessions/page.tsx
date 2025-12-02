'use client'

import { useState, useEffect } from 'react'
import { DistillationSession, DistillationMetrics } from '@/modules/production/types/distillation-session.types'
import { DistillationSessionCalculator } from '@/modules/production/services/distillation-session-calculator.service'
import { merchantMaeGinDistillation } from '@/modules/production/sessions/merchant-mae-gin-distillation.session'
import { vodka003Distillation } from '@/modules/production/sessions/vodka-003-distillation.session'
import { rainforestGinRF30 } from '@/modules/production/sessions/rainforest-gin-rf30-distillation.session'

export default function DistillationSessionManagementPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<DistillationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<DistillationSession | null>(null)
  const [metrics, setMetrics] = useState<DistillationMetrics | null>(null)

  useEffect(() => {
    setLoading(true)
    try {
      // Load example sessions and process them with calculations
      const exampleSessions = [
        merchantMaeGinDistillation,
        rainforestGinRF30,
        vodka003Distillation
      ]

      const processedSessions = exampleSessions.map(session => 
        DistillationSessionCalculator.processDistillationSession(session)
      )

      setSessions(processedSessions)
      if (processedSessions.length > 0) {
        setSelectedSession(processedSessions[0])
        setMetrics(DistillationSessionCalculator.calculateDistillationMetrics(processedSessions[0]))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load distillation sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSessionSelect = (session: DistillationSession) => {
    setSelectedSession(session)
    setMetrics(DistillationSessionCalculator.calculateDistillationMetrics(session))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distillation Sessions</h1>
          <p className="text-gray-600 mt-2">Track and analyze your distillation runs with automatic cost calculations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{session.sku}</div>
                  <div className="text-sm text-gray-600">{session.spiritRun}</div>
                  <div className="text-sm text-gray-500">{session.date}</div>
                  <div className="text-sm text-gray-500">Still: {session.still}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2">
          {selectedSession && metrics && (
            <div className="space-y-6">
              {/* Session Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedSession.sku} – {selectedSession.spiritRun}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{metrics.inputLAL.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">LAL In</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{metrics.outputLAL.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">LAL Out</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.efficiency.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">${metrics.costPerLAL.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Cost/LAL</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Date:</span> {selectedSession.date}
                  </div>
                  <div>
                    <span className="font-medium">Still:</span> {selectedSession.still}
                  </div>
                  <div>
                    <span className="font-medium">Boiler On:</span> {selectedSession.boilerOn}
                  </div>
                  <div>
                    <span className="font-medium">Ethanol Batch:</span> {selectedSession.ethanolBatch}
                  </div>
                  <div>
                    <span className="font-medium">Charge Volume:</span> {selectedSession.chargeVolumeL}L @ {selectedSession.chargeABV}% ABV
                  </div>
                  <div>
                    <span className="font-medium">Distillation Time:</span> {selectedSession.distillationHours}h
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              {selectedSession.costs && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ethanol Cost:</span>
                      <span className="font-medium">${selectedSession.costs.ethanolAUD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Energy Cost:</span>
                      <span className="font-medium">${selectedSession.costs.electricityAUD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water Cost:</span>
                      <span className="font-medium">${selectedSession.costs.waterAUD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Botanical Cost:</span>
                      <span className="font-medium">${selectedSession.costs.botanicalAUD.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Cost:</span>
                        <span>${selectedSession.costs.totalAUD.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Output Phases */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Output Phases</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (L)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ABV (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedSession.outputs.map((output, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {output.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {output.volumeL}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {output.abv}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {output.lal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {output.vessel || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botanicals Used */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Botanicals Used
                  {selectedSession.totalBotanicals_g && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Total: {selectedSession.totalBotanicals_g}g)
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSession.botanicals.map((botanical, index) => (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
                      botanical.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                      botanical.status === 'issue' ? 'bg-red-50 border border-red-200' :
                      'bg-gray-50'
                    }`}>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {botanical.name}
                          {botanical.status === 'pending' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                          )}
                          {botanical.status === 'issue' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Issue</span>
                          )}
                        </div>
                        {botanical.notes && (
                          <div className="text-sm text-gray-500">{botanical.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {botanical.weightG}g
                        </div>
                        {botanical.ratio_percent && (
                          <div className="text-xs text-gray-500">
                            {botanical.ratio_percent.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charge Components */}
              {selectedSession.charge && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Charge Components</h3>
                  <div className="space-y-3">
                    {selectedSession.charge.components.map((component, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{component.source}</div>
                          <div className="text-sm text-gray-500 capitalize">{component.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            {component.volume_L}L @ {component.abv_percent}% ABV
                          </div>
                          <div className="text-xs text-gray-500">
                            {component.lal.toFixed(1)} LAL
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-gray-900">Total Charge:</span>
                        <div className="text-right">
                          <div className="text-gray-900">
                            {selectedSession.charge.total.volume_L}L @ {selectedSession.charge.total.abv_percent}% ABV
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedSession.charge.total.lal.toFixed(1)} LAL
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dilution Steps */}
              {selectedSession.dilutions && selectedSession.dilutions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dilution Steps</h3>
                  <div className="space-y-3">
                    {selectedSession.dilutions.map((step, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">Step {step.stepNo}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {step.newMakeL}L new make + {step.waterL}L water = {step.finalVolumeL}L @ {step.finalABV}% ABV
                        </div>
                        {step.notes && (
                          <div className="text-sm text-gray-500 mt-1">{step.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



