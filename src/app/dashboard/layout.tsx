'use client'

import { useAuth } from '@/modules/auth/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  useEffect(() => {
    const isAbortish = (text: string, name?: string) => {
      const t = text.toLowerCase()
      return (
        (name === 'AbortError') ||
        t.includes('net::err_aborted') ||
        t.includes('abort') ||
        t.includes('_rsc=') ||
        t.includes('/dashboard/barrels') ||
        t.includes('ide_webview_request_time=')
      )
    }
    const onError = (e: any) => {
      const msg = String(e?.message || e?.error?.message || '')
      const name = String(e?.error?.name || '')
      if (isAbortish(msg, name)) {
        e.preventDefault?.()
        e.stopImmediatePropagation?.()
        return true
      }
      return false
    }
    const onRejection = (e: any) => {
      const msg = String(e?.reason?.message || '')
      const name = String(e?.reason?.name || '')
      if (isAbortish(msg, name)) {
        e.preventDefault?.()
        e.stopImmediatePropagation?.()
        return true
      }
      return false
    }
    window.addEventListener('error', onError, true)
    window.addEventListener('unhandledrejection', onRejection, true)
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log
    const filterArgs = (args: any[]) =>
      args
        .map((a) =>
          typeof a === 'string'
            ? a
            : a && typeof a === 'object' && 'message' in a
            ? String((a as any).message)
            : ''
        )
        .join(' ')
    console.error = (...args: any[]) => {
      const text = filterArgs(args)
      if (isAbortish(text)) return
      originalError(...args)
    }
    console.warn = (...args: any[]) => {
      const text = filterArgs(args)
      if (isAbortish(text)) return
      originalWarn(...args)
    }
    console.log = (...args: any[]) => {
      const text = filterArgs(args)
      if (isAbortish(text)) return
      originalLog(...args)
    }
    return () => {
      window.removeEventListener('error', onError, true)
      window.removeEventListener('unhandledrejection', onRejection, true)
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    }
  }, [])

  return (
    <div className="min-h-screen bg-beige">
      <nav className="bg-white shadow-sm border-b border-copper-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <img src="/logo.png" alt="Distil" className="h-8 w-8 rounded-sm" />
                  <span className="text-xl font-bold text-graphite">Distil</span>
                </Link>
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
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-sm text-graphite mr-4">
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
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
