'use client'

import { DistillationSession } from '../types/distillation-session.types'
import { useInteractiveDistillation, type InteractiveDistillationData, type ChargeComponent, type BotanicalEntry, type CutEntry } from './useInteractiveDistillation'

interface InteractiveDistillationPanelProps {
  session: DistillationSession
  onSave: (data: InteractiveDistillationData) => void
  onDuplicate: (data: InteractiveDistillationData) => void
  onExport: (data: InteractiveDistillationData) => void
}

export default function InteractiveDistillationPanel({ session, onSave, onDuplicate, onExport }: InteractiveDistillationPanelProps) {
  const d = useInteractiveDistillation(session)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Distillation Details – {d.data.sku}</h1>
          <p className="text-gray-600 mt-2">Interactive panel for real-time distillation data entry</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => d.setIsEditing(!d.isEditing)}
            className={`px-4 py-2 rounded-lg font-medium ${d.isEditing ? 'bg-graphite text-white hover:bg-graphite/90' : 'bg-copper text-white hover:bg-copper/90'}`}>
            {d.isEditing ? 'View Mode' : 'Edit Mode'}
          </button>
          {d.hasChanges && (
            <button onClick={() => onSave(d.data)} className="px-4 py-2 bg-copper text-white rounded-lg font-medium hover:bg-copper/90">Save Changes</button>
          )}
        </div>
      </div>

      {/* Charge Data */}
      <ChargeTable data={d} />

      {/* Botanicals */}
      <BotanicalsTable data={d} />

      {/* Cuts and Yields */}
      <CutsTable data={d} />

      {/* Daily Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Notes</h2>
        <textarea value={d.data.notes} onChange={(e) => d.updateNotes(e.target.value)} disabled={!d.isEditing}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Add observations about the distillation, adjustments, aroma, problems, yield, etc..." />
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex gap-4">
          <button onClick={() => onSave(d.data)} className="px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper/90 transition-colors">💾 Save to Database</button>
          <button onClick={() => onDuplicate(d.data)} className="px-6 py-3 bg-beige text-graphite rounded-lg font-medium border border-copper-30 hover:bg-beige transition-colors">📋 Duplicate Batch</button>
          <button onClick={() => onExport(d.data)} className="px-6 py-3 bg-beige text-graphite rounded-lg font-medium border border-copper-30 hover:bg-beige transition-colors">📄 Export PDF</button>
        </div>
      </div>
    </div>
  )
}

type HookReturn = ReturnType<typeof useInteractiveDistillation>

function ChargeTable({ data: d }: { data: HookReturn }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Charge Data</h2>
        {d.isEditing && (
          <button onClick={d.addChargeComponent} className="px-3 py-1 bg-copper text-white rounded-lg text-sm hover:bg-copper/90">+ Add Component</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (L)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ABV (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAL</th>
              {d.isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {d.data.charge.map((component, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <input type="text" value={component.source} onChange={(e) => d.updateCharge(index, 'source', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" />
                  ) : <span className="text-sm font-medium text-gray-900">{component.source}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <input type="number" step="0.1" value={component.volume_L} onChange={(e) => d.updateCharge(index, 'volume_L', Number(e.target.value))}
                      className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" />
                  ) : <span className="text-sm text-gray-900">{component.volume_L}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <input type="number" step="0.1" value={component.abv} onChange={(e) => d.updateCharge(index, 'abv', Number(e.target.value))}
                      className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" />
                  ) : <span className="text-sm text-gray-900">{component.abv}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-900">{component.lal.toFixed(1)}</span></td>
                {d.isEditing && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => d.removeChargeComponent(index)} className="text-copper hover:text-copper/80 text-sm">Remove</button>
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{d.totalVolume}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{d.totalABV.toFixed(1)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{d.totalLAL.toFixed(1)}</td>
              {d.isEditing && <td className="px-6 py-4 whitespace-nowrap"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BotanicalsTable({ data: d }: { data: HookReturn }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Botanicals</h2>
        {d.isEditing && (
          <button onClick={d.addBotanical} className="px-3 py-1 bg-copper text-white rounded-lg text-sm hover:bg-copper/90">+ Add Botanical</button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (g)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {d.isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {d.data.botanicals.map((botanical, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <input type="text" value={botanical.name} onChange={(e) => d.updateBotanical(index, 'name', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" />
                  ) : <span className="text-sm font-medium text-gray-900">{botanical.name}</span>}
                </td>
                <td className="px-6 py-4">
                  {d.isEditing ? (
                    <input type="text" value={botanical.notes} onChange={(e) => d.updateBotanical(index, 'notes', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" placeholder="Notes..." />
                  ) : <span className="text-sm text-gray-900">{botanical.notes || '–'}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <input type="number" value={botanical.weight_g} onChange={(e) => d.updateBotanical(index, 'weight_g', Number(e.target.value))}
                      className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" />
                  ) : <span className="text-sm text-gray-900">{botanical.weight_g}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-900">{botanical.ratio.toFixed(1)}</span></td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <select value={botanical.status} onChange={(e) => d.updateBotanical(index, 'status', e.target.value as any)}
                      className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper">
                      <option value="ok">✅ OK</option>
                      <option value="pending">⚠️ Pending</option>
                      <option value="issue">❌ Issue</option>
                    </select>
                  ) : <span className={`text-sm ${d.getStatusColor(botanical.status)}`}>{d.getStatusIcon(botanical.status)}</span>}
                </td>
                {d.isEditing && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => d.removeBotanical(index)} className="text-copper hover:text-copper/80 text-sm">Remove</button>
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">–</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">{d.totalBotanicals}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">100.0</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-900">–</td>
              {d.isEditing && <td className="px-6 py-4 whitespace-nowrap"></td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CutsTable({ data: d }: { data: HookReturn }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cuts and Yields</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fraction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (L)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ABV (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(d.data.cuts).map(([cutType, cut]) => (
              <tr key={cutType}>
                <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900 capitalize">{cutType}</span></td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <input type="number" step="0.1" value={cut.volume_L || ''}
                      onChange={(e) => d.updateCut(cutType as any, 'volume_L', e.target.value ? Number(e.target.value) : null)}
                      className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" placeholder="0.0" />
                  ) : <span className="text-sm text-gray-900">{cut.volume_L || '–'}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {d.isEditing ? (
                    <input type="number" step="0.1" value={cut.abv || ''}
                      onChange={(e) => d.updateCut(cutType as any, 'abv', e.target.value ? Number(e.target.value) : null)}
                      className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" placeholder="0.0" />
                  ) : <span className="text-sm text-gray-900">{cut.abv || '–'}</span>}
                </td>
                <td className="px-6 py-4">
                  {d.isEditing ? (
                    <input type="text" value={cut.notes}
                      onChange={(e) => d.updateCut(cutType as any, 'notes', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-copper focus:border-copper" placeholder="Observations..." />
                  ) : <span className="text-sm text-gray-900">{cut.notes || '–'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
