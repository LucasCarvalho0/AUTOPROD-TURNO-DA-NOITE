export default function FuncionariosLoading() {
  return (
    <div className="flex-1 p-5 animate-pulse">
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="h-6 w-48 rounded" style={{ background: 'var(--border-medium)' }} />
          <div className="h-8 w-36 rounded-lg" style={{ background: 'var(--border-medium)' }} />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="h-4 w-8 rounded" style={{ background: 'var(--border-medium)' }} />
            <div className="h-4 flex-1 rounded" style={{ background: 'var(--border-medium)' }} />
            <div className="h-5 w-16 rounded-full" style={{ background: 'var(--border-medium)' }} />
            <div className="h-4 w-10 rounded" style={{ background: 'var(--border-medium)' }} />
            <div className="h-7 w-28 rounded-lg" style={{ background: 'var(--border-medium)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
