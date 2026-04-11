'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseClient()
    const email = `${matricula}@autoprod.internal`

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      console.error('Supabase Auth Error:', { message: error.message, status: error.status, name: error.name })
      setError(`${error.message} (status: ${error.status})`)
      setLoading(false)
      return
    }

    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }} suppressHydrationWarning>
      <div
        className="w-[360px] rounded-2xl p-9"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
        }}
        suppressHydrationWarning
      >
        {/* Logo */}
        <div className="text-center mb-8" suppressHydrationWarning>
          <h1
            className="font-display text-4xl font-bold tracking-widest"
            style={{ color: 'var(--accent-yellow)' }}
          >
            AUTOPROD
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Sistema de Produção Automotiva
          </p>
          <div
            className="inline-block mt-3 px-4 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(24,201,125,0.12)',
              border: '1px solid rgba(24,201,125,0.25)',
              color: 'var(--accent-green)',
            }}
            suppressHydrationWarning
          >
            ● TURNO NOITE ATIVO
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Matrícula
            </label>
            <input
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="Ex: 000123"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--accent-red)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-display font-bold text-lg tracking-widest transition-all disabled:opacity-60"
            style={{ background: 'var(--accent-yellow)', color: '#000' }}
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-tertiary)' }}>
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  )
}
