'use client'

import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { getTotalCostValue, getEfficiencyColor, getStatusIcon } from '../useBatchOverview'

interface CalendarViewProps {
  sessionsByMonth: Record<number, { name: string; sessions: DistillationSession[] }>
  selectedYear: number
  onOpenSession: (s: DistillationSession) => void
  onOpenTracker: (s: DistillationSession) => void
  onOpenCuts: (s: DistillationSession) => void
  onSimpleEdit: (s: DistillationSession) => void
}

export function CalendarView({ sessionsByMonth, selectedYear, onOpenSession, onOpenTracker, onOpenCuts, onSimpleEdit }: CalendarViewProps) {
  return (
    <div className="space-y-8">
      {Object.entries(sessionsByMonth)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([month, data]) => (
          <div key={month} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{data.name} {selectedYear}</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{data.sessions.length} batches</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.sessions.map((session) => (
                <div key={session.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => onOpenSession(session)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getStatusIcon(session)}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{session.sku}</h3>
                        <p className="text-sm text-gray-600">{session.spiritRun}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{new Date(session.date).getDate()}/{month}</div>
                      <div className="text-xs text-gray-400">{session.boilerOn}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Still:</span>
                      <span className="font-medium">{session.still}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">LAL:</span>
                      <span className="font-medium">{(session.lalOut || 0).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Efficiency:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(session.lalEfficiency || 0)}`}>
                        {(session.lalEfficiency || 0).toFixed(1)}%
                      </span>
                    </div>
                    {session.costs && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cost:</span>
                        <span className="font-medium">${getTotalCostValue(session.costs).toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onOpenTracker(session) }}
                        className="bg-indigo-600 text-white px-2 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">Live Track</button>
                      <button onClick={(e) => { e.stopPropagation(); onOpenCuts(session) }}
                        className="bg-purple-600 text-white px-2 py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">Cuts Only</button>
                      <button onClick={(e) => { e.stopPropagation(); onSimpleEdit(session) }}
                        className="bg-blue-600 text-white px-2 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors" title="Edit batch data">Edit</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
