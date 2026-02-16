import { useState, useEffect } from 'react'

export interface RecentDistillation {
  id: string
  name: string
  date: string
  href: string
}

export interface DashboardStats {
  batchesThisYear: number
  pureAlcoholLAL: number
  avgEfficiency: number
  totalUnitsInStock: number
  activeRecipes: number
  bottlingRunsThisMonth: number
  productionTrend: { month: string; batches: number }[]
  salesTrend: { month: string; units: number }[]
  recentDistillations: RecentDistillation[]
}

/** Row shape returned by GET /api/batches */
interface BatchRow {
  id: string
  batch_code: string
  product_name: string
  product_type: string
  status: string
  date: string | null
  still_used: string | null
  final_volume_l: number | null
  final_abv_percent: number | null
  final_lal: number | null
  bottle_count: number | null
  notes: string | null
}

/**
 * Fetches dashboard KPI stats from the `batches` table (SSOT).
 *
 * @returns Dashboard stats, loading, and error state.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)

        const currentYear = new Date().getFullYear()

        // Fetch all batches from SSOT
        const batchesRes = await fetch('/api/batches')
        if (!batchesRes.ok) throw new Error('Failed to load batches')
        const allBatches: BatchRow[] = await batchesRes.json()

        // Filter to current year (by date)
        const thisYear = allBatches.filter((b) => {
          if (!b.date) return false
          return new Date(b.date).getFullYear() === currentYear
        })

        // 1. Batches this year (finalized only)
        const finalThisYear = thisYear.filter((b) => b.status === 'final')
        const batchesThisYear = finalThisYear.length

        // 2. Total LAL produced this year
        const totalLAL = finalThisYear.reduce((sum, b) => sum + (Number(b.final_lal) || 0), 0)

        // 3. Average efficiency (LAL out / volume in, as %)
        // With the normalized table we only have final_volume and final_abv,
        // so we approximate efficiency as ABV (the fraction of pure alcohol).
        const batchesWithAbv = finalThisYear.filter((b) => b.final_abv_percent != null && Number(b.final_abv_percent) > 0)
        const avgEfficiency = batchesWithAbv.length > 0
          ? batchesWithAbv.reduce((sum, b) => sum + Number(b.final_abv_percent), 0) / batchesWithAbv.length
          : 0

        // 4. Total units in stock (TODO: Square POS integration)
        const totalUnitsInStock = 0

        // 5. Active recipes
        let activeRecipes = 0
        try {
          const recipesRes = await fetch('/api/recipes')
          if (recipesRes.ok) {
            const recipesData = await recipesRes.json()
            activeRecipes = Array.isArray(recipesData) ? recipesData.length : (recipesData?.recipes?.length ?? 0)
          }
        } catch { /* ignore — show 0 */ }

        // 6. Bottling runs this month (batches with bottle_count set, dated this month)
        const currentMonth = new Date().getMonth() + 1
        const bottlingRunsThisMonth = finalThisYear.filter((b) => {
          if (!b.bottle_count || !b.date) return false
          const d = new Date(b.date)
          return d.getMonth() + 1 === currentMonth
        }).length

        // 7. Production trend (12 months of current year)
        const productionTrend = Array.from({ length: 12 }, (_, i) => {
          const monthName = new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' })
          const count = finalThisYear.filter((b) => {
            if (!b.date) return false
            return new Date(b.date).getMonth() === i
          }).length
          return { month: monthName, batches: count }
        })

        // 8. Sales trend (TODO: Square POS integration)
        const salesTrend = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          units: 0,
        }))

        // 9. Recent batches (last 7, any year)
        const RUM_TYPES = new Set(['rum', 'cane_spirit'])
        const recentDistillations: RecentDistillation[] = allBatches
          .filter((b) => b.date)
          .slice(0, 7) // already sorted newest-first by the API
          .map((b) => ({
            id: b.batch_code,
            name: b.product_name || b.batch_code,
            date: b.date || '',
            href: RUM_TYPES.has(b.product_type)
              ? `/dashboard/production/rum?batch=${encodeURIComponent(b.batch_code)}`
              : `/dashboard/batches?batch=${encodeURIComponent(b.batch_code)}`,
          }))

        setStats({
          batchesThisYear,
          pureAlcoholLAL: totalLAL,
          avgEfficiency,
          totalUnitsInStock,
          activeRecipes,
          bottlingRunsThisMonth,
          productionTrend,
          salesTrend,
          recentDistillations,
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

