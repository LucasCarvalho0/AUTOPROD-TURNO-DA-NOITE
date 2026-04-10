'use client'

import type { HourlyProduction } from '@/types'

interface HourlyProductionChartProps {
  data: HourlyProduction[]
}

export function HourlyProductionChart({ data }: HourlyProductionChartProps) {
  const max = Math.max(...data.map((d) => Math.max(d.quantidade, d.objetivo)), 1)

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-display font-bold text-sm tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          PRODUÇÃO POR HORA
        </div>
        <div className="flex items-center gap-4 text-[10px] font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#2d8cf0' }} />
            <span style={{ color: 'var(--text-secondary)' }}>OBJETIVO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--accent-yellow)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>REALIZADO</span>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-2 h-32 mt-6">
        {data.map((item) => {
          const objH = Math.max(3, Math.round((item.objetivo / max) * 100))
          const realH = Math.max(3, Math.round((item.quantidade / max) * 100))
          
          return (
            <div key={item.hora} className="flex-1 flex flex-col items-center group">
              <div className="w-full flex items-end justify-center gap-0.5 h-full relative">
                {/* Labels above bars */}
                <div className="absolute -top-5 left-0 right-0 flex justify-center gap-2 text-[8px] font-bold">
                  <span style={{ color: '#2d8cf0' }}>{item.objetivo}</span>
                  <span style={{ color: item.quantidade >= item.objetivo && item.objetivo > 0 ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                    {item.quantidade}
                  </span>
                </div>

                {/* Objetivo Bar */}
                <div
                  className="w-1.5 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${objH}%`,
                    background: '#2d8cf0',
                    opacity: 0.8
                  }}
                />
                {/* Realizado Bar */}
                <div
                  className="w-1.5 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${realH}%`,
                    background: item.isCurrent ? 'var(--accent-yellow)' : 'rgba(245,184,0,0.4)',
                    boxShadow: item.isCurrent ? '0 0 10px rgba(245,184,0,0.3)' : 'none',
                  }}
                />
              </div>
              
              {/* Hour Label */}
              <div className="mt-3 w-full text-center">
                <div 
                  className="text-[7px] leading-tight font-medium" 
                  style={{ color: item.isCurrent ? 'var(--accent-yellow)' : 'var(--text-tertiary)' }}
                >
                  {item.hora.split(' - ')[0]}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
