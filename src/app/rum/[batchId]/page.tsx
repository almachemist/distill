import { notFound } from "next/navigation"
import rumDataset from "../rum_production_data.json"
import type { RumBatch } from "../components/types"
import { RumDetail } from "../components/RumDetail"

const batches = rumDataset as any as RumBatch[]

export function generateStaticParams() {
  return batches.map((batch) => ({ batchId: batch.batch_id }))
}

interface RumBatchDetailPageProps {
  params: Promise<{ batchId: string }>
}

export default async function RumBatchDetailPage({ params }: RumBatchDetailPageProps) {
  const { batchId } = await params
  const batch = batches.find((item) => item.batch_id === decodeURIComponent(batchId))

  if (!batch) {
    notFound()
  }

  return <RumDetail batch={batch} />
}
