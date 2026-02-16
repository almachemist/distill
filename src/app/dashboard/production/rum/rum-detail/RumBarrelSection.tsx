"use client"

import { useRouter } from "next/navigation"
import { formatDate, formatNumber } from "./rum-detail-utils"

interface RumBarrelSectionProps {
  run: any
  caskBarrelCodes: string[]
  linkedBarrels: any[]
  loadingLinkedBarrels: boolean
  linkedBarrelsError: string | null
}

export function RumBarrelSection({ run, caskBarrelCodes, linkedBarrels, loadingLinkedBarrels, linkedBarrelsError }: RumBarrelSectionProps) {
  const router = useRouter()

  if (!run.cask_number) return null

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-stone-800 tracking-wide uppercase mb-3">Barrel / Maturation</h3>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-stone-500 uppercase">Fill Date</dt>
          <dd className="font-medium text-stone-900">{formatDate(run.fill_date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Cask #</dt>
          <dd className="font-medium text-stone-900">#{run.cask_number}</dd>
          {caskBarrelCodes.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {caskBarrelCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => router.push(`/dashboard/barrels/${encodeURIComponent(code)}`)}
                  className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:border-stone-300 hover:text-stone-900"
                  title={`Open barrel ${code}`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Origin</dt>
          <dd className="font-medium text-stone-900">{run.cask_origin || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Type</dt>
          <dd className="font-medium text-stone-900">{run.cask_type || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Size</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.cask_size_l, 0)} L</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Fill ABV</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.fill_abv_percent, 1)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">Volume Filled</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.volume_filled_l, 0)} L</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 uppercase">LAL Filled</dt>
          <dd className="font-medium text-stone-900">{formatNumber(run.lal_filled, 1)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-stone-500 uppercase">Location</dt>
          <dd className="font-medium text-stone-900">{run.maturation_location || "—"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-stone-500 uppercase">Expected Bottling</dt>
          <dd className="font-medium text-stone-900">{formatDate(run.expected_bottling_date)}</dd>
        </div>
      </dl>

      {/* Linked Barrels */}
      <div className="mt-4 pt-4 border-t border-stone-300">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-stone-700 uppercase">Linked Barrels</h4>
          <div className="text-xs text-stone-500">{loadingLinkedBarrels ? 'Loading…' : `${linkedBarrels.length}`}</div>
        </div>

        {linkedBarrelsError ? (
          <div className="mt-2 text-xs text-red-700">{linkedBarrelsError}</div>
        ) : linkedBarrels.length === 0 ? (
          <div className="mt-2 text-xs text-stone-500">—</div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {linkedBarrels.map((b: any) => {
              const id = String(b?.id || b?.barrelNumber || b?.barrel_number || '').trim()
              const code = String(b?.barrelNumber || b?.barrel_number || id).toUpperCase()
              return (
                <button
                  key={id || code}
                  type="button"
                  onClick={() => router.push(`/dashboard/barrels/${encodeURIComponent(id || code)}`)}
                  className="px-2 py-1 rounded-md bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:border-stone-300 hover:text-stone-900"
                  title={`Open barrel ${code}`}
                >
                  {code}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Maturation Notes */}
      {run.notes && run.notes !== "-" && (
        <div className="mt-4 pt-4 border-t border-stone-300">
          <h4 className="text-xs font-semibold text-stone-700 uppercase mb-2">Notes</h4>
          <p className="text-sm text-stone-700">{run.notes}</p>
        </div>
      )}
    </div>
  )
}
