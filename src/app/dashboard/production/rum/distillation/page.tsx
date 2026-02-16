"use client"

import { Suspense } from 'react'
import { useRumDistillation, TailsSegment } from './useRumDistillation'
import { VesselCard } from './VesselConfig'

function RumDistillationContent() {
  const d = useRumDistillation()

  return (
    <div className="min-h-screen bg-beige p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-graphite/60">
          <span>Production</span><span className="mx-2">→</span>
          <span>Rum Production</span><span className="mx-2">→</span>
          <span>Fermentation</span><span className="mx-2">→</span>
          <span className="font-medium text-copper">Double Retort Distillation</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-graphite mb-2">Double Retort Distillation</h1>
          <p className="text-graphite/70">Batch: <span className="font-mono font-medium text-copper">{d.batchId}</span></p>
          <p className="text-sm text-graphite/60 mt-2">Still: <span className="font-mono font-medium text-copper">Roberta (Double Retort)</span></p>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-graphite">Distillation Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="distillation_date" className="block text-sm font-medium text-graphite mb-2">Date</label>
              <input id="distillation_date" type="date" value={d.distillationDate} onChange={(e) => d.setDistillationDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-graphite mb-2">Start Time</label>
              <input id="start_time" type="time" value={d.startTime} onChange={(e) => d.setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
            </div>
          </div>
        </div>

        {/* Vessels Configuration */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-graphite">Vessel Configuration (3-Vessel System)</h2>
          <div className="grid grid-cols-3 gap-4">
            <VesselCard title="Boiler (Wash)" colorScheme="blue" idPrefix="boiler"
              volume={d.boilerVolume} onVolumeChange={d.setBoilerVolume}
              abv={d.boilerABV} onAbvChange={d.setBoilerABV} lal={d.boilerLAL}
              elements={d.boilerElements} onElementsChange={d.setBoilerElements} />
            <VesselCard title="Retort 1 (Late Tails)" colorScheme="amber" idPrefix="retort1"
              content={d.retort1Content} onContentChange={d.setRetort1Content}
              volume={d.retort1Volume} onVolumeChange={d.setRetort1Volume}
              abv={d.retort1ABV} onAbvChange={d.setRetort1ABV} lal={d.retort1LAL}
              elements={d.retort1Elements} onElementsChange={d.setRetort1Elements} />
            <VesselCard title="Retort 2 (Early Tails)" colorScheme="orange" idPrefix="retort2"
              content={d.retort2Content} onContentChange={d.setRetort2Content}
              volume={d.retort2Volume} onVolumeChange={d.setRetort2Volume}
              abv={d.retort2ABV} onAbvChange={d.setRetort2ABV} lal={d.retort2LAL}
              elements={d.retort2Elements} onElementsChange={d.setRetort2Elements} />
          </div>
          <div className="bg-gradient-to-r from-blue-50 via-amber-50 to-orange-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-graphite">Total Input LAL (All 3 Vessels)</span>
              <span className="text-2xl font-bold text-copper">{d.totalLALStart.toFixed(2)} L</span>
            </div>
          </div>
        </div>

        {/* Cuts Section */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-graphite">Distillation Cuts</h2>

          {/* Foreshots */}
          <div className="border border-copper-15 rounded-lg p-4">
            <h3 className="font-semibold text-graphite mb-3">Foreshots</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="foreshots_time" className="block text-sm font-medium text-graphite mb-2">Time</label>
                <input id="foreshots_time" type="time" value={d.foreshotsTime} onChange={(e) => d.setForeshotsTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
              </div>
              <div>
                <label htmlFor="foreshots_abv" className="block text-sm font-medium text-graphite mb-2">ABV (%)</label>
                <input id="foreshots_abv" type="number" step="0.1" value={d.foreshotsABV} onChange={(e) => d.setForeshotsABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
              </div>
              <div>
                <label htmlFor="foreshots_notes" className="block text-sm font-medium text-graphite mb-2">Notes</label>
                <input id="foreshots_notes" type="text" value={d.foreshotsNotes} onChange={(e) => d.setForeshotsNotes(e.target.value)}
                  placeholder="Discarded, aggressive, etc."
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
              </div>
            </div>
          </div>

          {/* Heads */}
          <CutRow label="Heads" idPrefix="heads"
            time={d.headsTime} onTimeChange={d.setHeadsTime}
            volume={d.headsVolume} onVolumeChange={d.setHeadsVolume}
            abv={d.headsABV} onAbvChange={d.setHeadsABV}
            lal={d.headsLAL} notes={d.headsNotes} onNotesChange={d.setHeadsNotes}
            notesPlaceholder="Aromatic, clean..." />

          {/* Hearts */}
          <div className="border-2 border-copper rounded-lg p-4 bg-copper-10">
            <h3 className="font-semibold text-copper mb-3">Hearts (Main Cut)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="hearts_time" className="block text-sm font-medium text-graphite mb-2">Time</label>
                <input id="hearts_time" type="time" value={d.heartsTime} onChange={(e) => d.setHeartsTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
              </div>
              <div>
                <label htmlFor="hearts_volume" className="block text-sm font-medium text-graphite mb-2">Volume (L)</label>
                <input id="hearts_volume" type="number" step="0.1" value={d.heartsVolume} onChange={(e) => d.setHeartsVolume(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
              </div>
              <div>
                <label htmlFor="hearts_abv" className="block text-sm font-medium text-graphite mb-2">ABV (%)</label>
                <input id="hearts_abv" type="number" step="0.1" value={d.heartsABV} onChange={(e) => d.setHeartsABV(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
              </div>
              <div>
                <label htmlFor="hearts_lal" className="block text-sm font-medium text-graphite mb-2">LAL</label>
                <input id="hearts_lal" type="number" value={d.heartsLAL.toFixed(2)} readOnly
                  className="w-full px-4 py-3 bg-copper-20 border border-copper rounded-lg text-copper font-bold" />
              </div>
              <div>
                <label htmlFor="hearts_notes" className="block text-sm font-medium text-graphite mb-2">Notes</label>
                <input id="hearts_notes" type="text" value={d.heartsNotes} onChange={(e) => d.setHeartsNotes(e.target.value)}
                  placeholder="Character notes..."
                  className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
              </div>
            </div>
          </div>

          {/* Tails */}
          <div className="border border-copper-15 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-graphite">Tails (Multi-Collection)</h3>
              <button onClick={d.addTailsSegment}
                className="px-3 py-1 bg-copper-10 text-copper rounded-lg hover:bg-copper-20 border border-copper-30 text-sm font-medium">+ Add Collection</button>
            </div>
            <div className="space-y-3">
              {d.tailsSegments.map((segment, index) => (
                <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-3 p-3 bg-beige rounded-lg">
                  <div>
                    <label htmlFor={`tails_${index}_time`} className="block text-xs font-medium text-graphite mb-1">Time</label>
                    <input id={`tails_${index}_time`} type="time" value={segment.time}
                      onChange={(e) => d.updateTailsSegment(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm" />
                  </div>
                  <div>
                    <label htmlFor={`tails_${index}_volume`} className="block text-xs font-medium text-graphite mb-1">Volume (L)</label>
                    <input id={`tails_${index}_volume`} type="number" step="0.1" value={segment.volume}
                      onChange={(e) => d.updateTailsSegment(index, 'volume', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm" />
                  </div>
                  <div>
                    <label htmlFor={`tails_${index}_abv`} className="block text-xs font-medium text-graphite mb-1">ABV (%)</label>
                    <input id={`tails_${index}_abv`} type="number" step="0.1" value={segment.abv}
                      onChange={(e) => d.updateTailsSegment(index, 'abv', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm" />
                  </div>
                  <div>
                    <label htmlFor={`tails_${index}_lal`} className="block text-xs font-medium text-graphite mb-1">LAL</label>
                    <input id={`tails_${index}_lal`} type="number" value={segment.lal.toFixed(2)} readOnly
                      className="w-full px-3 py-2 bg-beige border border-copper-15 rounded-lg text-graphite text-sm font-medium" />
                  </div>
                  <div>
                    <label htmlFor={`tails_${index}_notes`} className="block text-xs font-medium text-graphite mb-1">Notes</label>
                    <input id={`tails_${index}_notes`} type="text" value={segment.notes}
                      onChange={(e) => d.updateTailsSegment(index, 'notes', e.target.value)}
                      placeholder="Funky, oily..."
                      className="w-full px-3 py-2 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper text-graphite text-sm" />
                  </div>
                  <div className="flex items-end">
                    {d.tailsSegments.length > 1 && (
                      <button onClick={() => d.removeTailsSegment(index)}
                        className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yield Summary */}
        <div className="bg-gradient-to-br from-copper-10 to-copper-20 rounded-xl border border-copper-30 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-graphite mb-4">Yield Summary</h2>
          <div className="grid grid-cols-4 gap-6">
            <div><div className="text-sm text-graphite/60 mb-1">Total Input LAL</div><div className="text-2xl font-bold text-graphite">{d.totalLALStart.toFixed(2)} L</div></div>
            <div><div className="text-sm text-graphite/60 mb-1">Total Output LAL</div><div className="text-2xl font-bold text-graphite">{d.totalLALEnd.toFixed(2)} L</div></div>
            <div><div className="text-sm text-graphite/60 mb-1">Heart Yield</div><div className="text-2xl font-bold text-copper">{d.heartYieldPercent.toFixed(1)}%</div></div>
            <div><div className="text-sm text-graphite/60 mb-1">LAL Loss</div><div className="text-2xl font-bold text-graphite">{d.lalLoss.toFixed(2)} L</div></div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-copper-15 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-graphite mb-4">Distillation Notes</h2>
          <textarea value={d.notes} onChange={(e) => d.setNotes(e.target.value)} rows={4}
            placeholder="Observations, aromas, performance notes..."
            className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
        </div>

        <div className="flex justify-between">
          <button onClick={d.handleBack}
            className="px-6 py-3 bg-white border border-copper-30 text-graphite rounded-lg hover:bg-beige font-medium transition-all">← Back to Fermentation</button>
          <button onClick={d.handleSubmit}
            className="px-8 py-3 bg-copper text-white rounded-lg hover:bg-copper/90 font-medium shadow-md transition-all">Save & Continue to Cask Filling →</button>
        </div>
      </div>
    </div>
  )
}

/** Reusable cut row for Heads (foreshots & hearts have unique styling) */
function CutRow({ label, idPrefix, time, onTimeChange, volume, onVolumeChange, abv, onAbvChange, lal, notes, onNotesChange, notesPlaceholder }: {
  label: string; idPrefix: string
  time: string; onTimeChange: (v: string) => void
  volume: number; onVolumeChange: (v: number) => void
  abv: number; onAbvChange: (v: number) => void
  lal: number; notes: string; onNotesChange: (v: string) => void
  notesPlaceholder: string
}) {
  return (
    <div className="border border-copper-15 rounded-lg p-4">
      <h3 className="font-semibold text-graphite mb-3">{label}</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label htmlFor={`${idPrefix}_time`} className="block text-sm font-medium text-graphite mb-2">Time</label>
          <input id={`${idPrefix}_time`} type="time" value={time} onChange={(e) => onTimeChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
        </div>
        <div>
          <label htmlFor={`${idPrefix}_volume`} className="block text-sm font-medium text-graphite mb-2">Volume (L)</label>
          <input id={`${idPrefix}_volume`} type="number" step="0.1" value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
        </div>
        <div>
          <label htmlFor={`${idPrefix}_abv`} className="block text-sm font-medium text-graphite mb-2">ABV (%)</label>
          <input id={`${idPrefix}_abv`} type="number" step="0.1" value={abv} onChange={(e) => onAbvChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
        </div>
        <div>
          <label htmlFor={`${idPrefix}_lal`} className="block text-sm font-medium text-graphite mb-2">LAL</label>
          <input id={`${idPrefix}_lal`} type="number" value={lal.toFixed(2)} readOnly
            className="w-full px-4 py-3 bg-beige border border-copper-15 rounded-lg text-graphite font-medium" />
        </div>
        <div>
          <label htmlFor={`${idPrefix}_notes`} className="block text-sm font-medium text-graphite mb-2">Notes</label>
          <input id={`${idPrefix}_notes`} type="text" value={notes} onChange={(e) => onNotesChange(e.target.value)}
            placeholder={notesPlaceholder}
            className="w-full px-4 py-3 bg-white border border-copper-30 rounded-lg focus:ring-2 focus:ring-copper focus:border-copper text-graphite" />
        </div>
      </div>
    </div>
  )
}

export default function RumDistillationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-beige p-6" />}>
      <RumDistillationContent />
    </Suspense>
  )
}
