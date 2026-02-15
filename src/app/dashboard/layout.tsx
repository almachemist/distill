'use client'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-beige">
      <nav className="bg-white shadow-sm border-b border-copper-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-graphite">Distil</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/sales"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Sales
                </Link>
                <Link
                  href="/dashboard/production"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Production
                </Link>
                <Link
                  href="/dashboard/batches"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Batches
                </Link>
                <Link
                  href="/dashboard/inventory"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Inventory
                </Link>
                <Link
                  href="/dashboard/products"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Products
                </Link>
                <Link
                  href="/dashboard/recipes"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Recipes
                </Link>
                <Link
                  href="/dashboard/production/tanks"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tanks
                </Link>
                <Link
                  href="/dashboard/barrels"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Barrels
                </Link>
                <Link
                  href="/dashboard/calendar"
                  className="border-transparent text-graphite/70 hover:border-copper-30 hover:text-graphite inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Calendar
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/settings"
                className="text-graphite/60 hover:text-graphite transition-colors"
                title="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </Link>
              <span className="text-sm text-graphite">
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-copper hover:bg-copper/90 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
