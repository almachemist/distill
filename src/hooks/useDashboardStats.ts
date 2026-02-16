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

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)

        // Fetch batches from API
        const batchesRes = await fetch('/api/production/batches')
        const batchesData = await batchesRes.json()

        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth() + 1

        // 1. Count batches this year
        const ginBatches = batchesData.gin || []
        const rumBatches = batchesData.rum || []
        const allBatches = [...ginBatches, ...rumBatches]

        const batchesThisYear = allBatches.filter((batch: any) => {
          const batchDate = batch.date || batch.distillation_date || batch.fermentation_date
          if (!batchDate) return false
          const year = new Date(batchDate).getFullYear()
          return year === currentYear
        }).length

        // 2. Calculate total LAL produced this year
        let totalLAL = 0
        allBatches.forEach((batch: any) => {
          const batchDate = batch.date || batch.distillation_date || batch.fermentation_date
          if (!batchDate) return
          const year = new Date(batchDate).getFullYear()
          if (year !== currentYear) return

          // For gin batches: use totalRun.lal or hearts LAL
          if (batch.totalRun?.lal) {
            totalLAL += Number(batch.totalRun.lal)
          } else if (batch.hearts_lal) {
            totalLAL += Number(batch.hearts_lal)
          } else if (batch.output) {
            // Sum LAL from output fractions (hearts only)
            const heartsOutput = batch.output.find((o: any) => o.phase === 'hearts')
            if (heartsOutput?.lal) {
              totalLAL += Number(heartsOutput.lal)
            }
          }
        })

        // 3. Calculate average efficiency
        let totalEfficiency = 0
        let efficiencyCount = 0
        allBatches.forEach((batch: any) => {
          const batchDate = batch.date || batch.distillation_date || batch.fermentation_date
          if (!batchDate) return
          const year = new Date(batchDate).getFullYear()
          if (year !== currentYear) return

          if (batch.heart_yield_percent) {
            totalEfficiency += Number(batch.heart_yield_percent)
            efficiencyCount++
          } else if (batch.totalRun?.lal && batch.chargeAdjustment?.total?.lal) {
            const efficiency = (Number(batch.totalRun.lal) / Number(batch.chargeAdjustment.total.lal)) * 100
            totalEfficiency += efficiency
            efficiencyCount++
          }
        })
        const avgEfficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : 0

        // 4. Total units in stock (TODO: Square POS integration)
        const totalUnitsInStock = 0

        // 5. Active recipes — fetch real count from API
        let activeRecipes = 0
        try {
          const recipesRes = await fetch('/api/recipes')
          if (recipesRes.ok) {
            const recipesData = await recipesRes.json()
            activeRecipes = Array.isArray(recipesData) ? recipesData.length : (recipesData?.recipes?.length ?? 0)
          }
        } catch { /* ignore — show 0 */ }

        // 6. Bottling runs this month (count batches with bottling_status = 'completed' this month)
        const bottlingRunsThisMonth = rumBatches.filter((batch: any) => {
          if (batch.bottling_status !== 'completed') return false
          const fillDate = batch.fill_date
          if (!fillDate) return false
          const date = new Date(fillDate)
          return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth
        }).length

        // 7. Production trend (last 12 months)
        const productionTrend = Array.from({ length: 12 }, (_, i) => {
          const monthIndex = i + 1
          const monthName = new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' })
          
          const batchCount = allBatches.filter((batch: any) => {
            const batchDate = batch.date || batch.distillation_date || batch.fermentation_date
            if (!batchDate) return false
            const date = new Date(batchDate)
            return date.getFullYear() === currentYear && date.getMonth() + 1 === monthIndex
          }).length

          return { month: monthName, batches: batchCount }
        })

        // 8. Sales trend (TODO: Square POS integration)
        const salesTrend = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          units: 0
        }))

        // 9. Recent distillations (last 7, sorted by date)
        const recentDistillations: RecentDistillation[] = allBatches
          .filter((b: any) => b.date || b.distillation_date)
          .sort((a: any, b: any) => {
            const da = new Date(a.date || a.distillation_date).getTime()
            const db = new Date(b.date || b.distillation_date).getTime()
            return db - da
          })
          .slice(0, 7)
          .map((b: any) => {
            const batchId = b.batch_id || b.run_id || b.id
            const isRum = rumBatches.some((r: any) => (r.batch_id || r.id) === batchId)
            return {
              id: batchId,
              name: b.display_name || b.sku || b.recipe || b.product_name || 'Unknown',
              date: b.date || b.distillation_date || '',
              href: isRum
                ? `/dashboard/production/rum?batch=${encodeURIComponent(batchId)}`
                : `/dashboard/batches?batch=${encodeURIComponent(batchId)}`
            }
          })

        setStats({
          batchesThisYear,
          pureAlcoholLAL: totalLAL,
          avgEfficiency,
          totalUnitsInStock,
          activeRecipes,
          bottlingRunsThisMonth,
          productionTrend,
          salesTrend,
          recentDistillations
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

