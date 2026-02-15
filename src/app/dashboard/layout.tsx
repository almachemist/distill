'use client'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import {
  LayoutDashboard,
  Beaker,
  FlaskConical,
  Layers,
  Container,
  Wine,
  Package,
  BookOpen,
  TrendingUp,
  Users,
  ShoppingCart,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Production',
    items: [
      { label: 'Production', href: '/dashboard/production', icon: Beaker },
      { label: 'Batches', href: '/dashboard/batches', icon: Layers },
      { label: 'Tanks', href: '/dashboard/production/tanks', icon: Container },
      { label: 'Barrels', href: '/dashboard/barrels', icon: Wine },
      { label: 'Recipes', href: '/dashboard/recipes', icon: BookOpen },
    ],
  },
  {
    title: 'Inventory & Sales',
    items: [
      { label: 'Inventory', href: '/dashboard/inventory', icon: Package },
      { label: 'Products', href: '/dashboard/products', icon: ShoppingCart },
      { label: 'Sales', href: '/dashboard/sales', icon: TrendingUp },
      { label: 'CRM', href: '/dashboard/crm', icon: Users },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    ],
  },
]

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-5 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="w-8 h-8 rounded-lg bg-copper flex items-center justify-center">
            <FlaskConical className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground tracking-tight">
            Distil
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navGroups.map((group) => (
          <div key={group.title}>
            <button
              onClick={() => toggleGroup(group.title)}
              className="flex items-center justify-between w-full px-2 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            >
              {group.title}
              {collapsed[group.title] ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {!collapsed[group.title] && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-sidebar-hover text-sidebar-foreground border-l-2 border-copper ml-0.5'
                          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', active && 'text-copper')} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-sidebar-hover px-3 py-3 space-y-0.5">
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname.startsWith('/dashboard/settings')
              ? 'bg-sidebar-hover text-sidebar-foreground'
              : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'
          )}
        >
          <Settings className={cn('w-4 h-4', pathname.startsWith('/dashboard/settings') && 'text-copper')} />
          Settings
        </Link>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-sidebar">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-60 bg-sidebar z-50">
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-surface border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.displayName || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  )
}
