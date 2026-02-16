export interface ProductionRun {
  product: string
  batch_number: number
  total_batches: number
  production_type: string
  scheduled_month: number
  scheduled_month_name: string
  receiving_tank?: string
}

export interface WeekPlan {
  week_number: number
  week_start: string
  week_end: string
  month: number
  month_name: string
  mode: 'GIN' | 'RUM' | 'VODKA' | 'CANE_SPIRIT' | 'LIQUEUR' | 'BOTTLING' | 'ADMIN' | 'RESERVE_RUM_BLEND' | 'RESERVE_RUM_BOTTLE'
  production_runs: ProductionRun[]
  bottling: boolean
  bottling_tasks?: string[]
  notes: string[]
  tank_allocations: string[]
}

export interface CalendarData {
  generated_at: string
  source: string
  methodology: string
  calendar: WeekPlan[]
}
