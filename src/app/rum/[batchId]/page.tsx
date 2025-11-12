import { notFound } from "next/navigation"
import rumDataset from "../rum_production_data.json"
import type { RumBatch } from "../components/types"
import { RumDetail } from "../components/RumDetail"

const batches = rumDataset as RumBatch[]

export function generateStaticParams() {
  return batches.map((batch) => ({ batchId: batch.batch_id }))
}

interface RumBatchDetailPageProps {
  params: { batchId: string }
}

export default function RumBatchDetailPage({ params }: RumBatchDetailPageProps) {
  const batch = batches.find((item) => item.batch_id === decodeURIComponent(params.batchId))

  if (!batch) {
    notFound()
  }

  return <RumDetail batch={batch} />
}
