'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Topbar } from '@/components/layout/Topbar'
import { DAILY_RESET_HOUR } from '@/utils/cron-reset'

export default function ConfiguracoesPage() {
  const { settings, loading, updateSettings } = useSettings()
  
  const resetTimeStr = `${String(DAILY_RESET_HOUR).padStart(2, '0')}:00`
  const [form, setForm] = useState({
    meta: 120,
    turno_inicio: '15:00',
    turno_fim: '23:48',
    hora_extra: '01:00',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!loading) {
      setForm({
        meta: settings.meta,
        turno_inicio: settings.turno_inicio,
        turno_fim: settings.turno_fim,
        hora_extra: settings.hora_extra,
      })
    }
  }, [loading, settings])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await updateSettings(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '18px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    outline: 'none',
    colorScheme: 'dark' as const,
  }

  const fieldStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '16px',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
  }

  return (
    <>
      <Topbar title="Configurações" />
      <div className="flex-1 overflow-y-auto p-5 pb-20 md:pb-5 max-w-2xl">
        <form onSubmit={handleSave}>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div style={fieldStyle}>
              <label style={labelStyle}>Meta do Turno (carros)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.meta}
                min={1}
                max={500}
                onChange={(e) => setForm((f) => ({ ...f, meta: Number(e.target.value) }))}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Início do Turno</label>
              <input
                type="time"
                style={inputStyle}
                value={form.turno_inicio}
                onChange={(e) => setForm((f) => ({ ...f, turno_inicio: e.target.value }))}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Fim do Turno</label>
              <input
                type="time"
                style={inputStyle}
                value={form.turno_fim}
                onChange={(e) => setForm((f) => ({ ...f, turno_fim: e.target.value }))}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Hora Extra (limite)</label>
              <input
                type="time"
                style={inputStyle}
                value={form.hora_extra}
                onChange={(e) => setForm((f) => ({ ...f, hora_extra: e.target.value }))}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
            </div>
          </div>

          {/* Reset info */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="section-divider mb-4">Reset Automático</div>
            
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              O sistema executa um reset diário automático às <strong style={{ color: 'var(--accent-yellow)' }}>{resetTimeStr}</strong>.
              Isso zera o dashboard e o ranking para o próximo turno, mantendo o histórico completo.
            </p>

            <p className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
              Próximo reset: hoje às {resetTimeStr}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="px-8 py-3 rounded-xl font-display font-bold text-lg tracking-wider transition-all disabled:opacity-50"
            style={{ background: 'var(--accent-yellow)', color: '#000' }}
          >
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </>
  )
}
