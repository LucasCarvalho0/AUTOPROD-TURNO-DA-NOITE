'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getEmployeeColor, getEmployeeColorBg, getInitials } from '@/lib/utils'

interface MonthlyEntry {
  employee_nome: string
  total_producao: number
  l3_exclusive: number
  l2_advanced: number
}

export function MonthlyReport() {
  const [data, setData] = useState<MonthlyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = getSupabaseClient()
      const { data: result } = await (supabase as any).rpc('get_monthly_report', {
        p_year: year,
        p_month: month,
      })
      setData((result as unknown as MonthlyEntry[]) ?? [])
      setLoading(false)
    }
    load()
  }, [month, year])

  const total = data.reduce((s, d) => s + Number(d.total_producao), 0)
  const months = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
  ]

  const selectStyle = {
    padding: '6px 10px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
    colorScheme: 'dark' as const,
  }

  return (
    <div
      className="rounded-xl"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="section-divider" style={{ margin: 0, flex: 1 }}>
          Relatório Mensal
        </div>
        <div className="flex gap-2 ml-4">
          <select
            style={selectStyle}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            style={selectStyle}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary strip */}
      <div
        className="grid grid-cols-3 divide-x px-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {[
          { label: 'Total do Mês', value: total, color: 'var(--accent-yellow)' },
          { label: 'L3 Exclusive', value: data.reduce((s, d) => s + Number(d.l3_exclusive), 0), color: 'var(--accent-blue)' },
          { label: 'L2 Advanced', value: data.reduce((s, d) => s + Number(d.l2_advanced), 0), color: 'var(--accent-purple)' },
        ].map((item) => (
          <div key={item.label} className="px-4 py-3 text-center" style={{ borderRight: '1px solid var(--border-subtle)' }}>
            <div className="font-display font-bold text-2xl" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Carregando relatório...
        </div>
      ) : data.length === 0 ? (
        <div className="p-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Nenhuma produção em {months[month - 1]} {year}
        </div>
      ) : (
        <div>
          {data.map((entry, idx) => {
            const pct = total > 0 ? Math.round((entry.total_producao / total) * 100) : 0
            return (
              <div
                key={entry.employee_nome}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: idx < data.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
                  style={{ background: getEmployeeColorBg(idx), color: getEmployeeColor(idx) }}
                >
                  {getInitials(entry.employee_nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {entry.employee_nome}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-1.5 rounded-full overflow-hidden flex-1"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: getEmployeeColor(idx) }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-display font-bold text-xl" style={{ color: 'var(--accent-yellow)' }}>
                    {entry.total_producao}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    L3:{entry.l3_exclusive} · L2:{entry.l2_advanced}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
