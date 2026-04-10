export default function RankingLoading() {
  return (
    <div className="flex-1 p-5 animate-pulse">
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="w-8 h-8 rounded" style={{ background: 'var(--border-medium)' }} />
            <div className="w-10 h-10 rounded-full" style={{ background: 'var(--border-medium)' }} />
            <div className="flex-1 h-4 rounded" style={{ background: 'var(--border-medium)' }} />
            <div className="w-16 h-8 rounded" style={{ background: 'var(--border-medium)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
