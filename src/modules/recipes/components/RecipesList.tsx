'use client'

import { useRecipesData } from '../hooks/useRecipesData'
import { RecipeDetail } from './RecipeDetail'
import { CreateRecipeModal } from './CreateRecipeModal'
import { DeveloperToolsPanel } from './DeveloperToolsPanel'

export function RecipesList() {
  const data = useRecipesData()

  if (data.loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-red-800">Failed to load recipes</h3>
            <p className="text-red-700 text-sm mt-1">{data.error}</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded">
                <strong>Debug:</strong> Check browser console for detailed error information. This might be due to missing data in the database.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={data.loadRecipes} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
              Retry
            </button>
            <button onClick={data.handleImportJson} disabled={data.importing || !data.jsonInput.trim()} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
              {data.importing ? 'Importing...' : 'Import JSON'}
            </button>
            <button onClick={data.handleImportProvidedJson} disabled={data.importing} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              Import Provided JSON
            </button>
            {data.importMessage && <span className="text-sm text-green-800">{data.importMessage}</span>}
            {data.importError && <span className="text-sm text-red-700">{data.importError}</span>}
            <button onClick={data.clearError} className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
              Continue Without Data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Missing formulations banner */}
      {data.missingFormulationNames.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-amber-900">Missing experimental recipe cards</div>
              <div className="text-sm text-amber-800">
                Not found in Supabase:
                <span className="ml-1 font-medium">{data.missingFormulationNames.join(', ')}</span>
              </div>
              {(data.importMessage || data.importError) && (
                <div className="text-sm">
                  {data.importMessage && <p className="text-emerald-700">{data.importMessage}</p>}
                  {data.importError && <p className="text-red-700">{data.importError}</p>}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={data.handleImportMissing}
                disabled={data.importing}
                className="rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {data.importing ? 'Adding…' : 'Add missing cards'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search recipes..."
              value={data.searchTerm}
              onChange={(e) => data.setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Sort:</span>
            <select
              value={data.sortBy}
              onChange={(e) => data.setSortBy(e.target.value as any)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="name">Name</option>
              <option value="updated">Recently updated</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={data.ginOnly}
              onChange={(e) => data.setGinOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Show only gin</span>
          </label>
          <button
            type="button"
            onClick={data.openCreateModal}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            New recipe card
          </button>
          <button
            type="button"
            onClick={data.toggleDeveloperTools}
            className="rounded-lg border border-dashed border-blue-400 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            {data.showDeveloperTools ? 'Hide developer tools' : 'Show developer tools'}
          </button>
        </div>
      </div>

      <CreateRecipeModal
        show={data.showCreateModal}
        creating={data.creatingRecipe}
        error={data.createError}
        name={data.newRecipeName}
        description={data.newRecipeDescription}
        notes={data.newRecipeNotes}
        baseL={data.newRecipeBaseL}
        targetAbvPct={data.newRecipeTargetAbvPct}
        onNameChange={data.setNewRecipeName}
        onDescriptionChange={data.setNewRecipeDescription}
        onNotesChange={data.setNewRecipeNotes}
        onBaseLChange={data.setNewRecipeBaseL}
        onTargetAbvPctChange={data.setNewRecipeTargetAbvPct}
        onCreate={data.handleCreateRecipe}
        onClose={data.closeCreateModal}
      />

      <DeveloperToolsPanel
        show={data.showDeveloperTools}
        seeding={data.seeding}
        importing={data.importing}
        jsonInput={data.jsonInput}
        importMessage={data.importMessage}
        importError={data.importError}
        onJsonInputChange={data.setJsonInput}
        onImportJson={data.handleImportJson}
        onImportFormulations={data.handleImportFormulations}
        onImportProvidedJson={data.handleImportProvidedJson}
        seedMasterInventory={data.seedMasterInventory}
        seedInventoryData={data.seedInventoryData}
        seedRainforestGin={data.seedRainforestGin}
        seedSignatureGin={data.seedSignatureGin}
        seedNavyGin={data.seedNavyGin}
        seedMMGin={data.seedMMGin}
        seedDrySeasonGin={data.seedDrySeasonGin}
        seedWetSeasonGin={data.seedWetSeasonGin}
      />

      {/* Recipes List + Embedded Details */}
      {data.displayedRecipes.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">
              {data.searchTerm ? 'No recipes match your search' : 'No recipes available'}
            </h3>
            {data.searchTerm && (
              <p className="text-sm">Try adjusting your search terms.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {data.displayedRecipes.map((recipe) => (
                  <li key={recipe.id}>
                    <button
                      onClick={() => data.handleRecipeView(recipe)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${data.selectedRecipeId === recipe.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="font-medium text-gray-900">{recipe.name}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Details (Ingredients only) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="space-y-4 p-4">
                {data.selectedRecipeId && (
                  <>
                    <RecipeDetail recipeId={data.selectedRecipeId} embedded view={'ingredients'} />
                    {data.selectedRecipe && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => data.handleStartBatch(data.selectedRecipe!)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                        >
                          Start batch from recipe
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
