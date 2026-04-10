'use client'

import { useState } from 'react'
import type { Settings, SettingsForm as SettingsFormType } from '@/types'

interface SettingsFormProps {
  settings: Settings
  onSubmit: (data: SettingsFormType) => Promise<void>
}

export function SettingsForm({ settings, onSubmit }: SettingsFormProps) {
  const [form, setForm] = useState<SettingsFormType>({
    meta: settings.meta,
    turno_inicio: settings.turno_inicio,
    turno_fim: settings.turno_fim,
    hora_extra: settings.hora_extra,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof SettingsFormType>(key: K, val: SettingsFormType[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const fieldStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '16px',
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

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div style={fieldStyle}>
          <label style={labelStyle}>Meta do Turno (carros)</label>
          <input
            type="number"
            style={inputStyle}
            value={form.meta}
            min={1}
            max={500}
            onChange={(e) => set('meta', Number(e.target.value))}
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
            onChange={(e) => set('turno_inicio', e.target.value)}
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
            onChange={(e) => set('turno_fim', e.target.value)}
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
            onChange={(e) => set('hora_extra', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-8 py-3 rounded-xl font-display font-bold text-lg tracking-wider transition-all disabled:opacity-50"
        style={{ background: 'var(--accent-yellow)', color: '#000' }}
      >
        {loading ? 'Salvando...' : saved ? '✓ Salvo com sucesso!' : 'Salvar Configurações'}
      </button>
    </form>
  )
}
