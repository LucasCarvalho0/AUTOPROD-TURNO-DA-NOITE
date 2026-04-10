export default function RegistrarLoading() {
  return (
    <div className="flex-1 p-5 space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-tertiary)', height: i === 3 ? '160px' : '120px' }}
        />
      ))}
    </div>
  )
}
