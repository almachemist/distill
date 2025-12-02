'use client'

import { useState, useEffect } from 'react'
import { DistillationSession } from '../types/distillation-session.types'

interface ChargeComponent {
  source: string
  volume_L: number
  abv: number
  lal: number
}

interface BotanicalEntry {
  name: string
  notes: string
  weight_g: number
  ratio: number
  status: 'ok' | 'pending' | 'issue'
}

interface CutEntry {
  volume_L: number | null
  abv: number | null
  notes: string
}

interface InteractiveDistillationData {
  spiritRunId: string
  sku: string
  date: string
  stillUsed: string
  boilerOn: string
  charge: ChargeComponent[]
  botanicals: BotanicalEntry[]
  cuts: {
    foreshots: CutEntry
    heads: CutEntry
    hearts: CutEntry
    tails: CutEntry
  }
  notes: string
}

interface InteractiveDistillationPanelProps {
  session: DistillationSession
  onSave: (data: InteractiveDistillationData) => void
  onDuplicate: (data: InteractiveDistillationData) => void
  onExport: (data: InteractiveDistillationData) => void
}

export default function InteractiveDistillationPanel({ 
  session, 
  onSave, 
  onDuplicate, 
  onExport 
}: InteractiveDistillationPanelProps) {
  const [data, setData] = useState<InteractiveDistillationData>({
    spiritRunId: session.id,
    sku: session.sku,
    date: session.date,
    stillUsed: session.still,
    boilerOn: session.boilerOn,
    charge: (session.charge?.components as any) || [
      { source: "Manildra NC96", volume_L: 400, abv: 96.0, lal: 384.0 },
      { source: "Left Vodka", volume_L: 500, abv: 19.0, lal: 95.0 },
      { source: "Water", volume_L: 100, abv: 0.0, lal: 0.0 }
    ],
    botanicals: session.botanicals.map(b => ({
      name: b.name,
      notes: b.notes || '',
      weight_g: b.weightG,
      ratio: b.ratio_percent || 0,
      status: b.status || 'ok'
    })),
    cuts: {
      foreshots: { volume_L: null, abv: null, notes: '' },
      heads: { volume_L: null, abv: null, notes: '' },
      hearts: { volume_L: null, abv: null, notes: '' },
      tails: { volume_L: null, abv: null, notes: '' }
    },
    notes: session.notes || ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Calculate totals
  const totalVolume = data.charge.reduce((sum, c) => sum + c.volume_L, 0)
  const totalLAL = data.charge.reduce((sum, c) => sum + c.lal, 0)
  const totalABV = totalVolume > 0 ? (totalLAL / totalVolume) * 100 : 0

  const totalBotanicals = data.botanicals.reduce((sum, b) => sum + b.weight_g, 0)

  const updateCharge = (index: number, field: keyof ChargeComponent, value: string | number) => {
    const newCharge = [...data.charge]
    newCharge[index] = { ...newCharge[index], [field]: value }
    
    // Recalculate LAL if volume or ABV changed
    if (field === 'volume_L' || field === 'abv') {
      const volume = field === 'volume_L' ? Number(value) : newCharge[index].volume_L
      const abv = field === 'abv' ? Number(value) : newCharge[index].abv
      newCharge[index].lal = volume * (abv / 100)
    }
    
    setData({ ...data, charge: newCharge })
    setHasChanges(true)
  }

  const updateBotanical = (index: number, field: keyof BotanicalEntry, value: string | number) => {
    const newBotanicals = [...data.botanicals]
    newBotanicals[index] = { ...newBotanicals[index], [field]: value }
    
    // Recalculate ratio if weight changed
    if (field === 'weight_g') {
      const totalWeight = newBotanicals.reduce((sum, b) => sum + b.weight_g, 0)
      newBotanicals[index].ratio = totalWeight > 0 ? (Number(value) / totalWeight) * 100 : 0
    }
    
    setData({ ...data, botanicals: newBotanicals })
    setHasChanges(true)
  }

  const updateCut = (cutType: keyof typeof data.cuts, field: keyof CutEntry, value: string | number | null) => {
    const newCuts = { ...data.cuts }
    newCuts[cutType] = { ...newCuts[cutType], [field]: value }
    
    setData({ ...data, cuts: newCuts })
    setHasChanges(true)
  }

  const updateNotes = (value: string) => {
    setData({ ...data, notes: value })
    setHasChanges(true)
  }

  const addChargeComponent = () => {
    const newCharge = [...data.charge, { source: '', volume_L: 0, abv: 0, lal: 0 }]
    setData({ ...data, charge: newCharge })
    setHasChanges(true)
  }

  const addBotanical = () => {
    const newBotanicals = [...data.botanicals, { 
      name: '', 
      notes: '', 
      weight_g: 0, 
      ratio: 0, 
      status: 'ok' 
    }]
    setData({ ...data, botanicals: newBotanicals })
    setHasChanges(true)
  }

  const removeChargeComponent = (index: number) => {
    const newCharge = data.charge.filter((_, i) => i !== index)
    setData({ ...data, charge: newCharge })
    setHasChanges(true)
  }

  const removeBotanical = (index: number) => {
    const newBotanicals = data.botanicals.filter((_, i) => i !== index)
    setData({ ...data, botanicals: newBotanicals })
    setHasChanges(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return '✅'
      case 'pending': return '⚠️'
      case 'issue': return '❌'
      default: return '✅'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'issue': return 'text-red-600'
      default: return 'text-green-600'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Distillation Details – {data.sku}
          </h1>
          <p className="text-gray-600 mt-2">
            Interactive panel for real-time distillation data entry
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-medium ${
              isEditing 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? 'View Mode' : 'Edit Mode'}
          </button>
          {hasChanges && (
            <button
              onClick={() => onSave(data)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Charge Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Charge Data</h2>
          {isEditing && (
            <button
              onClick={addChargeComponent}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              + Add Component
            </button>
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
                {isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.charge.map((component, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={component.source}
                        onChange={(e) => updateCharge(index, 'source', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{component.source}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={component.volume_L}
                        onChange={(e) => updateCharge(index, 'volume_L', Number(e.target.value))}
                        className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{component.volume_L}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={component.abv}
                        onChange={(e) => updateCharge(index, 'abv', Number(e.target.value))}
                        className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{component.abv}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{component.lal.toFixed(1)}</span>
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeChargeComponent(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{totalVolume}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{totalABV.toFixed(1)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{totalLAL.toFixed(1)}</td>
                {isEditing && <td className="px-6 py-4 whitespace-nowrap"></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Botanicals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Botanicals</h2>
          {isEditing && (
            <button
              onClick={addBotanical}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              + Add Botanical
            </button>
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
                {isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.botanicals.map((botanical, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={botanical.name}
                        onChange={(e) => updateBotanical(index, 'name', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{botanical.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={botanical.notes}
                        onChange={(e) => updateBotanical(index, 'notes', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Notes..."
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{botanical.notes || '–'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={botanical.weight_g}
                        onChange={(e) => updateBotanical(index, 'weight_g', Number(e.target.value))}
                        className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{botanical.weight_g}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{botanical.ratio.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={botanical.status}
                        onChange={(e) => updateBotanical(index, 'status', e.target.value as any)}
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ok">✅ OK</option>
                        <option value="pending">⚠️ Pending</option>
                        <option value="issue">❌ Issue</option>
                      </select>
                    ) : (
                      <span className={`text-sm ${getStatusColor(botanical.status)}`}>
                        {getStatusIcon(botanical.status)}
                      </span>
                    )}
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeBotanical(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">–</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{totalBotanicals}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">100.0</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">–</td>
                {isEditing && <td className="px-6 py-4 whitespace-nowrap"></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cuts and Yields */}
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
              {Object.entries(data.cuts).map(([cutType, cut]) => (
                <tr key={cutType}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 capitalize">{cutType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={cut.volume_L || ''}
                        onChange={(e) => updateCut(cutType as any, 'volume_L', e.target.value ? Number(e.target.value) : null)}
                        className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{cut.volume_L || '–'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={cut.abv || ''}
                        onChange={(e) => updateCut(cutType as any, 'abv', e.target.value ? Number(e.target.value) : null)}
                        className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{cut.abv || '–'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={cut.notes}
                        onChange={(e) => updateCut(cutType as any, 'notes', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Observations..."
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{cut.notes || '–'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Notes</h2>
        <textarea
          value={data.notes}
          onChange={(e) => updateNotes(e.target.value)}
          disabled={!isEditing}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Add observations about the distillation, adjustments, aroma, problems, yield, etc..."
        />
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={() => onSave(data)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            💾 Save to Database
          </button>
          <button
            onClick={() => onDuplicate(data)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            📋 Duplicate Batch
          </button>
          <button
            onClick={() => onExport(data)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
