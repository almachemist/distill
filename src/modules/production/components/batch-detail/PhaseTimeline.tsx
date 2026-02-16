'use client'

import { PHASES, BatchStatus } from '../../utils/batch-detail-utils'

interface PhaseTimelineProps {
  currentPhase: string
  activePhase: string | null
  batchStatus: BatchStatus
  isPhaseCompleted: (phaseId: string) => boolean
  onSelectPhase: (phaseId: string) => void
}

export function PhaseTimeline({ currentPhase, activePhase, batchStatus, isPhaseCompleted, onSelectPhase }: PhaseTimelineProps) {
  return (
    <div className="w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto p-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Phases Timeline
      </h3>
      <div className="space-y-2">
        {PHASES.map((phase, idx) => {
          const completed = isPhaseCompleted(phase.id)
          const isCurrent = phase.id === currentPhase && batchStatus !== 'completed'
          const isActive = activePhase === phase.id || (!activePhase && phase.id === currentPhase)

          return (
            <button
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className={`w-full text-left p-4 rounded-lg transition-all ${
                isActive 
                  ? 'bg-violet-500/20 border-2 border-violet-500/50' 
                  : 'bg-gray-700/50 border-2 border-transparent hover:bg-gray-700/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${
                  completed ? 'opacity-100' : 'opacity-50'
                }`}>
                  {phase.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    completed ? 'text-white' : 'text-gray-400'
                  }`}>
                    {phase.name}
                  </div>
                  {completed && (
                    <div className="text-xs text-violet-400 mt-1">✓ Completed</div>
                  )}
                  {isCurrent && !completed && (
                    <div className="text-xs text-cyan-400 mt-1 animate-pulse">→ Current</div>
                  )}
                </div>
                {completed && (
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                )}
              </div>
              {idx < PHASES.length - 1 && (
                <div className={`ml-5 mt-2 h-8 w-0.5 ${
                  completed ? 'bg-violet-500/50' : 'bg-gray-700'
                }`}></div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
