export default function DashboardLoading() {
  return (
    <div className="flex-1 p-5 space-y-4 animate-pulse">
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 h-24"
            style={{ background: 'var(--bg-tertiary)' }}
          />
        ))}
      </div>
      {/* Progress skeleton */}
      <div
        className="rounded-xl h-20"
        style={{ background: 'var(--bg-tertiary)' }}
      />
      {/* Chart row skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="col-span-2 rounded-xl h-40"
          style={{ background: 'var(--bg-tertiary)' }}
        />
        <div
          className="rounded-xl h-40"
          style={{ background: 'var(--bg-tertiary)' }}
        />
      </div>
    </div>
  )
}
