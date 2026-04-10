'use client'

import { useState } from 'react'
import type { EmployeeForm as EmployeeFormType } from '@/types'

interface EmployeeFormProps {
  initial?: Partial<EmployeeFormType>
  onSubmit: (data: EmployeeFormType) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function EmployeeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
}: EmployeeFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [ativo, setAtivo] = useState(initial?.ativo ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      setError('Nome é obrigatório')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({ nome: nome.trim(), ativo })
    } catch (err) {
      setError('Erro ao salvar funcionário')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-medium)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Nome completo
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Carlos Souza"
          autoFocus
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAtivo(!ativo)}
          className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
          style={{
            background: ativo ? 'var(--accent-green)' : 'var(--text-tertiary)',
          }}
        >
          <span
            className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
            style={{ left: ativo ? '20px' : '2px' }}
          />
        </button>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {ativo ? 'Funcionário ativo' : 'Funcionário inativo'}
        </span>
      </div>

      {error && (
        <p className="text-xs" style={{ color: 'var(--accent-red)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
          style={{ background: 'var(--accent-yellow)', color: '#000' }}
        >
          {loading ? 'Salvando...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-secondary)',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
