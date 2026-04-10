'use client'

import { useState } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { Topbar } from '@/components/layout/Topbar'
import { DataTable, type Column } from '@/components/common/DataTable'
import type { Employee } from '@/types'

export default function FuncionariosPage() {
  const { employees, loading, createEmployee, toggleEmployee, deleteEmployee } = useEmployees()
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    await createEmployee({ nome: newName.trim(), ativo: true })
    setNewName('')
    setShowForm(false)
    setAdding(false)
  }

  async function handleToggle(emp: Employee) {
    setActionLoading(emp.id)
    await toggleEmployee(emp.id, emp.ativo)
    setActionLoading(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return
    setActionLoading(id)
    await deleteEmployee(id)
    setActionLoading(null)
  }

  const columns: Column<Employee>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '48px',
      render: (row, i) => (
        <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{i + 1}</span>
      ),
    },
    {
      key: 'nome',
      label: 'Nome',
      render: (row) =>
        editId === row.id ? (
          <input
            value={editName}
            autoFocus
            onChange={(e) => setEditName(e.target.value)}
            className="px-2 py-1 rounded text-sm outline-none"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-yellow)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <span className="font-medium">{row.nome}</span>
        ),
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (row) => (
        <span className={row.ativo ? 'badge-active' : 'badge-inactive'}>
          {row.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleToggle(row)}
            disabled={actionLoading === row.id}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
            }}
          >
            {row.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            disabled={actionLoading === row.id}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{
              background: 'transparent',
              border: '1px solid rgba(232,72,85,0.3)',
              color: 'var(--accent-red)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(232,72,85,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Topbar title="Funcionários" />
      <div className="flex-1 overflow-y-auto p-5 pb-20 md:pb-5">

        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div>
              <div className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                Funcionários Cadastrados
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {employees.filter((e) => e.ativo).length} ativos · {employees.length} total
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{ background: 'var(--accent-yellow)', color: '#000' }}
            >
              + Novo Funcionário
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="flex gap-3 items-center px-5 py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(245,184,0,0.04)' }}
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do funcionário..."
                autoFocus
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
              />
              <button
                type="submit"
                disabled={adding || !newName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
                style={{ background: 'var(--accent-yellow)', color: '#000' }}
              >
                {adding ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-medium)' }}
              >
                Cancelar
              </button>
            </form>
          )}

          {/* Table */}
          {loading ? (
            <div className="p-10 text-center" style={{ color: 'var(--text-secondary)' }}>
              Carregando...
            </div>
          ) : (
            <DataTable
              data={employees}
              columns={columns}
              keyExtractor={(row) => row.id}
              emptyMessage="Nenhum funcionário cadastrado"
            />
          )}
        </div>
      </div>
    </>
  )
}
