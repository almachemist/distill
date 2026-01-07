import Link from 'next/link'

interface DashboardNavCardProps {
  title: string
  description: string
  href: string
  variant?: 'copper' | 'beige' | 'light-gray'
}

export function DashboardNavCard({ title, description, href, variant = 'light-gray' }: DashboardNavCardProps) {
  const variantStyles = {
    copper: 'bg-copper text-white hover:bg-copper/90',
    beige: 'bg-beige text-graphite hover:bg-copper-20',
    'light-gray': 'bg-graphite text-white hover:bg-graphite'
  }

  return (
    <Link href={href}>
      <div className={`rounded-lg shadow-sm p-6 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${variantStyles[variant]}`}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className={`text-sm ${variant === 'copper' ? 'text-white/90' : variant === 'light-gray' ? 'text-white/80' : 'text-graphite/80'}`}>
          {description}
        </p>
      </div>
    </Link>
  )
}
