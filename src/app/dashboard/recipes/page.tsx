'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const GinRecipesBrowser = dynamic(() => import('@/modules/recipes/components/GinRecipesBrowser').then(mod => mod.GinRecipesBrowser), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-border bg-surface p-6 text-muted-foreground">Loading recipes…</div>,
})

const RumProductRecipesBrowser = dynamic(() => import('@/modules/recipes/components/RumProductRecipesBrowser').then(mod => mod.RumProductRecipesBrowser), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-border bg-surface p-6 text-muted-foreground">Loading recipes…</div>,
})

const RumRecipeCalculator = dynamic(() => import('@/modules/recipes/components/RumRecipeCalculator').then(mod => mod.RumRecipeCalculator), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-border bg-surface p-6 text-muted-foreground">Loading calculator…</div>,
})

const RecipesList = dynamic(() => import('@/modules/recipes/components/RecipesList').then(mod => mod.RecipesList), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-border bg-surface p-6 text-muted-foreground">Loading recipe cards…</div>,
})

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'gin' | 'rum' | 'calculator'>('cards')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recipes</h1>
          <p className="text-muted-foreground mt-1">Browse and manage production recipes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('cards')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'cards'
                ? 'border-copper text-copper'
                : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground'
            }`}
          >
            Recipe Cards
          </button>
          <button
            onClick={() => setActiveTab('gin')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'gin'
                ? 'border-copper text-copper'
                : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground'
            }`}
          >
            Gin Recipes
          </button>
          <button
            onClick={() => setActiveTab('rum')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'rum'
                ? 'border-copper text-copper'
                : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground'
            }`}
          >
            Rum Product Recipes
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === 'calculator'
                ? 'border-copper text-copper'
                : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground'
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
