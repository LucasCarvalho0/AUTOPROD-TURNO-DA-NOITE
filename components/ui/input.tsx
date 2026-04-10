import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg px-3 py-2 text-sm outline-none transition-all',
            'placeholder:text-[var(--text-tertiary)]',
            error && 'border-red-500/50',
            className
          )}
          style={{
            background: 'var(--bg-tertiary)',
            border: `1px solid ${error ? 'rgba(232,72,85,0.5)' : 'var(--border-medium)'}`,
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'rgba(232,72,85,0.8)' : 'var(--accent-yellow)'
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'rgba(232,72,85,0.5)' : 'var(--border-medium)'
            props.onBlur?.(e)
          }}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs" style={{ color: 'var(--accent-red)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
