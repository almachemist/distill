'use client'

import { BottlingSummary } from '@/types/bottling'

interface BottlingSummaryCardProps {
  summary: BottlingSummary
  mode: 'simple' | 'blend'
}

export default function BottlingSummaryCard({ summary, mode }: BottlingSummaryCardProps) {
  return (
    <div className="rounded-lg bg-[#D7C4A2]/20 border border-[#D7C4A2] p-6">
      <h3 className="text-lg font-semibold text-[#000000] mb-4">
        {mode === 'blend' ? 'Blend Summary' : 'Bottling Summary'}
      </h3>

      <div className="space-y-4">
        {/* Initial Blend (only for blend mode) */}
        {mode === 'blend' && (
          <div className="pb-4 border-b border-[#D7C4A2]">
            <h4 className="text-xs font-medium text-[#777777] mb-3 uppercase tracking-wide">
              Initial Blend
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[#777777] mb-1">Total Volume</p>
                <p className="text-lg font-semibold text-[#000000]">
                  {summary.totalVolume_L.toFixed(1)} L
                </p>
              </div>
              <div>
                <p className="text-xs text-[#777777] mb-1">Total LAL</p>
                <p className="text-lg font-semibold text-[#000000]">
                  {summary.totalLAL.toFixed(2)} L
                </p>
              </div>
              <div>
                <p className="text-xs text-[#777777] mb-1">Blended ABV</p>
                <p className="text-lg font-semibold text-[#A65E2E]">
                  {summary.blendedABV.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dilution (only if water was added) */}
        {summary.totalWaterAdded_L > 0 && (
          <div className="pb-4 border-b border-[#D7C4A2]">
            <h4 className="text-xs font-medium text-[#777777] mb-3 uppercase tracking-wide">
              Dilution
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#777777] mb-1">Water Added</p>
                <p className="text-lg font-semibold text-[#000000]">
                  {summary.totalWaterAdded_L.toFixed(1)} L
                </p>
              </div>
              <div>
                <p className="text-xs text-[#777777] mb-1">Final Volume</p>
                <p className="text-lg font-semibold text-[#000000]">
                  {summary.finalVolume_L.toFixed(1)} L
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Final Product */}
        <div>
          <h4 className="text-xs font-medium text-[#777777] mb-3 uppercase tracking-wide">
            Final Product
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#777777] mb-1">Final ABV</p>
              <p className="text-2xl font-bold text-[#A65E2E]">
                {summary.finalABV.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-[#777777] mb-1">Final Volume</p>
              <p className="text-2xl font-bold text-[#000000]">
                {summary.finalVolume_L.toFixed(1)} L
              </p>
            </div>
          </div>
        </div>

        {/* Bottling Progress (only if bottles were entered) */}
        {summary.totalBottled_L > 0 && (
          <div className="pt-4 border-t border-[#D7C4A2]">
            <h4 className="text-xs font-medium text-[#777777] mb-3 uppercase tracking-wide">
              Bottling Progress
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#777777] mb-1">Bottled</p>
                <p className="text-lg font-semibold text-[#000000]">
                  {summary.totalBottled_L.toFixed(1)} L
                </p>
              </div>
              <div>
                <p className="text-xs text-[#777777] mb-1">Remaining</p>
                <p className="text-lg font-semibold text-[#777777]">
                  {summary.remainingVolume_L.toFixed(1)} L
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#A65E2E] transition-all"
                  style={{
                    width: `${Math.min(100, (summary.totalBottled_L / summary.finalVolume_L) * 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-[#777777] mt-1 text-right">
                {((summary.totalBottled_L / summary.finalVolume_L) * 100).toFixed(1)}% bottled
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

