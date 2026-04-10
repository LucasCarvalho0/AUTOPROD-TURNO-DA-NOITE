export default function HistoricoLoading() {
  return (
    <div className="flex-1 p-5 space-y-4 animate-pulse">
      <div className="rounded-xl h-24" style={{ background: 'var(--bg-tertiary)' }} />
      <div className="rounded-xl h-96" style={{ background: 'var(--bg-tertiary)' }} />
    </div>
  )
}
