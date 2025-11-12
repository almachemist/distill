import React from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Badge({ className = "", ...props }: DivProps) {
  return <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${className}`} {...props} />
}
