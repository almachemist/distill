import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        className={cn(
          "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label }
