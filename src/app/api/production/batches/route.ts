import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  buildGinBatchFallback,
  buildRumBatchFallback,
  type GinBatchSummary,
  type RumBatchSummary
} from "@/modules/production/services/batch-fallback.service"

type GinApiRecord = GinBatchSummary
type RumApiRecord = RumBatchSummary

const FALLBACK_RESPONSE = {
  gin: buildGinBatchFallback(),
  rum: buildRumBatchFallback()
}

export async function GET() {
  let gin: GinApiRecord[] = FALLBACK_RESPONSE.gin
  let rum: RumApiRecord[] = FALLBACK_RESPONSE.rum

  try {
    const supabase = await createClient()

    // Fetch both historical batches (distillation_runs) AND draft batches (production_batches)
    const [ginHistoricalResult, ginDraftResult, rumResult] = await Promise.all([
      // Historical gin batches (completed, finalized)
      supabase
        .from("distillation_runs")
        .select("*")
        .order("date", { ascending: false }),
      // Draft gin batches (draft, in_progress)
      supabase
        .from("production_batches")
        .select("*")
        .eq("product_type", "gin")
        .order("date", { ascending: false }),
      // Rum batches
      supabase
        .from("rum_production_runs")
        .select("*")
        .order("distillation_date", { ascending: false })
    ])

    // Combine historical and draft gin batches
    const historicalGin = (!ginHistoricalResult.error && Array.isArray(ginHistoricalResult.data))
      ? ginHistoricalResult.data.map((batch: any) => ({
          run_id: batch.batch_id,
          recipe: batch.display_name,
          date: batch.date,
          still_used: batch.still_used,
          updated_at: batch.updated_at,
          status: 'completed', // Historical batches are completed
          // Include all other fields from the database
          ...batch
        }))
      : []

    const draftGin = (!ginDraftResult.error && Array.isArray(ginDraftResult.data))
      ? ginDraftResult.data.map((batch: any) => ({
          run_id: batch.spirit_run_id || batch.id,
          recipe: batch.sku,
          date: batch.date,
          still_used: batch.still_used,
          updated_at: batch.updated_at,
          status: batch.status || 'draft',
          // Include all other fields from the database
          ...batch
        }))
      : []

    // Merge and sort by date
    if (historicalGin.length > 0 || draftGin.length > 0) {
      gin = [...historicalGin, ...draftGin].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      }) as GinApiRecord[]
    } else if (ginHistoricalResult.error) {
      console.warn("⚠️ Falling back to static gin dataset:", ginHistoricalResult.error.message)
    }

    if (!rumResult.error && Array.isArray(rumResult.data) && rumResult.data.length > 0) {
      rum = rumResult.data as RumApiRecord[]
    } else if (rumResult.error) {
      console.warn("⚠️ Falling back to static rum dataset:", rumResult.error.message)
    }
  } catch (error) {
    console.warn("⚠️ Using static production dataset due to Supabase error:", error)
  }

  return NextResponse.json({ gin, rum })
}
