import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent-yellow/15 text-accent-yellow',
        active: 'bg-green-500/12 border border-green-500/25 text-green-400',
        inactive: 'bg-white/5 border border-white/10 text-text-tertiary',
        l3: 'bg-blue-500/15 text-blue-400',
        l2: 'bg-purple-500/15 text-purple-400',
        error: 'bg-red-500/15 text-red-400',
        warning: 'bg-amber-500/15 text-amber-400',
        info: 'bg-blue-500/15 text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
