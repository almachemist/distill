'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const GinRecipesBrowser = dynamic(() => import('@/modules/recipes/components/GinRecipesBrowser').then(mod => mod.GinRecipesBrowser), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-gray-200 bg-white p-6">Loading recipes…</div>,
})

const RumProductRecipesBrowser = dynamic(() => import('@/modules/recipes/components/RumProductRecipesBrowser').then(mod => mod.RumProductRecipesBrowser), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-gray-200 bg-white p-6">Loading recipes…</div>,
})

const RumRecipeCalculator = dynamic(() => import('@/modules/recipes/components/RumRecipeCalculator').then(mod => mod.RumRecipeCalculator), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-gray-200 bg-white p-6">Loading calculator…</div>,
})

const RecipesList = dynamic(() => import('@/modules/recipes/components/RecipesList').then(mod => mod.RecipesList), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-gray-200 bg-white p-6">Loading recipe cards…</div>,
})

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'gin' | 'rum' | 'calculator'>('cards')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          <p className="text-gray-600 mt-1">Browse and manage production recipes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('cards')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'cards'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Recipe Cards
          </button>
          <button
            onClick={() => setActiveTab('gin')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'gin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Gin Recipes
          </button>
          <button
            onClick={() => setActiveTab('rum')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'rum'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Rum Product Recipes
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'calculator'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Recipe Calculator
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-2">
        {activeTab === 'cards' && <RecipesList />}
        {activeTab === 'gin' && <GinRecipesBrowser />}
        {activeTab === 'rum' && <RumProductRecipesBrowser />}
        {activeTab === 'calculator' && <RumRecipeCalculator />}
      </div>
    </div>
  )
}
