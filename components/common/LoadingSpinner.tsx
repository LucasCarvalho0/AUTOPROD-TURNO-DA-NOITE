interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = { sm: 16, md: 28, lg: 44 }
  const px = sizes[size]

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className="rounded-full border-2 border-t-transparent animate-spin"
        style={{
          width: px,
          height: px,
          borderColor: `var(--accent-yellow) transparent var(--accent-yellow) var(--accent-yellow)`,
        }}
      />
      {message && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      )}
    </div>
  )
}

export function PageLoader({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-40">
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}
