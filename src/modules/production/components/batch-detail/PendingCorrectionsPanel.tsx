'use client'

import { CorrectionPatch } from '../../types/correction.types'

interface PendingCorrectionsPanelProps {
  pendingPatches: CorrectionPatch[]
}

export function PendingCorrectionsPanel({ pendingPatches }: PendingCorrectionsPanelProps) {
  if (pendingPatches.length === 0) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-6">
      <div className="text-sm font-semibold text-yellow-400 mb-3">Pending Corrections</div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {pendingPatches.map((patch) => (
          <div key={patch.id} className="text-sm bg-gray-800/50 rounded p-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-violet-300">{patch.fieldPath}</span>
              <span className="text-xs text-gray-500">
                {new Date(patch.timestamp).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="mt-1 text-gray-300">
              <span className="line-through text-red-400 mr-2">{String(patch.oldValue ?? '—')}</span>
              <span className="text-green-400">→</span>
              <span className="font-semibold text-white ml-2">{String(patch.newValue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
