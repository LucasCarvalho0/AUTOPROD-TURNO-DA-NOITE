'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  const [time, setTime] = useState('')
  const [userName, setUserName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () => setTime(new Date().toLocaleTimeString('pt-BR'))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadUser() {
      const supabase = getSupabaseClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('nome')
          .eq('id', authUser.id)
          .single()
        if (data?.nome) {
          const first = data.nome.split(' ')[0]
          setUserName(first)
        }
      }
    }
    loadUser()
  }, [])

  return (
    <header
      className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
      suppressHydrationWarning
    >
      <div className="flex items-baseline gap-3" suppressHydrationWarning>
        <h1 className="font-display text-xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }} suppressHydrationWarning>
          {title}
        </h1>
        {userName && (
          <span className="text-sm opacity-50" style={{ color: 'var(--text-secondary)' }}>
            Bem-vindo, {userName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4" suppressHydrationWarning>
        <div
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(24,201,125,0.12)',
            border: '1px solid rgba(24,201,125,0.25)',
            color: 'var(--accent-green)',
          }}
        >
          ● TURNO ATIVO
        </div>
        <div className="font-display text-lg font-bold" style={{ color: 'var(--accent-yellow)' }} suppressHydrationWarning>
          {mounted ? time : '--:--:--'}
        </div>
      </div>
    </header>
  )
}
