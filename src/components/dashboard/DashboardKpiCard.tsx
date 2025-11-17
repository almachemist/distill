interface DashboardKpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  accent?: 'copper' | 'gray'
  delta?: {
    value: number
    label: string
  }
}

export function DashboardKpiCard({ title, value, subtitle, accent = 'gray', delta }: DashboardKpiCardProps) {
  const accentColor = accent === 'copper' ? 'border-[#A65E2E]' : 'border-gray-300'

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-t-2 ${accentColor} p-6 hover:shadow-md transition-shadow`}>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[#777777]">{title}</p>
        <p className="text-3xl font-bold text-[#1A1A1A]">{value}</p>
        {subtitle && (
          <p className="text-xs text-[#777777]">{subtitle}</p>
        )}
        {delta && (
          <p className="text-xs text-[#777777] flex items-center gap-1">
            <span>{delta.value > 0 ? '↑' : delta.value < 0 ? '↓' : '→'}</span>
            <span>{Math.abs(delta.value)}% {delta.label}</span>
          </p>
        )}
      </div>
    </div>
  )
}

