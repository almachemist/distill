'use client'

import Link from 'next/link'
import { useState } from 'react'
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
    location: (tank.location || '') + '',
    batchId: (tank.batch_id || tank.batch || tank.tank_id || '') + ''
  }).toString()

  const showBottling = (currentVolume || 0) > 0
  const showBarrel = (currentVolume || 0) > 0 && !!tank.product

  const [actionsOpen, setActionsOpen] = useState(false)

  return (
    <div
      onClick={() => setActionsOpen(v => !v)}
      className="relative rounded-xl border border-copper-30 bg-white p-6 shadow-soft hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-graphite">{tankName}</h3>
          <p className="text-sm text-graphite/70">{tank.tank_id}</p>
          {tank.has_lid === false && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-copper-10 text-graphite text-xs rounded">
              No Lid
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-copper-5 text-graphite border border-copper">
            {statusLabel}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setActionsOpen(v => !v) }}
            className="px-3 py-1 rounded-lg bg-white text-graphite text-xs font-semibold hover:bg-copper-10 transition border border-copper-30"
          >
            Actions
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {!isEmpty && tank.product && (
          <div>
            <div className="text-sm font-medium text-graphite/70">Product</div>
            <div className="text-base font-semibold text-graphite">{tank.product}</div>
          </div>
        )}

        {!isEmpty && (tank.batch_id || tank.batch) && (
          <div>
            <div className="text-sm font-medium text-graphite/70">Batch ID</div>
            <div className="text-base font-semibold text-graphite">{tank.batch_id || tank.batch}</div>
          </div>
        )}

        {!isEmpty && currentAbv !== null && currentAbv !== undefined && (
          <div>
            <div className="text-sm font-medium text-graphite/70">ABV</div>
            <div className="text-base font-semibold text-graphite">{currentAbv.toFixed(1)}%</div>
          </div>
        )}

        {!isEmpty && currentVolume !== null && currentVolume !== undefined && currentVolume > 0 && (
          <div>
            <div className="text-sm font-medium text-graphite/70">Volume</div>
            <div className="text-base font-semibold text-graphite">
              {currentVolume.toFixed(0)} L
              <span className="text-sm text-graphite/70 ml-2">
                / {capacity.toFixed(0)} L
              </span>
            </div>
            <div className="mt-2 w-full bg-copper-10 rounded-full h-2">
              <div className="h-2 rounded-full transition-all bg-copper" style={{ width: `${fillPercentage}%` }} />
            </div>
          </div>
        )}

        {tank.status === 'infusing' && tank.infusion_type && (
          <div>
            <div className="text-sm font-medium text-graphite/70">Infusion Type</div>
            <div className="text-base font-semibold text-graphite capitalize">{tank.infusion_type}</div>
          </div>
        )}

        {tank.extra_materials && Object.keys(tank.extra_materials).length > 0 && (
          <div>
            <div className="text-sm font-medium text-graphite/70">Materials</div>
            <div className="text-sm text-graphite">
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
            <div className="text-sm font-medium text-graphite/70">Started</div>
            <div className="text-sm text-graphite">
              {new Date(tank.started_on).toLocaleDateString()}
            </div>
          </div>
        )}

        {isEmpty && (
          <div className="text-center py-4 text-graphite/60">
            Tank is {statusLabel.toLowerCase()}
          </div>
        )}

        {tank.notes && (
          <div>
            <div className="text-sm font-medium text-graphite/70">Notes</div>
            <div className="text-sm text-graphite/70 italic">{tank.notes}</div>
          </div>
        )}

        {tank.last_updated_by && (
          <div className="text-xs text-graphite/60 pt-2 border-t border-copper-30">
            Last updated by {tank.last_updated_by}
          </div>
        )}
      </div>

      {actionsOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 h-full w-64 bg-white border-l border-copper-30 shadow-lg rounded-r-xl p-4 flex flex-col gap-2"
        >
          {showBarrel && (
            <Link
              href={`/dashboard/barrels/new?${qp}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
            >
              Transfer to Barrels
            </Link>
          )}
          {showBottling && (
            <Link
              href={`/dashboard/production/bottling/new?${qp}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
            >
              Start Bottling
            </Link>
          )}
          {tank.status === 'pending_redistillation' && (
            <Link
              href={`/dashboard/production/start-batch?redistillTankId=${encodeURIComponent(tank.tank_id)}&volume=${encodeURIComponent((currentVolume || 0).toString())}&abv=${encodeURIComponent((currentAbv || 0).toString())}&productType=vodka`}
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
            >
              Start Redistillation
            </Link>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onTransform && onTransform(tank) }}
            className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
          >
            Transform Product
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onInfuse && onInfuse(tank) }}
            className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
          >
            Add Ingredients / Infusion
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAdjust && onAdjust(tank) }}
            className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
          >
            Adjust Volume / ABV
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCombine && onCombine(tank) }}
            className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
          >
            Combine Tanks
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onViewHistory && onViewHistory(tank) }}
            className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
          >
            View History
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(tank) }}
            className="w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setActionsOpen(false) }}
            className="mt-auto w-full inline-flex items-center justify-center bg-white text-graphite font-medium py-2 px-4 rounded-lg transition hover:bg-copper-10 border border-copper-30"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
