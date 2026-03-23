import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`flex min-h-[80px] w-full rounded-md border border-zabb-border bg-zabb-bg px-3 py-2 text-sm text-zabb-fg placeholder:text-zabb-muted-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zabb-fg disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
