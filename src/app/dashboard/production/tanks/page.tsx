'use client'

import { useTanksData } from '@/modules/production/hooks/useTanksData'
import { TankCard } from '@/modules/production/components/TankCard'
import { TankEditModal } from '@/modules/production/components/TankEditModal'
import {
  TankTransformModal,
  TankAdjustModal,
  TankInfusionModal,
  TankCombineModal,
  TankHistoryModal,
} from '@/modules/production/components/tanks'

export default function TanksPage() {
  const d = useTanksData()

  if (d.loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="text-gray-600 text-lg">Loading tanks...</div>
          <div className="mt-4 text-sm text-gray-500">Connecting to Supabase...</div>
        </div>
      </div>
    )
  }

  if (d.error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading Tanks</h2>
          <p className="text-red-600">{d.error}</p>
          <button onClick={() => d.loadTanks()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-graphite">Production Tanks</h1>
          <p className="text-[#777777] mt-2">Monitor and manage all production tanks</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={d.openNewTank} className="px-6 py-3 bg-copper hover:bg-copper/90 text-white rounded-lg font-medium transition">+ Add New Tank</button>
          <button onClick={d.handleClearAll} className="px-6 py-3 bg-graphite hover:opacity-90 text-white rounded-lg font-medium transition">Clear All Tanks</button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">Total Tanks</div>
          <div className="text-3xl font-bold text-graphite">{d.totalTanks}</div>
        </div>
        <div className="bg-beige rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">In Use</div>
          <div className="text-3xl font-bold text-graphite">{d.tanksInUse}</div>
        </div>
        <div className="bg-beige rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">Empty</div>
          <div className="text-3xl font-bold text-graphite">{d.emptyTanks}</div>
        </div>
        <div className="bg-beige rounded-lg border border-copper-30 p-4">
          <div className="text-sm text-graphite mb-1">Utilization</div>
          <div className="text-3xl font-bold text-graphite">{d.utilizationPercent.toFixed(0)}%</div>
          <div className="text-xs text-graphite mt-1">{d.totalVolume.toFixed(0)}L / {d.totalCapacity.toFixed(0)}L</div>
        </div>
      </div>

      {/* Redistillation Alert */}
      {d.redistillationTanks.length > 0 && d.showRedistillationAlert && (
        <div className="bg-copper-10 border-l-4 border-copper p-4 mb-6 rounded-r-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-copper" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-graphite">
                  {d.redistillationTanks.length} tank{d.redistillationTanks.length > 1 ? 's' : ''} pending redistillation
                </h3>
                <div className="mt-2 text-sm text-[#777777]">
                  <ul className="list-disc list-inside space-y-1">
                    {d.redistillationTanks.map(tank => (
                      <li key={tank.id}>
                        {tank.tank_id}: {tank.product} ({(tank.current_volume_l || tank.volume || 0).toFixed(0)}L @ {(tank.current_abv || tank.abv || 0).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <button onClick={() => d.setShowRedistillationAlert(false)} className="flex-shrink-0 ml-4 text-copper hover:opacity-80">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tank Grid */}
      {d.tanks.length === 0 ? (
        <div className="bg-copper-10 border border-copper-30 rounded-lg p-6">
          <p className="text-graphite">No tanks found in database.</p>
          <p className="text-sm text-[#777777] mt-2">Run the import script to load real tank inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {d.tanks.filter(t => t.status !== 'bottled_empty').map(tank => (
            <TankCard
              key={tank.id}
              tank={tank}
              onEdit={d.handleEdit}
              onTransform={d.handleTransform}
              onInfuse={d.handleInfuse}
              onAdjust={d.handleAdjust}
              onCombine={d.handleCombine}
              onViewHistory={d.handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {d.selectedTank && d.isModalOpen && (
        <TankEditModal
          tank={d.selectedTank}
          isOpen={d.isModalOpen}
          onClose={d.closeModal}
          onSave={d.handleSave}
          onDelete={d.handleDelete}
        />
      )}

      {/* Transform Modal */}
      {d.isTransformOpen && d.selectedTank && (
        <TankTransformModal
          tank={d.selectedTank}
          productName={d.transformProductName}
          recipeId={d.transformRecipeId}
          recipes={d.availableRecipes}
          onProductNameChange={d.setTransformProductName}
          onRecipeIdChange={d.setTransformRecipeId}
          onSubmit={d.performTransform}
          onClose={d.closeTransform}
        />
      )}

      {/* Adjust Modal */}
      {d.isAdjustOpen && d.selectedTank && (
        <TankAdjustModal
          tank={d.selectedTank}
          abv={d.adjustAbv}
          volume={d.adjustVolume}
          notes={d.adjustNotes}
          onAbvChange={d.setAdjustAbv}
          onVolumeChange={d.setAdjustVolume}
          onNotesChange={d.setAdjustNotes}
          onSubmit={d.performAdjust}
          onClose={d.closeAdjust}
        />
      )}

      {/* Infusion Modal */}
      {d.isInfusionOpen && d.selectedTank && (
        <TankInfusionModal
          tank={d.selectedTank}
          infusionType={d.infusionType}
          botanicals={d.botanicals}
          botanicalSearch={d.botanicalSearch}
          infusionItems={d.infusionItems}
          onInfusionTypeChange={d.setInfusionType}
          onBotanicalSearchChange={d.setBotanicalSearch}
          onInfusionItemsChange={d.setInfusionItems}
          onSubmit={d.performInfusion}
          onClose={d.closeInfusion}
        />
      )}

      {/* Combine Modal */}
      {d.currentAction === 'combine' && d.combineSource && (
        <TankCombineModal
          source={d.combineSource}
          tanks={d.tanks}
          selectedIds={d.combineSelectedIds}
          targetId={d.combineTargetId}
          onSelectedIdsChange={d.setCombineSelectedIds}
          onTargetIdChange={d.setCombineTargetId}
          onSubmit={d.performCombine}
          onClose={d.closeCombine}
        />
      )}

      {/* History Modal */}
      {d.isHistoryOpen && d.selectedTank && (
        <TankHistoryModal
          tank={d.selectedTank}
          entries={d.historyEntries}
          onClose={d.closeHistory}
        />
      )}
    </div>
  )
}
