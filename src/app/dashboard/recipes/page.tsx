'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const GinRecipesBrowser = dynamic(() => import('@/modules/recipes/components/GinRecipesBrowser').then(mod => mod.GinRecipesBrowser), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-gray-200 bg-white p-6">Loading recipes…</div>,
})

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
        </div>
      </div>

      <div className="mt-2">
        <GinRecipesBrowser />
      </div>
    </div>
  )
}
