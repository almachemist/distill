'use client'

import { DistillationSession } from '@/modules/production/types/distillation-session.types'
import { getTotalCostValue, getEfficiencyColor, getStatusIcon } from '../useBatchOverview'

interface ListViewProps {
  sessions: DistillationSession[]
  onOpenTracker: (s: DistillationSession) => void
  onOpenCuts: (s: DistillationSession) => void
  onSimpleEdit: (s: DistillationSession) => void
}

export function ListView({ sessions, onOpenTracker, onOpenCuts, onSimpleEdit }: ListViewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Still</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAL</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getStatusIcon(session)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{session.sku}</div>
                      <div className="text-sm text-gray-500">{session.spiritRun}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.still}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(session.lalOut || 0).toFixed(1)}L</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(session.lalEfficiency || 0)}`}>
                    {(session.lalEfficiency || 0).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${getTotalCostValue(session.costs).toFixed(0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button onClick={() => onOpenTracker(session)} className="text-indigo-600 hover:text-indigo-900">Live Track</button>
                    <button onClick={() => onOpenCuts(session)} className="text-purple-600 hover:text-purple-900">Cuts Only</button>
                    <button onClick={(e) => { e.stopPropagation(); onSimpleEdit(session) }} className="text-blue-600 hover:text-blue-900" title="Edit batch data">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
