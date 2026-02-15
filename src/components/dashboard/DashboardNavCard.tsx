import Link from 'next/link'

interface DashboardNavCardProps {
  title: string
  description: string
  href: string
  variant?: 'copper' | 'light' | 'dark'
}

export function DashboardNavCard({ title, description, href, variant = 'light' }: DashboardNavCardProps) {
  const variantStyles = {
    copper: 'bg-copper text-white hover:bg-copper-hover',
    light: 'bg-surface text-foreground border border-border hover:border-copper/30 hover:shadow-elevated',
    dark: 'bg-sidebar text-sidebar-foreground hover:bg-sidebar-hover',
  }

  return (
    <Link href={href}>
      <div className={`rounded-xl shadow-card p-6 transition-all hover:-translate-y-0.5 cursor-pointer ${variantStyles[variant]}`}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className={`text-sm ${variant === 'copper' ? 'text-white/90' : variant === 'dark' ? 'text-sidebar-muted' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
    </Link>
  )
}
