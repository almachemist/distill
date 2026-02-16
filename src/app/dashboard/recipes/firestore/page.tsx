'use client'

import { useFirestoreRecipes } from './useFirestoreRecipes'
import type { MockRecipe, MockInventoryItem } from './firestore-data'

export default function FirestoreRecipesPage() {
  const d = useFirestoreRecipes()

  if (d.loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-graphite">Firestore Gin Recipe System</h1>
          <p className="text-graphite/70 mt-2">Complete Firestore integration with Gabi&apos;s exact data structure</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={d.handleInitializeSystem} disabled={d.isSeeding}
            className="px-4 py-2 bg-copper text-white rounded-md hover:bg-copper/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium">
            {d.isSeeding ? 'Initializing...' : 'Initialize Firestore System'}
          </button>
          <button onClick={d.loadData} className="px-4 py-2 bg-copper text-white rounded-md hover:bg-copper/90 font-medium">Refresh</button>
        </div>
      </div>

      {d.error && (
        <div className="bg-beige border border-copper-30 rounded-md p-4">
          <p className="text-copper">{d.error}</p>
        </div>
      )}

      {/* Low Stock Banner */}
      <LowStockBanner items={d.getLowStockItems()} />

      {/* Tabs */}
      <div className="border-b border-copper-20">
        <nav className="-mb-px flex space-x-8">
          {([
            { key: 'recipes' as const, label: 'Gin Recipes', count: d.recipes.length },
            { key: 'inventory' as const, label: 'Inventory', count: d.inventory.length },
            { key: 'production' as const, label: 'Production', count: 0 }
          ]).map((tab) => (
            <button key={tab.key} onClick={() => d.setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                d.activeTab === tab.key
                  ? 'border-copper text-copper'
                  : 'border-transparent text-graphite/60 hover:text-graphite hover:border-copper-20'
              }`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {d.activeTab === 'recipes' && (
        <RecipesGrid recipes={d.recipes} onSelect={d.setSelectedRecipe} onStartProduction={d.handleStartProduction} />
      )}

      {d.activeTab === 'inventory' && (
        <InventoryTable inventory={d.inventory} onUpdate={d.handleUpdateInventory} />
      )}

      {d.activeTab === 'production' && (
        <ProductionTab recipes={d.recipes} onStartProduction={d.handleStartProduction} />
      )}

      {d.selectedRecipe && (
        <RecipeDetailModal recipe={d.selectedRecipe} onClose={() => d.setSelectedRecipe(null)} onStartProduction={d.handleStartProduction} />
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────── */

function LowStockBanner({ items }: { items: MockInventoryItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="bg-copper-5 border-l-4 border-copper p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0"><span className="text-copper text-xl">⚠️</span></div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-copper">⚠️ Stock Alert: {items.length} items need attention</h3>
          <div className="mt-2 text-sm text-graphite/80">
            <ul className="list-disc list-inside ml-4">
              {items.slice(0, 5).map(item => (
                <li key={item.id}>{item.name} ({item.quantity} {item.unit}, min: {item.minThreshold || 0})</li>
              ))}
              {items.length > 5 && <li>...and {items.length - 5} more</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecipesGrid({ recipes, onSelect, onStartProduction }: { recipes: MockRecipe[]; onSelect: (r: MockRecipe) => void; onStartProduction: (r: MockRecipe) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-copper-15 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-graphite">{recipe.name}</h3>
                <p className="text-sm text-graphite/70">{recipe.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                recipe.difficulty === 'easy' ? 'bg-copper-green text-onyx' :
                recipe.difficulty === 'medium' ? 'bg-copper-amber text-onyx' :
                'bg-copper-red text-white'
              }`}>{recipe.difficulty}</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-graphite/70">ABV:</span><span className="font-medium">{recipe.abv}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-graphite/70">Batch Volume:</span><span className="font-medium">{recipe.batchVolume}L</span></div>
              <div className="flex justify-between text-sm"><span className="text-graphite/70">Total Cost:</span><span className="font-medium text-copper">${recipe.totalCost.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-graphite/70">Ingredients:</span><span className="font-medium">{recipe.ingredients.length}</span></div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => onSelect(recipe)} className="flex-1 px-3 py-2 bg-copper text-white rounded-md hover:bg-copper/90 text-sm font-medium">View Details</button>
              <button onClick={() => onStartProduction(recipe)} className="flex-1 px-3 py-2 bg-copper text-white rounded-md hover:bg-copper/90 text-sm font-medium">Start Production</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InventoryTable({ inventory, onUpdate }: { inventory: MockInventoryItem[]; onUpdate: (id: string, qty: number) => void }) {
  const getStatusBadge = (item: MockInventoryItem) => {
    if (item.quantity === 0) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-copper-5 text-copper">⚠️ OUT</span>
    if (item.quantity <= (item.minThreshold || 0)) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-copper-5 text-copper">⚠️ LOW</span>
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-beige text-graphite">✓ OK</span>
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-copper-20">
        <h3 className="text-lg font-medium text-graphite">Firestore Inventory</h3>
        <p className="text-sm text-graphite/70">Matches Gabi&apos;s exact data structure with Timestamp fields</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-copper-15">
          <thead className="bg-beige">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">Min Threshold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-copper-15">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-graphite">{item.name}</div>
                  <div className="text-sm text-graphite/60">{item.unit}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-graphite">{item.quantity.toLocaleString()}</div></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite/60">{item.minThreshold || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-graphite/60">${item.pricePerKg?.toFixed(2) || '0.00'}/kg</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => {
                    const newQty = prompt(`Enter new quantity for ${item.name}:`, item.quantity.toString())
                    if (newQty && !isNaN(Number(newQty))) onUpdate(item.id, Number(newQty))
                  }} className="text-copper hover:text-copper/80 text-sm font-medium">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductionTab({ recipes, onStartProduction }: { recipes: MockRecipe[]; onStartProduction: (r: MockRecipe) => void }) {
  const produce = (id: string) => {
    const r = recipes.find(r => r.id === id)
    if (r) onStartProduction(r)
  }
  const cards: { id: string; name: string; cost: string; note?: string }[] = [
    { id: 'rainforest-gin', name: 'Rainforest Gin', cost: '$430.44 per batch' },
    { id: 'signature-dry-gin', name: 'Signature Dry Gin', cost: '$339.76 per batch' },
    { id: 'navy-strength-gin', name: 'Navy Strength Gin', cost: '$345.41 per batch', note: '58.8% ABV' },
    { id: 'merchant-made-gin', name: 'Merchant Made Gin', cost: '$312.17 per batch' },
    { id: 'dry-season-gin', name: 'Dry Season Gin', cost: '$424.75 per batch', note: '(+$150 fresh market)' },
    { id: 'wet-season-gin', name: 'Wet Season Gin', cost: '$409.44 per batch', note: '(+$150 fresh market)' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-beige border border-copper-30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-graphite mb-2">Firestore Production Management</h3>
        <p className="text-graphite/70 text-sm mb-4">
          Production batches are automatically created in Firestore when you start production from a recipe.
          All ingredient consumption is tracked with Timestamp fields and inventory is updated in real-time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {['Select recipe and check ingredient availability', 'Start production batch with automatic Firestore inventory deduction', 'Track costs and generate compliance reports with Timestamp tracking'].map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-copper rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
              <span className="text-graphite">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-copper-15 p-6">
        <h3 className="text-lg font-semibold text-graphite mb-4">Quick Production</h3>
        <p className="text-graphite/70 text-sm mb-4">One-click production with automatic ingredient checking and inventory deduction</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(c => (
            <div key={c.id} className="bg-beige rounded-lg p-4 border border-copper-30">
              <h4 className="font-semibold text-graphite mb-2">{c.name}</h4>
              <p className="text-sm text-copper mb-3">{c.cost}</p>
              {c.note && <p className="text-xs text-graphite/70 mb-2">{c.note}</p>}
              <button onClick={() => produce(c.id)} className="w-full px-4 py-2 bg-copper text-white rounded-md hover:bg-copper/90 text-sm font-medium">
                Produce {c.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecipeDetailModal({ recipe, onClose, onStartProduction }: { recipe: MockRecipe; onClose: () => void; onStartProduction: (r: MockRecipe) => void }) {
  return (
    <div className="fixed inset-0 bg-graphite bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium text-graphite">{recipe.name}</h3>
              <p className="text-sm text-graphite/60">{recipe.description}</p>
            </div>
            <button onClick={onClose} className="bg-beige rounded-md p-1.5 text-graphite/60 hover:text-graphite">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-graphite mb-3">Recipe Details</h4>
              <div className="space-y-2 text-sm">
                {[
                  ['ABV:', `${recipe.abv}%`],
                  ['Batch Volume:', `${recipe.batchVolume}L`],
                  ['Production Time:', `${recipe.productionTime}h`],
                  ['Difficulty:', recipe.difficulty],
                  ['Total Cost:', `$${recipe.totalCost.toFixed(2)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-graphite/70">{label}</span>
                    <span className={`font-medium ${label === 'Total Cost:' ? 'text-copper' : ''} capitalize`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-graphite mb-3">Ingredients ({recipe.ingredients.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-beige rounded">
                    <div className="text-sm font-medium text-graphite">{ingredient.name}</div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-graphite">{ingredient.quantity} {ingredient.unit}</div>
                      {ingredient.pricePerBatch != null && (
                        <div className="text-xs text-graphite/60">${ingredient.pricePerBatch.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-beige text-graphite rounded-md hover:bg-copper-20">Close</button>
            <button onClick={() => { onStartProduction(recipe); onClose() }} className="px-4 py-2 bg-copper text-white rounded-md hover:bg-copper/90">Start Production</button>
          </div>
        </div>
      </div>
    </div>
  )
}
