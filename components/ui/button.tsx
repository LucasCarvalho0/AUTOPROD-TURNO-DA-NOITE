import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-accent-yellow text-black hover:bg-accent-dark font-bold',
        destructive: 'bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20',
        outline: 'border border-border-medium bg-transparent text-text-secondary hover:text-text-primary',
        secondary: 'bg-bg-tertiary border border-border-subtle text-text-secondary hover:text-text-primary',
        ghost: 'hover:bg-white/5 text-text-secondary hover:text-text-primary',
        success: 'bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500/20',
        info: 'bg-blue-500/10 border border-blue-500/25 text-blue-400 hover:bg-blue-500/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
        xl: 'h-14 px-8 text-lg font-bold tracking-wider',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
