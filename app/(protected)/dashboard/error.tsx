'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Erro ao carregar dashboard
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: 'var(--accent-yellow)', color: '#000' }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
