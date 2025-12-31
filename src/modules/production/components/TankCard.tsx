'use client'

import Link from 'next/link'
import { Tank, TANK_STATUS_LABELS, TANK_STATUS_COLORS } from '../types/tank.types'

interface TankCardProps {
  tank: Tank
  onEdit: (tank: Tank) => void
  onTransform?: (tank: Tank) => void
  onInfuse?: (tank: Tank) => void
  onAdjust?: (tank: Tank) => void
  onCombine?: (tank: Tank) => void
  onViewHistory?: (tank: Tank) => void
}

export function TankCard({ tank, onEdit, onTransform, onInfuse, onAdjust, onCombine, onViewHistory }: TankCardProps) {
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

  const statusColorKey = TANK_STATUS_COLORS[tank.status]

  const isEmpty = tank.status === 'empty' || tank.status === 'bottled_empty' || tank.status === 'cleaning'

  const capacity = tank.capacity_l || tank.capacity || 0
  const currentVolume = tank.current_volume_l ?? tank.volume ?? 0
  const currentAbv = tank.current_abv ?? tank.abv ?? null
  const tankName = tank.tank_name || tank.name || tank.tank_id

  const fillPercentage = capacity && currentVolume
    ? Math.min((currentVolume / capacity) * 100, 100)
    : 0

  const qp = new URLSearchParams({
    tankId: tank.tank_id || '',
    product: (tank.product || '') + '',
    volume: (currentVolume || 0).toString(),
    abv: (currentAbv || 0).toString(),
    location: (tank.location || '') + ''
  }).toString()

  const showBottling = (currentVolume || 0) > 0
  const showBarrel = (currentVolume || 0) > 0 && !!tank.product

  return (
    <div className={`rounded-xl border-2 ${colorClasses[statusColorKey as keyof typeof colorClasses]} p-6 shadow-sm hover:shadow-md transition`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{tankName}</h3>
          <p className="text-sm text-gray-600">{tank.tank_id}</p>
          {tank.has_lid === false && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
              No Lid
            </span>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClasses[statusColorKey as keyof typeof colorClasses]}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3">
        {!isEmpty && tank.product && (
          <div>
            <div className="text-sm font-medium text-gray-700">Product</div>
            <div className="text-base font-semibold text-gray-900">{tank.product}</div>
          </div>
        )}

        {!isEmpty && tank.batch && (
          <div>
            <div className="text-sm font-medium text-gray-700">Batch</div>
            <div className="text-base font-semibold text-gray-900">{tank.batch}</div>
          </div>
        )}

        {!isEmpty && currentAbv !== null && currentAbv !== undefined && (
          <div>
            <div className="text-sm font-medium text-gray-700">ABV</div>
            <div className="text-base font-semibold text-gray-900">{currentAbv.toFixed(1)}%</div>
          </div>
        )}

        {!isEmpty && currentVolume !== null && currentVolume !== undefined && currentVolume > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700">Volume</div>
            <div className="text-base font-semibold text-gray-900">
              {currentVolume.toFixed(0)} L
              <span className="text-sm text-gray-600 ml-2">
                / {capacity.toFixed(0)} L
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  statusColorKey === 'green' ? 'bg-green-500' :
                  statusColorKey === 'blue' ? 'bg-blue-500' :
                  statusColorKey === 'yellow' ? 'bg-yellow-500' :
                  statusColorKey === 'orange' ? 'bg-orange-500' :
                  statusColorKey === 'purple' ? 'bg-purple-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        )}

        {tank.status === 'infusing' && tank.infusion_type && (
          <div>
            <div className="text-sm font-medium text-gray-700">Infusion Type</div>
            <div className="text-base font-semibold text-gray-900 capitalize">{tank.infusion_type}</div>
          </div>
        )}

        {tank.extra_materials && Object.keys(tank.extra_materials).length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700">Materials</div>
            <div className="text-sm text-gray-900">
              {Object.entries(tank.extra_materials).map(([key, value]) => (
                <div key={key}>
                  {key.replace(/_/g, ' ')}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              ))}
            </div>
          </div>
        )}

        {tank.started_on && (
          <div>
            <div className="text-sm font-medium text-gray-700">Started</div>
            <div className="text-sm text-gray-900">
              {new Date(tank.started_on).toLocaleDateString()}
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

      {(showBarrel || showBottling) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {showBarrel && (
            <Link
              href={`/dashboard/barrels/new?${qp}`}
              className="w-full inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Transfer to Barrels
            </Link>
          )}
          {showBottling && (
            <Link
              href={`/dashboard/production/bottling/new?${qp}`}
              className="w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Start Bottling
            </Link>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => onTransform && onTransform(tank)}
          className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Transform Product
        </button>
        <button
          onClick={() => onInfuse && onInfuse(tank)}
          className="w-full inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Add Ingredients / Infusion
        </button>
        <button
          onClick={() => onAdjust && onAdjust(tank)}
          className="w-full inline-flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Adjust Volume / ABV
        </button>
        <button
          onClick={() => onCombine && onCombine(tank)}
          className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Combine Tanks
        </button>
        <button
          onClick={() => onViewHistory && onViewHistory(tank)}
          className="w-full inline-flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          View History
        </button>
      </div>

      <button
        onClick={() => onEdit(tank)}
        className="mt-4 w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        Edit
      </button>
    </div>
  )
}
