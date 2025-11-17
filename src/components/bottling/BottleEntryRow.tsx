'use client'

import { BottleEntry } from '@/types/bottling'

interface BottleEntryRowProps {
  entry: BottleEntry
  finalABV: number
  onUpdate: (entry: BottleEntry) => void
  onRemove: () => void
}

export default function BottleEntryRow({
  entry,
  finalABV,
  onUpdate,
  onRemove
}: BottleEntryRowProps) {
  
  function handleQuantityChange(quantity: number) {
    const volumeBottled_L = (quantity * entry.size_ml) / 1000
    const lalBottled = (volumeBottled_L * finalABV) / 100
    
    onUpdate({
      ...entry,
      quantity,
      volumeBottled_L,
      lalBottled
    })
  }

  return (
    <div className="grid grid-cols-5 gap-4 items-center p-3 rounded-lg border border-[#E5E5E5] bg-white">
      {/* Bottle Size */}
      <div>
        <p className="text-sm font-medium text-[#000000]">
          {entry.size_ml} ml
        </p>
      </div>

      {/* Quantity Input */}
      <div>
        <input
          type="number"
          min="0"
          step="1"
          value={entry.quantity === 0 ? '' : entry.quantity}
          onChange={(e) => {
            const value = e.target.value === '' ? 0 : parseInt(e.target.value)
            handleQuantityChange(isNaN(value) ? 0 : value)
          }}
          className="
            w-full px-3 py-2 rounded-md
            border border-[#E5E5E5]
            text-sm text-[#000000]
            focus:outline-none focus:ring-2 focus:ring-[#A65E2E] focus:border-transparent
          "
          placeholder="0"
        />
      </div>

      {/* Volume Bottled */}
      <div>
        <p className="text-sm text-[#777777]">
          {entry.volumeBottled_L.toFixed(2)} L
        </p>
      </div>

      {/* LAL Bottled */}
      <div>
        <p className="text-sm text-[#777777]">
          {entry.lalBottled.toFixed(2)} LAL
        </p>
      </div>

      {/* Remove Button */}
      <div className="flex justify-end">
        <button
          onClick={onRemove}
          className="text-[#777777] hover:text-red-600 transition-colors"
          title="Remove bottle size"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

