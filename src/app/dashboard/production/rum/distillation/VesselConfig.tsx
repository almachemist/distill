"use client"

interface VesselProps {
  title: string
  colorScheme: 'blue' | 'amber' | 'orange'
  content?: string; onContentChange?: (v: string) => void
  volume: number; onVolumeChange: (v: number) => void
  abv: number; onAbvChange: (v: number) => void
  lal: number
  elements: string; onElementsChange: (v: string) => void
  idPrefix: string
}

const COLORS = {
  blue: { bg: 'bg-blue-50', label: 'text-blue-700', title: 'text-blue-900', input: 'border-blue-300 focus:ring-blue-500', readonlyBg: 'bg-blue-100 border-blue-200', readonlyText: 'text-blue-900' },
  amber: { bg: 'bg-amber-50', label: 'text-amber-700', title: 'text-amber-900', input: 'border-amber-300 focus:ring-amber-500', readonlyBg: 'bg-amber-100 border-amber-200', readonlyText: 'text-amber-900' },
  orange: { bg: 'bg-orange-50', label: 'text-orange-700', title: 'text-orange-900', input: 'border-orange-300 focus:ring-orange-500', readonlyBg: 'bg-orange-100 border-orange-200', readonlyText: 'text-orange-900' },
}

export function VesselCard({ title, colorScheme, content, onContentChange, volume, onVolumeChange, abv, onAbvChange, lal, elements, onElementsChange, idPrefix }: VesselProps) {
  const c = COLORS[colorScheme]
  return (
    <div className={`${c.bg} rounded-lg p-4 space-y-3`}>
      <h3 className={`font-semibold ${c.title}`}>{title}</h3>

      {onContentChange !== undefined && (
        <div>
          <label htmlFor={`${idPrefix}_content`} className={`block text-xs font-medium ${c.label} mb-1`}>Content</label>
          <input id={`${idPrefix}_content`} type="text" value={content ?? ''} onChange={(e) => onContentChange(e.target.value)}
            className={`w-full px-3 py-2 bg-white border ${c.input} rounded-lg focus:ring-2 text-graphite text-sm`} />
        </div>
      )}

      <div>
        <label htmlFor={`${idPrefix}_volume`} className={`block text-xs font-medium ${c.label} mb-1`}>Volume (L)</label>
        <input id={`${idPrefix}_volume`} type="number" step="0.1" value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value) || 0)}
          className={`w-full px-3 py-2 bg-white border ${c.input} rounded-lg focus:ring-2 text-graphite text-sm`} />
      </div>

      <div>
        <label htmlFor={`${idPrefix}_abv`} className={`block text-xs font-medium ${c.label} mb-1`}>ABV (%)</label>
        <input id={`${idPrefix}_abv`} type="number" step="0.1" value={abv}
          onChange={(e) => onAbvChange(parseFloat(e.target.value) || 0)}
          className={`w-full px-3 py-2 bg-white border ${c.input} rounded-lg focus:ring-2 text-graphite text-sm`} />
      </div>

      <div>
        <label htmlFor={`${idPrefix}_lal`} className={`block text-xs font-medium ${c.label} mb-1`}>LAL</label>
        <input id={`${idPrefix}_lal`} type="number" value={lal.toFixed(2)} readOnly
          className={`w-full px-3 py-2 ${c.readonlyBg} rounded-lg ${c.readonlyText} text-sm font-medium`} />
      </div>

      <div>
        <label htmlFor={`${idPrefix}_elements`} className={`block text-xs font-medium ${c.label} mb-1`}>Elements</label>
        <input id={`${idPrefix}_elements`} type="text" value={elements} onChange={(e) => onElementsChange(e.target.value)}
          className={`w-full px-3 py-2 bg-white border ${c.input} rounded-lg focus:ring-2 text-graphite text-sm`} />
      </div>
    </div>
  )
}
