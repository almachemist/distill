import { buildGinBatchFallback } from "@/modules/production/services/batch-fallback.service"

export const runtime = 'nodejs'

export async function GET() {
  const data = buildGinBatchFallback()
  return Response.json(data)
}
