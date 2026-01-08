interface DataPoint {
  month: string
  value: number
}

interface DashboardMiniChartProps {
  title: string
  data: DataPoint[]
  color: 'copper' | 'beige'
  valueLabel?: string
}

export function DashboardMiniChart({ title, data, color, valueLabel = '' }: DashboardMiniChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">{title}</h2>
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue
  const safeRange = range === 0 ? 1 : range

  const colorMap = {
    copper: {
      fill: '#A65E2E',
      stroke: '#8B4E26',
      bg: 'rgba(166, 94, 46, 0.1)'
    },
    beige: {
      fill: '#D7C4A2',
      stroke: '#C9B594',
      bg: 'rgba(215, 196, 162, 0.1)'
    }
  }

  const colors = colorMap[color]

  // Calculate SVG path for area chart
  const width = 600
  const height = 120
  const padding = 10
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const n = data.length

  const points = data.map((d, i) => {
    const xRatio = n > 1 ? (i / (n - 1)) : 0.5
    const x = padding + xRatio * chartWidth
    const yRatio = ((d.value - minValue) / safeRange)
    const y = padding + chartHeight - yRatio * chartHeight
    return { x, y, value: d.value }
  })

  // Create area path (filled)
  const areaPath = [
    `M ${padding} ${height - padding}`, // Start at bottom-left
    ...points.map(p => `L ${p.x} ${p.y}`), // Line to each point
    `L ${width - padding} ${height - padding}`, // Line to bottom-right
    'Z' // Close path
  ].join(' ')

  // Create line path (stroke)
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
        <span className="text-xs text-gray-500">Last 12 months</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxHeight: '120px' }}
      >
        {/* Grid lines (subtle) */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * (1 - ratio)
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#E5E5E5"
              strokeWidth="1"
            />
          )
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={colors.bg}
        />

        {/* Line stroke */}
        <path
          d={linePath}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={colors.fill}
          />
        ))}

        {/* Month labels */}
        {data.map((d, i) => {
          if (i % 2 !== 0) return null // Show every other month
          const xRatio = n > 1 ? (i / (n - 1)) : 0.5
          const x = padding + xRatio * chartWidth
          return (
            <text
              key={i}
              x={x}
              y={height - 2}
              textAnchor="middle"
              fontSize="10"
              fill="#777777"
            >
              {d.month}
            </text>
          )
        })}
      </svg>

      {/* Summary stats */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>
          Total:{' '}
          <strong className="text-stone-900">
            {data
              .reduce((sum, d) => sum + (Number.isFinite(d.value) ? d.value : 0), 0)
              .toLocaleString()}
          </strong>{' '}
          {valueLabel}
        </span>
        <span>
          Avg:{' '}
          <strong className="text-stone-900">
            {(() => {
              const s = data.reduce((sum, d) => sum + (Number.isFinite(d.value) ? d.value : 0), 0)
              const avg = data.length > 0 ? Math.round(s / data.length) : 0
              return Number.isFinite(avg) ? avg.toLocaleString() : '0'
            })()}
          </strong>{' '}
          {valueLabel}
        </span>
      </div>
    </div>
  )
}
