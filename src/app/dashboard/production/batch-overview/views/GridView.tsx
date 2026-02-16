'use client'

import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { getEfficiencyColor, getStatusIcon, getSessionStatus } from '../useBatchOverview'

interface GridViewProps {
  sessions: DistillationSession[]
  onOpenSession: (s: DistillationSession) => void
  onEdit: (s: DistillationSession) => void
}

export function GridView({ sessions, onOpenSession, onEdit }: GridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sessions.map((session) => {
        const status = getSessionStatus(session)
        return (
          <div key={session.id}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => onOpenSession(session)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getStatusIcon(session)}</span>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{session.sku}</h3>
                  <p className="text-sm text-gray-600">{session.spiritRun}</p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'started' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {status === 'completed' ? 'Completed' : status === 'started' ? 'In Progress' : 'Draft'}
                  </div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onEdit(session) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded" title="Edit session">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-medium">{session.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Still:</span><span className="font-medium">{session.still}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">LAL:</span><span className="font-medium">{(session.lalOut || 0).toFixed(1)}L</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Efficiency:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(session.lalEfficiency || 0)}`}>
                  {(session.lalEfficiency || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
