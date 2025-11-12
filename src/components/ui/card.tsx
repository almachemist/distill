import React from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className = "", ...props }: DivProps) {
  return <div className={`rounded-2xl border bg-white ${className}`} {...props} />
}

export function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={`px-4 pt-4 ${className}`} {...props} />
}

export function CardTitle({ className = "", ...props }: DivProps) {
  return <div className={`text-lg font-semibold text-onyx ${className}`} {...props} />
}

export function CardContent({ className = "", ...props }: DivProps) {
  return <div className={`px-4 pb-4 ${className}`} {...props} />
}
