'use client'

import { DistillationSession } from '../../types/distillation-session.types'

interface HeatingPhasePanelProps {
  session: DistillationSession
}

export function HeatingPhasePanel({ session }: HeatingPhasePanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
        <div className="text-xs text-gray-400 mb-1">Boiler On</div>
        <div className="text-lg font-semibold text-white">{session.boilerOn}</div>
      </div>
      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
        <div className="text-xs text-gray-400 mb-1">Power</div>
        <div className="text-lg font-semibold text-white">{session.powerA} A</div>
      </div>
      {session.stillSetup?.elements && (
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">Elements</div>
          <div className="text-sm text-white">{session.stillSetup.elements}</div>
        </div>
      )}
      {session.stillSetup?.plates && (
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
          <div className="text-xs text-gray-400 mb-1">Plates</div>
          <div className="text-sm text-white">{session.stillSetup.plates}</div>
        </div>
      )}
      {session.stillSetup?.options && (
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 col-span-2">
          <div className="text-xs text-gray-400 mb-1">Options</div>
          <div className="text-sm text-white">{session.stillSetup.options}</div>
        </div>
      )}
    </div>
  )
}
