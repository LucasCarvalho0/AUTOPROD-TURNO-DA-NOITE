import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="text-center">
        <div
          className="font-display font-bold mb-2"
          style={{ fontSize: '96px', color: 'var(--accent-yellow)', lineHeight: 1 }}
        >
          404
        </div>
        <h2
          className="font-display font-bold text-2xl mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Página não encontrada
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl font-display font-bold text-base tracking-wider inline-block"
          style={{ background: 'var(--accent-yellow)', color: '#000' }}
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
