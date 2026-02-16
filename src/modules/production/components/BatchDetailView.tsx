'use client'

import { useState, useMemo } from 'react'
import { DistillationSession } from '../types/distillation-session.types'
import { CorrectionPatch } from '../types/correction.types'
import { useBatchEditing } from '../hooks/useBatchEditing'
import {
  determineBatchStatus,
  isPhaseCompleted as checkPhaseCompleted,
  getCurrentPhase,
  getPhaseDetails,
} from '../utils/batch-detail-utils'
import {
  BatchDetailHeader,
  BatchDetailSummaryBar,
  PhaseTimeline,
  PreparationPhasePanel,
  SteepingPhasePanel,
  HeatingPhasePanel,
  CollectionPhasePanel,
  FinalOutputPanel,
  DilutionsPanel,
  PendingCorrectionsPanel,
} from './batch-detail'

interface BatchDetailViewProps {
  session: DistillationSession
  onClose: () => void
  onStartLive?: () => void
  onViewCuts?: () => void
  onEdit?: () => void
  currentUser?: string
  onSaveCorrections?: (batchId: string, patches: CorrectionPatch[]) => Promise<void>
}

export default function BatchDetailView({
  session,
  onClose,
  onStartLive,
  onViewCuts,
  onEdit,
  currentUser = 'User',
  onSaveCorrections,
}: BatchDetailViewProps) {
  const [activePhase, setActivePhase] = useState<string | null>(null)

  const {
    isEditing,
    isSaving,
    displaySession,
    pendingPatches,
    applyPatch,
    startEditing,
    handleSaveCorrections,
    handleCancelEditing,
    updateNotes,
  } = useBatchEditing({ session, currentUser, onSaveCorrections })

  const batchStatus = useMemo(() => determineBatchStatus(displaySession), [displaySession])
  const currentPhase = useMemo(() => getCurrentPhase(displaySession), [displaySession])
  const isPhaseCompletedFn = (phaseId: string) => checkPhaseCompleted(displaySession, phaseId)

  const selectedPhase = activePhase || currentPhase
  const phaseDetails = getPhaseDetails(displaySession, selectedPhase)

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-gray-900 text-white w-full max-w-7xl max-h-[95vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <BatchDetailHeader
          displaySession={displaySession}
          batchStatus={batchStatus}
          isEditing={isEditing}
          isSaving={isSaving}
          pendingPatchCount={pendingPatches.length}
          applyPatch={applyPatch}
          startEditing={startEditing}
          handleSaveCorrections={handleSaveCorrections}
          handleCancelEditing={handleCancelEditing}
          onClose={onClose}
        />

        <BatchDetailSummaryBar
          displaySession={displaySession}
          isEditing={isEditing}
          applyPatch={applyPatch}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          <PhaseTimeline
            currentPhase={currentPhase}
            activePhase={activePhase}
            batchStatus={batchStatus}
            isPhaseCompleted={isPhaseCompletedFn}
            onSelectPhase={setActivePhase}
          />

          {/* Details Panel */}
          <div className="flex-1 overflow-y-auto bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
                  {phaseDetails.title}
                </h3>

                {/* Phase-specific content */}
                {selectedPhase === 'preparation' && phaseDetails.data && (
                  <PreparationPhasePanel
                    displaySession={displaySession}
                    isEditing={isEditing}
                    applyPatch={applyPatch}
                  />
                )}

                {selectedPhase === 'steeping' && phaseDetails.data && (
                  <SteepingPhasePanel
                    displaySession={displaySession}
                    isEditing={isEditing}
                    applyPatch={applyPatch}
                  />
                )}

                {selectedPhase === 'heating' && phaseDetails.data && (
                  <HeatingPhasePanel session={session} />
                )}

                {(selectedPhase === 'foreshots' || selectedPhase === 'heads' || selectedPhase === 'hearts' || selectedPhase === 'tails') && phaseDetails.data && (
                  <CollectionPhasePanel
                    displaySession={displaySession}
                    activePhase={selectedPhase}
                    phaseData={phaseDetails.data}
                    isEditing={isEditing}
                    applyPatch={applyPatch}
                  />
                )}

                {!phaseDetails.data && (
                  <div className="text-center py-12 text-gray-400">
                    No data available for this phase
                  </div>
                )}

                <FinalOutputPanel
                  displaySession={displaySession}
                  isEditing={isEditing}
                  applyPatch={applyPatch}
                />

                <DilutionsPanel
                  displaySession={displaySession}
                  isEditing={isEditing}
                  applyPatch={applyPatch}
                />

                {/* General Notes */}
                {(displaySession.notes || isEditing) && (
                  <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">General Notes</h4>
                    {!isEditing ? (
                      <p className="text-gray-300 whitespace-pre-wrap">{displaySession.notes || '—'}</p>
                    ) : (
                      <textarea
                        value={displaySession.notes || ''}
                        onChange={(e) => updateNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        rows={4}
                        placeholder="Add notes..."
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Pending Corrections */}
              {isEditing && <PendingCorrectionsPanel pendingPatches={pendingPatches} />}

              {/* Action Buttons */}
              {!isEditing && (
                <div className="flex gap-4 mt-6">
                  {batchStatus !== 'completed' && onStartLive && (
                    <button
                      onClick={onStartLive}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Start Live Tracking
                    </button>
                  )}
                  {batchStatus === 'completed' && onViewCuts && (
                    <button
                      onClick={onViewCuts}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      View Cuts Analysis
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
