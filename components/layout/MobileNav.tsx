'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileNav = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/registrar-montagem', label: 'Registrar', icon: '⊕' },
  { href: '/ranking-turno', label: 'Ranking', icon: '⬗' },
  { href: '/historico', label: 'Histórico', icon: '☰' },
  { href: '/funcionarios', label: 'Equipe', icon: '◉' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {mobileNav.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-all"
            style={{ color: isActive ? 'var(--accent-yellow)' : 'var(--text-tertiary)' }}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
