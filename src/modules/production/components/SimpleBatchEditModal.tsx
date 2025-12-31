'use client'

import { DistillationSession, OutputDetail, OutputPhase, RunDataPoint, ChargeComponent } from '../types/distillation-session.types'
import { useState, useEffect } from 'react'

interface SimpleBatchEditModalProps {
  session: DistillationSession
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSession: DistillationSession) => void
}

export default function SimpleBatchEditModal({
  session,
  isOpen,
  onClose,
  onSave,
}: SimpleBatchEditModalProps) {
  const [editedSession, setEditedSession] = useState<DistillationSession>(session)

  useEffect(() => {
    if (isOpen) {
      setEditedSession(session)
    }
  }, [session, isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(editedSession)
    onClose()
  }

  const handleChange = <K extends keyof DistillationSession>(field: K, value: DistillationSession[K]) => {
    setEditedSession(prev => ({ ...prev, [field]: value }))
  }

  type ChargeTotalKey = 'volume_L' | 'abv_percent' | 'lal'
  type ChargeTotalValue = number | null
  const handleChargeChange = (field: ChargeTotalKey, value: ChargeTotalValue) => {
    setEditedSession(prev => ({
      ...prev,
      charge: {
        components: prev.charge?.components ?? [],
        total: {
          volume_L: prev.charge?.total?.volume_L ?? null,
          abv_percent: prev.charge?.total?.abv_percent ?? null,
          lal: prev.charge?.total?.lal ?? null,
          [field]: value,
        },
      },
    }))
  }

  const handleChargeComponentChange = <K extends keyof ChargeComponent>(index: number, field: K, value: ChargeComponent[K]) => {
    setEditedSession(prev => ({
      ...prev,
      charge: {
        ...prev.charge!,
        components: prev.charge!.components.map((comp, i) =>
          i === index ? { ...comp, [field]: value } : comp
        ),
      },
    }))
  }

  const handleRunDataChange = <K extends keyof RunDataPoint>(index: number, field: K, value: RunDataPoint[K]) => {
    setEditedSession(prev => ({
      ...prev,
      runData: prev.runData?.map((run, i) =>
        i === index ? { ...run, [field]: value } : run
      ) || [],
    }))
  }

  const handleOutputChange = (index: number, field: string, value: unknown) => {
    setEditedSession(prev => {
      const outputs = prev.outputs ?? []
      const isPhase = (o: unknown): o is OutputPhase => {
        if (typeof o !== 'object' || o === null) return false
        const obj = o as Record<string, unknown>
        return 'name' in obj && ('volumeL' in obj || 'abv' in obj)
      }
      if (outputs.length === 0) {
        return { ...prev, outputs }
      }
      if (outputs.every(isPhase)) {
        const next: OutputPhase[] = (outputs as OutputPhase[]).map((out, i) =>
          i === index ? { ...out, [field]: value } as OutputPhase : out
        )
        return { ...prev, outputs: next }
      } else {
        const next: OutputDetail[] = (outputs as OutputDetail[]).map((out, i) =>
          i === index ? { ...out, [field]: value } as OutputDetail : out
        )
        return { ...prev, outputs: next }
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Batch</h2>
            <p className="text-sm text-gray-600 mt-1">{session.sku} - {session.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editedSession.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Still</label>
                <input
                  type="text"
                  value={editedSession.still}
                  onChange={(e) => handleChange('still', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boiler On</label>
                <input
                  type="text"
                  value={editedSession.boilerOn}
                  onChange={(e) => handleChange('boilerOn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editedSession.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Charge Total */}
          {editedSession.charge && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Charge Total</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedSession.charge.total.volume_L || ''}
                    onChange={(e) => handleChargeChange('volume_L', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="96"
                    value={editedSession.charge.total.abv_percent || ''}
                    onChange={(e) => handleChargeChange('abv_percent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LAL</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedSession.charge.total.lal || ''}
                    onChange={(e) => handleChargeChange('lal', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Charge Components */}
              {editedSession.charge.components && editedSession.charge.components.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Components</h4>
                  <div className="space-y-3">
                    {editedSession.charge.components.map((comp, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
                            <input
                              type="text"
                              value={comp.source}
                              onChange={(e) => handleChargeComponentChange(idx, 'source', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Volume (L)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={comp.volume_L || ''}
                              onChange={(e) => handleChargeComponentChange(idx, 'volume_L', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">ABV (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={comp.abv_percent || ''}
                              onChange={(e) => handleChargeComponentChange(idx, 'abv_percent', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">LAL</label>
                            <input
                              type="number"
                              step="0.1"
                              value={comp.lal || ''}
                              onChange={(e) => handleChargeComponentChange(idx, 'lal', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Run Data */}
          {editedSession.runData && editedSession.runData.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Run Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Phase</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Volume (L)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">ABV (%)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">LAL</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editedSession.runData.map((run, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm">{run.phase}</td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={run.time || ''}
                            onChange={(e) => handleRunDataChange(idx, 'time', e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="HH:MM"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={run.volume_L || ''}
                            onChange={(e) => handleRunDataChange(idx, 'volume_L', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={run.abv_percent || ''}
                            onChange={(e) => handleRunDataChange(idx, 'abv_percent', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={run.lal || ''}
                            onChange={(e) => handleRunDataChange(idx, 'lal', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={run.observations || ''}
                            onChange={(e) => handleRunDataChange(idx, 'observations', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outputs */}
          {editedSession.outputs && editedSession.outputs.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Outputs</h3>
              <div className="space-y-3">
                {editedSession.outputs.map((out, idx) => {
                  const isPhase = (out as OutputPhase | OutputDetail) && (out as OutputPhase).name !== undefined
                  const title = isPhase ? (out as OutputPhase).name : (out as OutputDetail).phase
                  return (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="font-medium text-gray-900 mb-2">{title}</div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Volume (L)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={isPhase ? ((out as OutputPhase).volumeL || '') : ((out as OutputDetail).volume_L || '')}
                            onChange={(e) => handleOutputChange(idx, isPhase ? 'volumeL' : 'volume_L', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">ABV (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={isPhase ? ((out as OutputPhase).abv || '') : ((out as OutputDetail).abv_percent || '')}
                            onChange={(e) => handleOutputChange(idx, isPhase ? 'abv' : 'abv_percent', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Vessel</label>
                          <input
                            type="text"
                            value={isPhase ? (((out as OutputPhase).vessel || '')) : (((out as OutputDetail).receivingVessel || ''))}
                            onChange={(e) => handleOutputChange(idx, isPhase ? 'vessel' : 'receivingVessel', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Observations</label>
                          <input
                            type="text"
                            value={isPhase ? (((out as OutputPhase).observations || '')) : ''}
                            onChange={(e) => handleOutputChange(idx, 'observations', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <textarea
              value={editedSession.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
