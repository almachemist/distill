import Link from 'next/link'

interface RecentItem {
  id: string
  name: string
  date: string
  href: string
}

interface DashboardRecentListProps {
  title: string
  items: RecentItem[]
}

export function DashboardRecentList({ title, items }: DashboardRecentListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
      
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No recent items</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-stone-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
              <Link 
                href={item.href}
                className="text-sm text-[#A65E2E] hover:text-[#8B4E26] font-medium"
              >
                View Batch →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

