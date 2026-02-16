'use client'

import type { GinVodkaSpiritBatch } from '@/types/production-schemas'
import type { GinVodkaSpiritRecipe } from '@/types/recipe-schemas'

interface StillSetupSectionProps {
  batch: GinVodkaSpiritBatch
  recipeBotanicals: GinVodkaSpiritRecipe['botanicals'] | null
  updateField: (field: string, value: any) => void
  updateNestedField: (section: string, field: string, value: any) => void
}

export function StillSetupSection({ batch, recipeBotanicals, updateField, updateNestedField }: StillSetupSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Still Setup</h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="still_elements" className="block text-sm font-medium text-neutral-700 mb-2">Elements</label>
          <input id="still_elements" type="text" value={batch.stillSetup?.elements ?? ''} onChange={(e) => updateNestedField('stillSetup', 'elements', e.target.value)} placeholder="Top + Bottom On" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div>
          <label htmlFor="still_plates" className="block text-sm font-medium text-neutral-700 mb-2">Plates</label>
          <input id="still_plates" type="text" value={batch.stillSetup?.plates ?? ''} onChange={(e) => updateNestedField('stillSetup', 'plates', e.target.value)} placeholder="4" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div className="col-span-2">
          <label htmlFor="still_steeping" className="block text-sm font-medium text-neutral-700 mb-2">Steeping</label>
          <input id="still_steeping" type="text" value={batch.stillSetup?.steeping ?? ''} onChange={(e) => updateNestedField('stillSetup', 'steeping', e.target.value)} placeholder="Juniper steeped 18 hrs" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
        <div className="col-span-2">
          <label htmlFor="still_options_tags" className="block text-sm font-medium text-neutral-700 mb-2">Options / Tags</label>
          <input id="still_options_tags" type="text" value={batch.stillSetup?.options ?? ''} onChange={(e) => updateNestedField('stillSetup', 'options', e.target.value)} placeholder="Botanical Basket, Dephleg" className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600" />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Botanicals</h3>
        <p className="text-sm text-neutral-600 mb-4">Recipe on the left, actual quantities added on the right.</p>

        <div className="grid grid-cols-2 gap-6">
          {/* Recipe column */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-3 bg-blue-50 px-3 py-2 rounded">
              Recipe: {batch.recipeName ?? 'No recipe selected'}
            </h4>
            {recipeBotanicals && recipeBotanicals.length > 0 ? (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-neutral-100">
                      <th className="border-b border-neutral-300 px-3 py-2 text-left text-xs font-medium text-neutral-600">Botanical</th>
                      <th className="border-b border-neutral-300 px-3 py-2 text-right text-xs font-medium text-neutral-600">Weight (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeBotanicals.map((botanical, index) => (
                      <tr key={index} className="hover:bg-neutral-50">
                        <td className="border-b border-neutral-200 px-3 py-2 text-neutral-700">{botanical.name}</td>
                        <td className="border-b border-neutral-200 px-3 py-2 text-right text-neutral-900 font-medium">{botanical.weight_g}g</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-50 font-semibold">
                      <td className="px-3 py-2 text-neutral-900">Total</td>
                      <td className="px-3 py-2 text-right text-neutral-900">
                        {recipeBotanicals.reduce((sum, b) => sum + (b.weight_g ?? 0), 0)}g
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-lg p-6 text-center text-sm text-neutral-500">
                No recipe botanicals available
              </div>
            )}
          </div>

          {/* Actual column */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-3 bg-amber-50 px-3 py-2 rounded">
              Actual Quantities Added
            </h4>
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border-b border-neutral-300 px-3 py-2 text-left text-xs font-medium text-neutral-600">Botanical</th>
                    <th className="border-b border-neutral-300 px-3 py-2 text-right text-xs font-medium text-neutral-600">Weight (g)</th>
                    <th className="border-b border-neutral-300 px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {(batch.botanicals ?? []).map((botanical, index) => (
                    <tr key={index}>
                      <td className="border-b border-neutral-200 px-3 py-2">
                        <input type="text" value={botanical.name ?? ''} onChange={(e) => {
                          const newBotanicals = [...(batch.botanicals ?? [])]
                          newBotanicals[index] = { ...botanical, name: e.target.value }
                          updateField('botanicals', newBotanicals)
                        }} placeholder="Botanical name" className="w-full px-2 py-1 border border-neutral-200 rounded text-sm" />
                      </td>
                      <td className="border-b border-neutral-200 px-3 py-2">
                        <input type="number" step="1" value={botanical.weight_g ?? ''} onChange={(e) => {
                          const newBotanicals = [...(batch.botanicals ?? [])]
                          const val = parseFloat(e.target.value)
                          newBotanicals[index] = { ...botanical, weight_g: isNaN(val) ? 0 : val }
                          updateField('botanicals', newBotanicals)
                        }} placeholder="0" className="w-full px-2 py-1 border border-neutral-200 rounded text-sm text-right" />
                      </td>
                      <td className="border-b border-neutral-200 px-2 py-2">
                        <button onClick={() => {
                          const newBotanicals = (batch.botanicals ?? []).filter((_, i) => i !== index)
                          updateField('botanicals', newBotanicals)
                        }} className="text-red-600 hover:text-red-800 text-xs">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-50 font-semibold">
                    <td className="px-3 py-2 text-neutral-900">Total</td>
                    <td className="px-3 py-2 text-right text-neutral-900">
                      {(batch.botanicals ?? []).reduce((sum, b) => sum + (b.weight_g ?? 0), 0).toFixed(0)}g
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <button onClick={() => {
              const newBotanicals = [...(batch.botanicals ?? []), { name: '', weight_g: 0, ratio_percent: 0, notes: '' }]
              updateField('botanicals', newBotanicals)
            }} className="mt-3 w-full px-4 py-2 text-sm text-amber-700 border border-amber-700 rounded-md hover:bg-amber-50">
              Add Botanical
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
