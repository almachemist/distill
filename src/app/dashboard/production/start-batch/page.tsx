"use client"

import { Suspense } from 'react'
import { EthanolBatchSelector } from '@/modules/production/components/EthanolBatchSelector'
import { BotanicalSelector } from '@/modules/production/components/BotanicalSelector'
import { PackagingSelector } from '@/modules/production/components/PackagingSelector'
import { useStartBatch } from './useStartBatch'

function PreparationContent() {
  const d = useStartBatch()

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-graphite/50">
          <span className="text-copper font-semibold">Preparation</span>
          <span>→</span><span>Botanical Steeping</span><span>→</span><span>Heating</span><span>→</span><span>Distillation Cuts</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-graphite">Preparation</h1>
          <p className="text-sm text-graphite/70 mt-1">Define ethanol, water, and still setup</p>
        </div>

        {d.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{d.error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          {/* Product Type */}
          <div>
            <div className="block text-sm font-medium text-graphite mb-2">Product Type</div>
            <div className="grid grid-cols-3 gap-3">
              {(['gin', 'vodka', 'ethanol'] as const).map((type) => (
                <button key={type} type="button"
                  onClick={() => { d.setProductType(type); if (type !== 'gin') d.setSelectedRecipeId('') }}
                  className={`px-4 py-3 rounded-lg font-medium transition-all capitalize ${d.productType === type ? 'bg-copper text-white shadow-md' : 'bg-copper-10 text-graphite hover:bg-copper-20 border border-copper-30'}`}>
                  {type === 'ethanol' ? 'Ethanol (Recovery)' : type}
                </button>
              ))}
            </div>
            <p className="text-xs text-graphite/50 mt-2">
              {d.productType === 'gin' && 'Botanical-infused neutral spirit'}
              {d.productType === 'vodka' && 'Pure neutral spirit, no botanicals'}
              {d.productType === 'ethanol' && 'Re-distillation of tails/feints for recovery'}
            </p>
          </div>

          {/* Recipe (Gin only) */}
          {d.productType === 'gin' && (
            <div>
              <label htmlFor="recipe_select" className="block text-sm font-medium text-graphite mb-2">Recipe</label>
              <select id="recipe_select" value={d.selectedRecipeId} onChange={(e) => d.setSelectedRecipeId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite">
                <option value="">Select a gin recipe</option>
                {d.recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}

          {/* Batch ID */}
          <div>
            <label htmlFor="batch_id" className="block text-sm font-medium text-graphite mb-2">Batch ID</label>
            <input id="batch_id" type="text" value={d.batchId} onChange={(e) => d.setBatchId(e.target.value)}
              placeholder="e.g., SPIRIT-GIN-RF-031"
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="batch_date" className="block text-sm font-medium text-graphite mb-2">Date</label>
              <input id="batch_date" type="date" value={d.date} onChange={(e) => d.setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-graphite mb-2">Start Time</label>
              <input id="start_time" type="time" value={d.startTime} onChange={(e) => d.setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
            </div>
          </div>

          {/* Ethanol */}
          {!d.tankIdParam ? (
            <div className="bg-beige border border-copper-30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-graphite mb-4">Ethanol Selection</h3>
              <EthanolBatchSelector value={d.ethanolSelection || undefined} onChange={d.setEthanolSelection} requiredQuantity={500} />
            </div>
          ) : (
            <div className="bg-beige border border-copper-30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-graphite mb-4">Redistillation Source</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-graphite/70 mb-1">Tank</div>
                  <div className="px-4 py-3 bg-white border border-copper-30 rounded-lg text-graphite text-sm">{d.tankIdParam}</div>
                </div>
                <div>
                  <label htmlFor="tank_volume_l" className="block text-sm font-medium text-graphite mb-2">Volume (L)</label>
                  <input id="tank_volume_l" type="number" value={d.tankVolume} onChange={(e) => d.setTankVolume(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
                </div>
                <div>
                  <label htmlFor="tank_abv_percent" className="block text-sm font-medium text-graphite mb-2">ABV (%)</label>
                  <input id="tank_abv_percent" type="number" value={d.tankAbv} onChange={(e) => d.setTankAbv(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" step="0.1" min="0" max="100" />
                </div>
              </div>
              <p className="text-xs text-graphite/60 mt-2">Using tank contents as ethanol source</p>
            </div>
          )}

          {/* Water */}
          <div>
            <label htmlFor="water_added_l" className="block text-sm font-medium text-graphite mb-2">Water Added (L)</label>
            <input id="water_added_l" type="number" value={d.waterVolume} onChange={(e) => d.setWaterVolume(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
          </div>

          {/* Still */}
          <div>
            <label htmlFor="still_used" className="block text-sm font-medium text-graphite mb-2">Still Used</label>
            <select id="still_used" value={d.stillUsed} onChange={(e) => d.setStillUsed(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite">
              <option value="Carrie">Carrie</option>
              <option value="Keri">Keri</option>
              <option value="Josephine">Josephine</option>
            </select>
          </div>

          {/* Other Components */}
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="block text-sm font-medium text-graphite">Other Components (Optional)</div>
                <button onClick={d.addOtherComponent} type="button" className="text-sm text-copper hover:text-copper/80 font-medium">+ Add Component</button>
              </div>
              <p className="text-xs text-graphite/50">Add any additional liquids to the charge, such as: feints/tails from previous runs, saltwater, gin heads, or recovered ethanol. Do not add botanicals here.</p>
            </div>
            {d.otherComponents.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-copper-30">
                      <th className="text-left py-2 px-2 font-medium text-graphite/70 text-xs uppercase">Component Name</th>
                      <th className="text-right py-2 px-2 font-medium text-graphite/70 text-xs uppercase">Volume (L)</th>
                      <th className="text-right py-2 px-2 font-medium text-graphite/70 text-xs uppercase">ABV (%)</th>
                      <th className="text-right py-2 px-2 font-medium text-graphite/70 text-xs uppercase">LAL</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.otherComponents.map((comp, i) => (
                      <tr key={i} className="border-b border-copper-15">
                        <td className="py-2 px-2">
                          <input type="text" value={comp.name} onChange={(e) => d.updateOtherComponent(i, 'name', e.target.value)}
                            placeholder="e.g., Feints, Saltwater, Gin Heads"
                            className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm" />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" step="0.1" value={comp.volume || ''} onChange={(e) => d.updateOtherComponent(i, 'volume', Number(e.target.value))}
                            placeholder="0.0" className="w-24 px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm text-right" />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" step="0.1" value={comp.abv || ''} onChange={(e) => d.updateOtherComponent(i, 'abv', Number(e.target.value))}
                            placeholder="0.0" className="w-20 px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite text-sm text-right" />
                        </td>
                        <td className="py-2 px-2 text-right text-graphite/70 font-mono text-sm">{(((comp.volume || 0) * (comp.abv || 0)) / 100).toFixed(2)}</td>
                        <td className="py-2 px-2 text-right">
                          <button type="button" onClick={() => d.removeOtherComponent(i)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium border border-red-200 transition-colors">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-graphite mb-2">Notes</label>
            <textarea id="notes" value={d.notes} onChange={(e) => d.setNotes(e.target.value)} rows={3}
              placeholder="Warm-up 70°C previous day; 50°C at 06:00; turn on 35A..."
              className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite resize-none" />
          </div>

          {/* Botanicals (Gin only) */}
          {d.productType === 'gin' && (
            <div className="bg-beige border border-copper-30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-graphite">Botanicals (Optional)</h3>
                <button type="button" onClick={() => d.setShowBotanicals(!d.showBotanicals)} className="text-sm text-copper hover:text-copper/80 font-medium">
                  {d.showBotanicals ? 'Hide' : 'Show'} Botanicals
                </button>
              </div>
              {d.showBotanicals && <BotanicalSelector selections={d.botanicals} onChange={d.setBotanicals} />}
            </div>
          )}

          {/* Packaging */}
          <div className="bg-beige border border-copper-30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-graphite">Packaging (Optional)</h3>
              <button type="button" onClick={() => d.setShowPackaging(!d.showPackaging)} className="text-sm text-copper hover:text-copper/80 font-medium">
                {d.showPackaging ? 'Hide' : 'Show'} Packaging
              </button>
            </div>
            {d.showPackaging && <PackagingSelector selections={d.packaging} onChange={d.setPackaging} />}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-beige to-copper-5 rounded-xl p-5 border border-copper-15">
            <h3 className="text-sm font-semibold text-graphite mb-3">Batch Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-xs text-graphite/70 mb-1">Total Volume</div><div className="text-2xl font-bold text-graphite">{d.totalVolume.toFixed(1)} L</div></div>
              <div><div className="text-xs text-graphite/70 mb-1">Average ABV</div><div className="text-2xl font-bold text-copper">{d.avgABV.toFixed(1)}%</div></div>
              <div><div className="text-xs text-graphite/70 mb-1">Total LAL</div><div className="text-2xl font-bold text-graphite">{d.totalLAL.toFixed(1)}</div></div>
              <div><div className="text-xs text-graphite/70 mb-1">Total Cost</div><div className="text-2xl font-bold text-copper">${d.totalCost.toFixed(2)}</div></div>
            </div>
            {d.totalCost > 0 && (
              <div className="mt-4 pt-4 border-t border-copper-20">
                <div className="text-xs font-semibold text-graphite/70 mb-2">Cost Breakdown</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex justify-between"><span className="text-graphite/70">Ethanol:</span><span className="text-graphite font-medium">${d.ethanolCost.toFixed(2)}</span></div>
                  {d.botanicalCost > 0 && <div className="flex justify-between"><span className="text-graphite/70">Botanicals:</span><span className="text-graphite font-medium">${d.botanicalCost.toFixed(2)}</span></div>}
                  {d.packagingCost > 0 && <div className="flex justify-between"><span className="text-graphite/70">Packaging:</span><span className="text-graphite font-medium">${d.packagingCost.toFixed(2)}</span></div>}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button onClick={d.handleSubmit} disabled={d.loading || !d.canSubmit}
              className="px-6 py-3 bg-copper hover:bg-copper/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {d.loading ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PreparationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}>
      <PreparationContent />
    </Suspense>
  )
}
