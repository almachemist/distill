'use client'

import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { useDistillationCuts, TANK_OPTIONS, type CutData, type PowerData } from './useDistillationCuts'

interface DistillationCutsModalProps {
  session: DistillationSession
  isOpen: boolean
  onClose: () => void
  onSave: (cutsData: CutData[], powerData: PowerData) => void
}

export default function DistillationCutsModal({ session, isOpen, onClose, onSave }: DistillationCutsModalProps) {
  const d = useDistillationCuts(isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Distillation Cuts Tracking</h2>
              <p className="text-purple-100">{session.sku} - {session.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-purple-100">Current Time</div>
                <div className="text-lg font-mono">{d.currentTime}</div>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Cuts */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuts Collection</h3>
              <div className="space-y-4">
                {d.cuts.map((cut) => (
                  <div key={cut.id} className={`border-2 rounded-xl p-4 transition-all duration-300 ${d.getCutStatusColor(cut.status)}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cut.icon}</span>
                        <div>
                          <h4 className="font-semibold">{cut.name}</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{d.getCutStatusIcon(cut.status)}</span>
                            <span className="capitalize">{cut.status}</span>
                            {cut.startTime && <span className="text-xs opacity-75">Duration: {d.formatDuration(cut.startTime, cut.endTime)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {cut.status === 'pending' && (
                          <button onClick={() => d.startCut(cut.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Start</button>
                        )}
                        {cut.status === 'active' && (
                          <button onClick={() => d.completeCut(cut.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Complete</button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label htmlFor={`cut_volume_${cut.id}`} className="block text-sm font-medium text-gray-700 mb-1">Volume (L)</label>
                        <input id={`cut_volume_${cut.id}`} type="number" step="0.1" value={cut.volume || ''}
                          onChange={(e) => d.updateCutField(cut.id, 'volume', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.0" />
                      </div>
                      <div>
                        <label htmlFor={`cut_abv_${cut.id}`} className="block text-sm font-medium text-gray-700 mb-1">ABV (%)</label>
                        <input id={`cut_abv_${cut.id}`} type="number" step="0.1" value={cut.abv || ''}
                          onChange={(e) => d.updateCutField(cut.id, 'abv', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.0" />
                      </div>
                      <div>
                        <label htmlFor={`cut_tank_${cut.id}`} className="block text-sm font-medium text-gray-700 mb-1">Tank</label>
                        <select id={`cut_tank_${cut.id}`} value={cut.tank}
                          onChange={(e) => d.updateCutField(cut.id, 'tank', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Select tank...</option>
                          {TANK_OPTIONS.map(tank => <option key={tank} value={tank}>{tank}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="block text-sm font-medium text-gray-700 mb-1">LAL</p>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm">{(cut.volume * cut.abv / 100).toFixed(2)}L</div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`cut_notes_${cut.id}`} className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
                      <textarea id={`cut_notes_${cut.id}`} value={cut.notes}
                        onChange={(e) => d.updateCutField(cut.id, 'notes', e.target.value)}
                        placeholder={`Add observations for ${cut.name.toLowerCase()}...`}
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                    </div>

                    {cut.startTime && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="font-medium">Start:</span> {new Date(cut.startTime).toLocaleTimeString()}</div>
                          {cut.endTime && <div><span className="font-medium">End:</span> {new Date(cut.endTime).toLocaleTimeString()}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Summary & Controls */}
            <div className="space-y-6">
              <SummaryPanel cuts={d.cuts} totalVolume={d.calculateTotalVolume()} totalLAL={d.calculateTotalLAL()} />
              <TankUsagePanel cuts={d.cuts} />
              <PowerControlPanel powerData={d.powerData} updatePowerField={d.updatePowerField} turnElementsOn={d.turnElementsOn} turnElementsOff={d.turnElementsOff} />
              <ControlsPanel isTracking={d.isTracking} setIsTracking={d.setIsTracking} onSave={() => onSave(d.cuts, d.powerData)} onClose={onClose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryPanel({ cuts, totalVolume, totalLAL }: { cuts: CutData[]; totalVolume: number; totalLAL: number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between"><span className="text-sm text-gray-600">Total Volume:</span><span className="font-medium">{totalVolume.toFixed(1)}L</span></div>
        <div className="flex justify-between"><span className="text-sm text-gray-600">Total LAL:</span><span className="font-medium">{totalLAL.toFixed(2)}L</span></div>
        <div className="flex justify-between"><span className="text-sm text-gray-600">Completed Cuts:</span><span className="font-medium">{cuts.filter(c => c.status === 'completed').length}/4</span></div>
        <div className="flex justify-between"><span className="text-sm text-gray-600">Active Cut:</span><span className="font-medium">{cuts.find(c => c.status === 'active')?.name || 'None'}</span></div>
      </div>
    </div>
  )
}

function TankUsagePanel({ cuts }: { cuts: CutData[] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tank Usage</h3>
      <div className="space-y-2">
        {TANK_OPTIONS.map(tank => {
          const cutsUsingTank = cuts.filter(cut => cut.tank === tank)
          if (cutsUsingTank.length === 0) return null
          return (
            <div key={tank} className="flex justify-between items-center text-sm">
              <span className="font-medium">{tank}</span>
              <div className="flex gap-1">
                {cutsUsingTank.map(cut => <span key={cut.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{cut.name}</span>)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PowerControlPanel({ powerData, updatePowerField, turnElementsOn, turnElementsOff }: {
  powerData: PowerData; updatePowerField: (field: keyof PowerData, value: any) => void; turnElementsOn: () => void; turnElementsOff: () => void
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Power Control</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="power_kw" className="block text-sm font-medium text-gray-700 mb-1">Power (kW)</label>
          <input id="power_kw" type="number" step="0.1" value={powerData.powerKW || ''}
            onChange={(e) => updatePowerField('powerKW', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="32.0" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={turnElementsOn} disabled={!!powerData.elementsOnTime}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm">Turn On</button>
          <button onClick={turnElementsOff} disabled={!powerData.elementsOnTime}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm">Turn Off</button>
        </div>
        {powerData.elementsOnTime && (
          <div className="text-sm">
            <div className="flex justify-between"><span>On since:</span><span className="font-medium">{new Date(powerData.elementsOnTime).toLocaleTimeString()}</span></div>
            <div className="flex justify-between"><span>Total hours:</span><span className="font-medium">{powerData.totalHours.toFixed(2)}h</span></div>
          </div>
        )}
        <div>
          <label htmlFor="power_notes" className="block text-sm font-medium text-gray-700 mb-1">Power Notes</label>
          <textarea id="power_notes" value={powerData.notes} onChange={(e) => updatePowerField('notes', e.target.value)}
            placeholder="Power adjustments, issues, etc..."
            className="w-full h-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
        </div>
      </div>
    </div>
  )
}

function ControlsPanel({ isTracking, setIsTracking, onSave, onClose }: {
  isTracking: boolean; setIsTracking: (v: boolean) => void; onSave: () => void; onClose: () => void
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Controls</h3>
      <div className="space-y-3">
        <button onClick={() => setIsTracking(!isTracking)}
          className={`w-full px-4 py-2 rounded-lg font-medium ${isTracking ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
          {isTracking ? 'Pause Tracking' : 'Start Tracking'}
        </button>
        <button onClick={onSave} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save All Data</button>
        <button onClick={onClose} className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
      </div>
    </div>
  )
}
