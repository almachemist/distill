import { buildRumBatchFallback } from "@/modules/production/services/batch-fallback.service"

export const runtime = 'nodejs'

export async function GET() {
  const data = buildRumBatchFallback()
  return Response.json(data)
}
