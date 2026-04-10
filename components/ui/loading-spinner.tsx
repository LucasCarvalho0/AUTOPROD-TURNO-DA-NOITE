'use client'

interface LoadingSpinnerProps {
  size?: number
  color?: string
  label?: string
}

export function LoadingSpinner({
  size = 32,
  color = 'var(--accent-yellow)',
  label = 'Carregando...',
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle
          cx="16"
          cy="16"
          r="13"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        <path
          d="M16 3 A13 13 0 0 1 29 16"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span
          className="font-display text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size={40} label={label} />
    </div>
  )
}
