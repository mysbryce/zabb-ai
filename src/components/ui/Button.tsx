import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zabb-border disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-zabb-fg text-zabb-bg hover:bg-gray-200',
      secondary: 'bg-zabb-muted text-zabb-fg hover:bg-zabb-border',
      outline: 'border border-zabb-border bg-transparent hover:bg-zabb-muted',
      ghost: 'bg-transparent hover:bg-zabb-muted',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
