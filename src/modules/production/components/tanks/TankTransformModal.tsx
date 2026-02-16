'use client'

import { Tank } from '@/modules/production/types/tank.types'

interface TankTransformModalProps {
  tank: Tank
  productName: string
  recipeId: string
  recipes: Array<{ id: string; name: string }>
  onProductNameChange: (v: string) => void
  onRecipeIdChange: (v: string) => void
  onSubmit: () => void
  onClose: () => void
}

export function TankTransformModal({ tank, productName, recipeId, recipes, onProductNameChange, onRecipeIdChange, onSubmit, onClose }: TankTransformModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-copper text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Transform Product</h2>
          <p className="text-sm mt-1">{tank.tank_id} • {tank.tank_name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="transform_product_name" className="block text-sm font-medium text-gray-700 mb-2">New product name</label>
            <input id="transform_product_name" type="text" value={productName} onChange={(e) => onProductNameChange(e.target.value)} className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper" placeholder="Spiced Rum" />
          </div>
          <div>
            <label htmlFor="transform_recipe_id" className="block text-sm font-medium text-gray-700 mb-2">Link recipe (optional)</label>
            <select id="transform_recipe_id" value={recipeId} onChange={(e) => onRecipeIdChange(e.target.value)} className="w-full px-4 py-2 border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper">
              <option value="">Select recipe...</option>
              {recipes.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
            </select>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition">Cancel</button>
          <button onClick={onSubmit} className="px-6 py-2 bg-copper hover:bg-copper/90 text-white rounded-lg transition">Transform</button>
        </div>
      </div>
    </div>
  )
}
