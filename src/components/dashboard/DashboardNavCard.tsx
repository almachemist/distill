import Link from 'next/link'

interface DashboardNavCardProps {
  title: string
  description: string
  href: string
  variant?: 'copper' | 'beige' | 'light-gray'
}

export function DashboardNavCard({ title, description, href, variant = 'light-gray' }: DashboardNavCardProps) {
  const variantStyles = {
    copper: 'bg-[#A65E2E] text-white hover:bg-[#8B4E26]',
    beige: 'bg-[#D7C4A2] text-stone-900 hover:bg-[#C9B594]',
    'light-gray': 'bg-[#E5E5E5] text-stone-900 hover:bg-[#D5D5D5]'
  }

  return (
    <Link href={href}>
      <div className={`rounded-lg shadow-sm p-6 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${variantStyles[variant]}`}>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className={`text-sm ${variant === 'copper' ? 'text-white/90' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </Link>
  )
}

