'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/registrar-montagem', label: 'Registrar Montagem', icon: '⊕' },
  { href: '/ranking-turno', label: 'Ranking do Turno', icon: '⬗' },
  { href: '/historico', label: 'Histórico', icon: '☰' },
  { href: '/funcionarios', label: 'Funcionários', icon: '◉' },
  { href: '/configuracoes', label: 'Configurações', icon: '◎' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ nome: string; tipo: string; cargo?: string } | null>(null)
  const [mounted, setMounted] = useState(false)
 
  useEffect(() => {
    setMounted(true)
    async function loadUser() {
      const supabase = getSupabaseClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('nome, tipo, cargo')
          .eq('id', authUser.id)
          .single()
        if (data) setUser(data)
      }
    }
    loadUser()
  }, [])
 
  async function handleLogout() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
 
  const initials = mounted && user?.nome 
    ? user.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : '..'
 
  const cargo = mounted && (user?.cargo || (user?.tipo === 'admin' ? 'Administrativo' : 'Operador'))
 
  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
      }}
      suppressHydrationWarning
    >
      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }} suppressHydrationWarning>
        <div className="font-display text-xl font-bold tracking-widest" style={{ color: 'var(--accent-yellow)' }} suppressHydrationWarning>
          AUTOPROD
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)', letterSpacing: '0.05em' }} suppressHydrationWarning>
          TURNO DA NOITE
        </div>
      </div>
 
      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5" suppressHydrationWarning>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: isActive ? 'rgba(245,184,0,0.12)' : 'transparent',
                color: isActive ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
              }}
              suppressHydrationWarning
            >
              <span className="w-5 text-center text-base" suppressHydrationWarning>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
 
      {/* Footer */}
      <div className="p-2" style={{ borderTop: '1px solid var(--border-subtle)' }} suppressHydrationWarning>
        <div className="flex items-center gap-3 px-3 py-2 mb-2" suppressHydrationWarning>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent-yellow), var(--accent-blue))', color: '#000' }}
            suppressHydrationWarning
          >
            {initials}
          </div>
          <div className="overflow-hidden" suppressHydrationWarning>
            <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }} suppressHydrationWarning>
              {mounted && user?.nome ? user.nome : (mounted ? 'Carregando...' : '')}
            </div>
            {mounted && (
              <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }} suppressHydrationWarning>
                {cargo}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'rgba(232,72,85,0.1)',
            border: '1px solid rgba(232,72,85,0.2)',
            color: 'var(--accent-red)',
          }}
        >
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}
