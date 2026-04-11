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
  const [success, setSuccess] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = getSupabaseClient()
    const email = `${matricula}@autoprod.internal`

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      console.error('Supabase Auth Error:', { message: error.message, status: error.status, name: error.name })
      setError('Matrícula ou senha incorreta.')
      setLoading(false)
      return
    }

    // Feedback visual imediato de sucesso
    setSuccess(true)
    setLoading(false)

    // Navegar sem delay extra
    router.replace('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
      suppressHydrationWarning
    >
      {/* Overlay de transição quando sucesso */}
      {success && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-primary)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(24,201,125,0.15)',
              border: '2px solid rgba(24,201,125,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#18C97D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em' }}>
            ACESSO LIBERADO
          </span>
        </div>
      )}

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
              autoComplete="username"
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
              autoComplete="current-password"
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
            <p
              className="text-sm text-center py-2 px-3 rounded-lg"
              style={{
                color: 'var(--accent-red)',
                background: 'rgba(255,80,80,0.08)',
                border: '1px solid rgba(255,80,80,0.2)',
              }}
            >
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 rounded-xl font-display font-bold text-lg tracking-widest transition-all"
            style={{
              background: success ? 'var(--accent-green)' : 'var(--accent-yellow)',
              color: '#000',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
              transform: 'translateY(0)',
              transition: 'background 0.3s ease, opacity 0.2s ease',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                VERIFICANDO...
              </span>
            ) : success ? (
              '✓ ACESSO LIBERADO'
            ) : (
              'ENTRAR'
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-tertiary)' }}>
          Acesso restrito a usuários autorizados
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
