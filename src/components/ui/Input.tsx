import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-zabb-border bg-zabb-bg px-3 py-2 text-sm text-zabb-fg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zabb-muted-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zabb-fg disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
