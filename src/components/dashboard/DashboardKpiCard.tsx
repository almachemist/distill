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
  const accentColor = accent === 'copper' ? 'border-copper' : 'border-border'

  return (
    <div className={`bg-surface rounded-xl shadow-card border ${accent === 'copper' ? 'border-copper/40' : 'border-border'} p-6 hover:shadow-elevated transition-shadow`}>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {delta && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{delta.value > 0 ? '↑' : delta.value < 0 ? '↓' : '→'}</span>
            <span>{Math.abs(delta.value)}% {delta.label}</span>
          </p>
        )}
      </div>
    </div>
  )
}

