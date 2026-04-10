'use client'

import type { HourlyProduction } from '@/types'

interface HourlyProductionChartProps {
  data: HourlyProduction[]
}

export function HourlyProductionChart({ data }: HourlyProductionChartProps) {
  const max = Math.max(...data.map((d) => d.quantidade), 1)

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="section-divider">Produção por Hora</div>

      <div className="flex items-end gap-1.5 h-24 mt-2">
        {data.map((item) => {
          const heightPct = Math.max(2, Math.round((item.quantidade / max) * 100))
          return (
            <div key={item.hora} className="flex-1 flex flex-col items-center gap-1">
              {item.quantidade > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>
                  {item.quantidade}
                </span>
              )}
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  minHeight: '2px',
                  background: item.isCurrent
                    ? 'var(--accent-yellow)'
                    : 'rgba(245,184,0,0.35)',
                  boxShadow: item.isCurrent ? '0 0 8px rgba(245,184,0,0.4)' : 'none',
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-1.5 mt-1">
        {data.map((item) => (
          <div
            key={item.hora}
            className="flex-1 text-center"
            style={{
              fontSize: '9px',
              color: item.isCurrent ? 'var(--accent-yellow)' : 'var(--text-tertiary)',
            }}
          >
            {item.hora}
          </div>
        ))}
      </div>
    </div>
  )
}
