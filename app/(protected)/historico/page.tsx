'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useEmployees } from '@/hooks/useEmployees'
import { useSettings } from '@/hooks/useSettings'
import { Topbar } from '@/components/layout/Topbar'
import { DataTable, type Column } from '@/components/common/DataTable'
import { ExportButtons } from '@/components/common/ExportButtons'
import { formatDateTime } from '@/lib/utils'
import type { Production } from '@/types'

export default function HistoricoPage() {
  const { employees } = useEmployees()
  const { settings } = useSettings()
  const [productions, setProductions] = useState<Production[]>([])
  const [loading, setLoading] = useState(true)
  const [filterVin, setFilterVin] = useState('')
  const [filterEmpId, setFilterEmpId] = useState('')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd, setFilterDateEnd] = useState('')

  const fetchProductions = useCallback(async () => {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('productions')
      .select('*, employee:employees(id, nome, ativo)')
      .order('timestamp', { ascending: false })

    if (filterVin) query = query.ilike('vin', `%${filterVin}%`)
    if (filterEmpId) query = query.eq('employee_id', filterEmpId)
    
    // Garante fuso horário BRT (-03:00) na consulta para não pegar horas do dia anterior/seguinte em UTC
    if (filterDateStart) query = query.gte('timestamp', filterDateStart + 'T00:00:00-03:00')
    if (filterDateEnd) query = query.lte('timestamp', filterDateEnd + 'T23:59:59-03:00')

    // Limite padrão de 500 para visualização inicial rápida, 
    // mas estendido para 10.000 ao usar filtros (para garantir que a exportação venha completa)
    if (!filterVin && !filterEmpId && !filterDateStart && !filterDateEnd) {
      query = query.limit(500)
    } else {
      query = query.limit(10000)
    }

    const { data } = await query
    setProductions((data ?? []) as Production[])
    setLoading(false)
  }, [filterVin, filterEmpId, filterDateStart, filterDateEnd])

  useEffect(() => {
    const timer = setTimeout(fetchProductions, 300)
    return () => clearTimeout(timer)
  }, [fetchProductions])

  const columns: Column<Production>[] = [
    {
      key: 'num',
      label: '#',
      width: '48px',
      render: (_, i) => (
        <span style={{ color: 'var(--text-tertiary)' }}>{i + 1}</span>
      ),
    },
    {
      key: 'vin',
      label: 'VIN',
      render: (row) => (
        <span className="font-display font-bold tracking-wider" style={{ color: 'var(--accent-yellow)', fontSize: '13px' }}>
          {row.vin}
        </span>
      ),
    },
    {
      key: 'employee',
      label: 'Funcionário',
      render: (row) => row.employee?.nome ?? '—',
    },
    {
      key: 'versao',
      label: 'Versão',
      render: (row) => (
        <span className={row.versao === 'L3 Exclusive' ? 'badge-l3' : 'badge-l2'}>
          {row.versao}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Data/Hora',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          {formatDateTime(row.timestamp)}
        </span>
      ),
    },
  ]

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-medium)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
  }

  return (
    <>
      <Topbar title="Histórico" />
      <div className="flex-1 overflow-y-auto p-5 pb-20 md:pb-5">

        {/* Filters */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="section-divider">Filtros</div>
          <div className="flex flex-wrap gap-3">
            <input
              style={inputStyle}
              placeholder="Buscar por VIN..."
              value={filterVin}
              onChange={(e) => setFilterVin(e.target.value.toUpperCase())}
            />
            <select
              style={{ ...inputStyle, minWidth: '160px' }}
              value={filterEmpId}
              onChange={(e) => setFilterEmpId(e.target.value)}
            >
              <option value="">Todos os funcionários</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
            <input
              type="date"
              style={{ ...inputStyle, colorScheme: 'dark' }}
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
            />
            <input
              type="date"
              style={{ ...inputStyle, colorScheme: 'dark' }}
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
            />
            <button
              onClick={() => {
                setFilterVin('')
                setFilterEmpId('')
                setFilterDateStart('')
                setFilterDateEnd('')
              }}
              className="px-4 py-2 rounded-lg text-sm transition-all"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
              }}
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {productions.length} registros encontrados
            </span>
            <ExportButtons productions={productions} meta={settings.meta} />
          </div>

          {loading ? (
            <div className="p-10 text-center" style={{ color: 'var(--text-secondary)' }}>
              Carregando...
            </div>
          ) : (
            <DataTable
              data={productions}
              columns={columns}
              keyExtractor={(row) => row.id}
              emptyMessage="Nenhum registro encontrado com os filtros aplicados"
            />
          )}
        </div>
      </div>
    </>
  )
}
