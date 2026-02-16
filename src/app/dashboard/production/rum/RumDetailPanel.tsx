"use client"

import React from "react"
import { formatDate, formatNumber } from "./rum-detail/rum-detail-utils"
import { useRumDetailPanel } from "./rum-detail/useRumDetailPanel"
import { RumFermentationSection } from "./rum-detail/RumFermentationSection"
import { RumDistillationSection } from "./rum-detail/RumDistillationSection"
import { RumBarrelSection } from "./rum-detail/RumBarrelSection"

type RumBatchRecord = any

export const RumDetailPanel: React.FC<{
  run: RumBatchRecord | null
  onClose: () => void
  onDelete?: () => void
}> = ({ run, onClose, onDelete }) => {
  const d = useRumDetailPanel(run, onClose, onDelete)

  if (!run) return (
    <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
      Select a rum batch to see details.
    </div>
  )

  const cuts = d.cuts!

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-auto bg-stone-50">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">
            {run.product_name || "Rum Production Run"}
          </p>
          <h2 className="text-2xl font-semibold text-stone-900">{run.batch_id}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => d.router.push(`/dashboard/production/rum/edit/${encodeURIComponent(run.batch_id)}`)}
            className="text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-50 px-3 py-1.5 border border-amber-200 bg-white rounded-md transition font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => d.setShowDeleteConfirm(true)}
            className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 border border-red-200 bg-white rounded-md transition font-medium"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="text-xs text-stone-500 hover:text-stone-900 px-3 py-1.5 border border-stone-200 bg-white rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Process Timeline */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <TimelineStep filled={!!run.fermentation_start_date} label="Fermentation" date={formatDate(run.fermentation_start_date)} />
          <div className="flex-1 border-t-2 border-stone-200 mx-3"></div>
          <TimelineStep filled={!!run.distillation_date} label="Distillation" date={formatDate(run.distillation_date)} />
          <div className="flex-1 border-t-2 border-stone-200 mx-3"></div>
          <TimelineStep filled={!!run.fill_date} label="Barrel" date={formatDate(run.fill_date)} />
          <div className="flex-1 border-t-2 border-stone-200 mx-3"></div>
          <TimelineStep filled={false} outlined={!!run.expected_bottling_date} label="Bottling" date={formatDate(run.expected_bottling_date)} />
        </div>
      </div>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-6 gap-3">
        <KpiCard label="Hearts" value={`${formatNumber(cuts.heartsVol, 1)} L`} sub={`${formatNumber(cuts.heartsABV, 1)}% ABV`} highlight />
        <KpiCard label="Hearts LAL" value={formatNumber(cuts.heartsLAL, 1)} sub="Litres of Alcohol" />
        <KpiCard label="Heart Yield" value={`${formatNumber(cuts.heartYield, 1)}%`} sub="Of total LAL" />
        <KpiCard label="LAL In" value={formatNumber(cuts.lalIn, 1)} sub="Boiler charge" />
        <KpiCard label="LAL Out" value={formatNumber(cuts.lalOut, 1)} sub="All cuts" />
        <KpiCard
          label={cuts.hasDataIssue ? 'Check Data' : 'LAL Loss'}
          value={cuts.hasDataIssue ? '—' : `${formatNumber(cuts.lalLossPercent, 1)}%`}
          sub={cuts.hasDataIssue ? 'Out > In' : `${formatNumber(cuts.lalLoss, 1)} LAL`}
          error={cuts.hasDataIssue}
        />
      </div>

      {/* Process Details */}
      <div className="flex flex-col gap-4">
        <RumFermentationSection run={run} />
        <RumDistillationSection run={run} cuts={cuts} />
        <RumBarrelSection
          run={run}
          caskBarrelCodes={d.caskBarrelCodes}
          linkedBarrels={d.linkedBarrels}
          loadingLinkedBarrels={d.loadingLinkedBarrels}
          linkedBarrelsError={d.linkedBarrelsError}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {d.showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Delete Batch?</h2>
              <p className="text-sm text-stone-600 mb-4">
                Are you sure you want to delete batch <strong>{run.batch_id}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => d.setShowDeleteConfirm(false)}
                  disabled={d.isDeleting}
                  className="px-4 py-2 text-sm text-stone-700 bg-white border border-stone-300 rounded-md hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={d.handleDelete}
                  disabled={d.isDeleting}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {d.isDeleting ? 'Deleting...' : 'Delete Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineStep({ filled, outlined, label, date }: { filled: boolean; outlined?: boolean; label: string; date: string }) {
  const dotClass = filled
    ? 'bg-amber-700'
    : outlined
      ? 'border-2 border-amber-700'
      : 'border-2 border-stone-300'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-3 h-3 rounded-full ${dotClass}`}></div>
      <span className="text-xs font-medium text-stone-700 uppercase tracking-wide">{label}</span>
      <span className="text-xs text-stone-500">{date}</span>
    </div>
  )
}

function KpiCard({ label, value, sub, highlight, error }: { label: string; value: string; sub: string; highlight?: boolean; error?: boolean }) {
  const borderClass = highlight ? 'border-amber-700' : error ? 'border-red-500' : 'border-stone-200'
  const valueClass = error ? 'text-red-600' : 'text-stone-900'
  return (
    <div className={`bg-white border ${borderClass} rounded-lg p-3`}>
      <p className="text-xs text-stone-500 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-semibold ${valueClass}`}>{value}</p>
      <p className="text-xs text-stone-500">{sub}</p>
    </div>
  )
}
