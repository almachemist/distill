import { redirect } from "next/navigation"

export default function ProductionBatchesRedirect() {
  redirect("/dashboard/batches")
}
