const numberFormatter = new Intl.NumberFormat("en-AU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

export function formatMaybeNumber(value: unknown, options?: { suffix?: string; fallback?: string }) {
  const fallback = options?.fallback ?? "—"
  if (value === null || value === undefined || value === "") return fallback
  if (typeof value === "string" && value.trim() === "-") return fallback

  const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value)

  if (Number.isNaN(numeric)) {
    if (typeof value === "string" && value.trim().length > 0) return value
    return fallback
  }

  return `${numberFormatter.format(numeric)}${options?.suffix ?? ""}`
}

export function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}
