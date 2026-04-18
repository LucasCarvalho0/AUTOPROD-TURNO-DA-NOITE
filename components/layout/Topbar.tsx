'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  const [time, setTime] = useState('')
  const [userName, setUserName] = useState('')
  const [userCargo, setUserCargo] = useState('')
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
          .select('nome, cargo')
          .eq('id', authUser.id)
          .single()
        
        if (data) {
          const userData = data as { nome: string; cargo: string | null }
          // Pega os dois primeiros nomes
          const names = userData.nome.split(' ')
          const display = names.length > 1 ? `${names[0]} ${names[1]}` : names[0]
          setUserName(display)
          setUserCargo(userData.cargo || '')
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
        {mounted && userName && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }} suppressHydrationWarning>
            <span className="opacity-50">Bem-vindo,</span>
            <span className="font-bold text-white/90">{userName}</span>
            {userCargo && (
              <>
                <span className="opacity-30">—</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-white/50">
                  {userCargo}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4" suppressHydrationWarning>
        {mounted ? (
          <div
            className="px-3 py-1 rounded-full text-xs font-medium animate-pulse"
            style={{
              background: 'rgba(24,201,125,0.12)',
              border: '1px solid rgba(24,201,125,0.25)',
              color: 'var(--accent-green)',
            }}
            suppressHydrationWarning
          >
            ● TURNO ATIVO
          </div>
        ) : (
          <div className="px-3 py-1 opacity-0" suppressHydrationWarning>●</div>
        )}
        <div className="font-display text-lg font-bold min-w-[100px] text-right" style={{ color: 'var(--accent-yellow)' }} suppressHydrationWarning>
          {mounted ? time : '--:--:--'}
        </div>
      </div>
    </header>
  )
}
