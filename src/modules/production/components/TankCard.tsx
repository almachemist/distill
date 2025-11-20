'use client'

import { Tank, TANK_STATUS_LABELS, TANK_STATUS_COLORS } from '../types/tank.types'

interface TankCardProps {
  tank: Tank
  onEdit: (tank: Tank) => void
}

export function TankCard({ tank, onEdit }: TankCardProps) {
  const statusColor = TANK_STATUS_COLORS[tank.status]
  const statusLabel = TANK_STATUS_LABELS[tank.status]
  
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  }

  const isEmpty = tank.status === 'empty' || tank.status === 'bottled_empty' || tank.status === 'cleaning'
  const fillPercentage = tank.capacity_l && tank.current_volume_l 
    ? Math.min((tank.current_volume_l / tank.capacity_l) * 100, 100)
    : 0

  return (
    <div className={`rounded-xl border-2 ${colorClasses[statusColor]} p-6 shadow-sm hover:shadow-md transition`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{tank.tank_name}</h3>
          <p className="text-sm text-gray-600">{tank.tank_id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClasses[statusColor]}`}>
          {statusLabel}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {!isEmpty && tank.product && (
          <div>
            <div className="text-sm font-medium text-gray-700">Product</div>
            <div className="text-base font-semibold text-gray-900">{tank.product}</div>
          </div>
        )}

        {!isEmpty && tank.current_abv !== null && tank.current_abv !== undefined && (
          <div>
            <div className="text-sm font-medium text-gray-700">ABV</div>
            <div className="text-base font-semibold text-gray-900">{tank.current_abv.toFixed(1)}%</div>
          </div>
        )}

        {!isEmpty && tank.current_volume_l !== null && tank.current_volume_l !== undefined && (
          <div>
            <div className="text-sm font-medium text-gray-700">Volume</div>
            <div className="text-base font-semibold text-gray-900">
              {tank.current_volume_l.toFixed(0)} L
              <span className="text-sm text-gray-600 ml-2">
                / {tank.capacity_l.toFixed(0)} L
              </span>
            </div>
            {/* Fill indicator */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  statusColor === 'green' ? 'bg-green-500' :
                  statusColor === 'blue' ? 'bg-blue-500' :
                  statusColor === 'yellow' ? 'bg-yellow-500' :
                  statusColor === 'orange' ? 'bg-orange-500' :
                  statusColor === 'purple' ? 'bg-purple-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        )}

        {isEmpty && (
          <div className="text-center py-4 text-gray-500">
            Tank is {statusLabel.toLowerCase()}
          </div>
        )}

        {tank.notes && (
          <div>
            <div className="text-sm font-medium text-gray-700">Notes</div>
            <div className="text-sm text-gray-600 italic">{tank.notes}</div>
          </div>
        )}

        {tank.last_updated_by && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Last updated by {tank.last_updated_by}
          </div>
        )}
      </div>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(tank)}
        className="mt-4 w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        Edit
      </button>
    </div>
  )
}

