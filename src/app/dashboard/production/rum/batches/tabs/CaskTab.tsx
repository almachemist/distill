"use client"

type RumBatchLegacy = any

export function CaskTab({ batch }: { batch: RumBatchLegacy }) {
  if (!batch.fill_date) {
    return (
      <div className="text-center py-12 text-graphite/60">
        <p>Not yet casked</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div><div className="text-sm text-graphite/60 mb-1">Fill Date</div><div className="font-medium text-graphite">{new Date(batch.fill_date).toLocaleDateString('en-AU')}</div></div>
        <div><div className="text-sm text-graphite/60 mb-1">Cask Number</div><div className="font-bold text-copper text-xl">{batch.cask_number}</div></div>
        <div><div className="text-sm text-graphite/60 mb-1">Origin</div><div className="font-medium text-graphite">{batch.cask_origin}</div></div>
        <div><div className="text-sm text-graphite/60 mb-1">Type</div><div className="font-medium text-graphite">{batch.cask_type || '—'}</div></div>
        <div><div className="text-sm text-graphite/60 mb-1">Size</div><div className="font-medium text-graphite">{batch.cask_size_l || '—'} L</div></div>
        <div><div className="text-sm text-graphite/60 mb-1">Location</div><div className="font-medium text-graphite">{batch.maturation_location || '—'}</div></div>
      </div>

      <div className="bg-copper-10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-graphite mb-4">Fill Details</h3>
        <div className="grid grid-cols-3 gap-6">
          <div><div className="text-sm text-graphite/60 mb-1">Volume Filled</div><div className="font-bold text-copper text-2xl">{batch.volume_filled_l} L</div></div>
          <div><div className="text-sm text-graphite/60 mb-1">Fill ABV</div><div className="font-bold text-copper text-2xl">{batch.fill_abv_percent}%</div></div>
          <div><div className="text-sm text-graphite/60 mb-1">LAL Filled</div><div className="font-bold text-copper text-2xl">{batch.lal_filled?.toFixed(2)} L</div></div>
        </div>
      </div>

      {batch.expected_bottling_date && (
        <div>
          <div className="text-sm text-graphite/60 mb-1">Expected Bottling Date</div>
          <div className="font-medium text-graphite">{new Date(batch.expected_bottling_date).toLocaleDateString('en-AU')}</div>
        </div>
      )}
    </div>
  )
}
