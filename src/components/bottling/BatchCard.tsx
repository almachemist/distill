'use client'

import { Batch } from '@/types/bottling'

interface BatchCardProps {
  batch: Batch
  onAdd?: () => void
  onRemove?: () => void
  isSelected?: boolean
  showAddButton?: boolean
  showRemoveButton?: boolean
}

export default function BatchCard({
  batch,
  onAdd,
  onRemove,
  isSelected = false,
  showAddButton = false,
  showRemoveButton = false
}: BatchCardProps) {
  return (
    <div
      className={`
        rounded-lg border transition-all
        ${isSelected 
          ? 'border-[#A65E2E] bg-[#A65E2E]/5' 
          : 'border-[#E5E5E5] bg-white hover:border-[#D7C4A2]'
        }
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-[#000000]">
              {batch.batchCode}
            </h3>
            <p className="text-sm text-[#777777] mt-0.5">
              {batch.productName}
            </p>
            <p className="text-xs text-[#A65E2E] mt-0.5 capitalize">
              {batch.productType.replace('_', ' ')}
            </p>
          </div>
          
          {showRemoveButton && onRemove && (
            <button
              onClick={onRemove}
              className="text-[#777777] hover:text-red-600 transition-colors"
              title="Remove from blend"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-xs text-[#777777] mb-1">Volume</p>
            <p className="text-sm font-medium text-[#000000]">
              {batch.volumeLitres.toFixed(1)} L
            </p>
          </div>
          <div>
            <p className="text-xs text-[#777777] mb-1">ABV</p>
            <p className="text-sm font-medium text-[#000000]">
              {batch.abvPercent.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-[#777777] mb-1">LAL</p>
            <p className="text-sm font-medium text-[#000000]">
              {batch.lal.toFixed(2)} L
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {(batch.distilledAt || batch.tankCode) && (
          <div className="pt-3 border-t border-[#E5E5E5]">
            <div className="flex items-center gap-4 text-xs text-[#777777]">
              {batch.distilledAt && (
                <span>Distilled: {new Date(batch.distilledAt).toLocaleDateString()}</span>
              )}
              {batch.tankCode && (
                <span>Tank: {batch.tankCode}</span>
              )}
            </div>
          </div>
        )}

        {/* Add Button */}
        {showAddButton && onAdd && (
          <button
            onClick={onAdd}
            className="
              w-full mt-3 px-4 py-2 rounded-md
              bg-[#A65E2E] hover:bg-[#8B4E26]
              text-white text-sm font-medium
              transition-colors
            "
          >
            Add to Blend
          </button>
        )}
      </div>
    </div>
  )
}

