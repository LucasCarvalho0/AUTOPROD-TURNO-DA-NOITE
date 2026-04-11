'use client'

import type { HourlyProduction } from '@/types'

interface HourlyProductionChartProps {
  data: HourlyProduction[]
}

export function HourlyProductionChart({ data }: HourlyProductionChartProps) {
  const max = Math.max(...data.map((d) => Math.max(d.quantidade, d.objetivo)), 15) // Mínimo 15 para escala fixa

  return (
    <div
      className="rounded-xl p-4 sm:p-6 relative overflow-hidden flex flex-col h-[420px]"
      style={{ 
        background: 'linear-gradient(180deg, var(--bg-tertiary) 0%, rgba(20,20,20,1) 100%)', 
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex flex-col">
          <span className="font-display font-black text-[9px] tracking-[0.2em] text-blue-400 opacity-80 mb-1">
            MONITORAMENTO INDÚSTRIA
          </span>
          <h3 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Produção Hora a Hora
          </h3>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 p-1.5 sm:p-2 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shadow-[0_0_8px_rgba(14,165,233,0.5)]" style={{ background: '#0ea5e9' }} />
            <span className="text-[9px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>OBJETIVO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shadow-[0_0_8px_rgba(163,230,53,0.5)]" style={{ background: '#a3e635' }} />
            <span className="text-[9px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>REALIZADO</span>
          </div>
        </div>
      </div>

      {/* Scrollable Chart Area */}
      <div className="relative flex-1 mt-2 flex flex-col overflow-hidden">
        {/* Background Grid Lines (Fixed) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 py-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-white/20 border-dashed" />
          ))}
        </div>

        {/* Bars Container (Scrollable) */}
        <div className="flex-1 overflow-x-auto pb-4 pt-8 scrollbar-hide">
          <div className="flex items-end gap-1.5 sm:gap-2 px-2 h-full min-w-max">
            {data.map((item) => {
              const objH = Math.round((item.objetivo / max) * 100)
              const realH = Math.round((item.quantidade / max) * 100)
              
              return (
                <div 
                  key={item.hora} 
                  className="w-10 sm:w-14 flex flex-col items-center h-full justify-end group transition-all"
                >
                  <div className="w-full flex items-end justify-center gap-[2px] sm:gap-[4px] h-48 relative">
                    
                    {/* Objetivo Bar (Blue) */}
                    <div className="relative flex flex-col items-center h-full justify-end w-[42%]">
                      <span 
                        className="absolute z-20 text-[9px] sm:text-[11px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                        style={{ bottom: `${objH}%`, marginBottom: '4px' }}
                      >
                        {item.objetivo > 0 ? item.objetivo : ''}
                      </span>
                      <div
                        className="w-full rounded-t-sm shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-700"
                        style={{
                          height: `${objH}%`,
                          background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 50%, #0284c7 100%)', // Gradiente 3D
                          borderLeft: '1px solid rgba(255,255,255,0.1)',
                          borderRight: '1px solid rgba(0,0,0,0.2)'
                        }}
                      />
                    </div>

                    {/* Realizado Bar (Green) */}
                    <div className="relative flex flex-col items-center h-full justify-end w-[42%]">
                      <span 
                        className="absolute z-20 font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] text-[9px] sm:text-[11px]"
                        style={{ 
                          bottom: `${realH}%`,
                          marginBottom: '4px' 
                        }}
                      >
                        {item.quantidade > 0 ? item.quantidade : ''}
                      </span>
                      <div
                        className="w-full rounded-t-sm shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-700"
                        style={{
                          height: `${realH}%`,
                          background: 'linear-gradient(90deg, #65a30d 0%, #a3e635 50%, #65a30d 100%)', // Gradiente 3D
                          borderLeft: '1px solid rgba(255,255,255,0.1)',
                          borderRight: '1px solid rgba(0,0,0,0.2)',
                          boxShadow: item.isCurrent ? '0 0 15px rgba(163,230,53,0.3)' : 'none'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Hour Label */}
                  <div className="mt-4 w-full flex flex-col items-center justify-start flex-shrink-0">
                    <div 
                      className="text-[8px] sm:text-[10px] font-black leading-tight text-center whitespace-nowrap px-1 py-1 rounded" 
                      style={{ 
                        color: item.isCurrent ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                        background: item.isCurrent ? 'rgba(245,184,0,0.1)' : 'transparent',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {item.hora.split(' AS ').map((part, i) => (
                        <div key={i} className={i === 1 ? 'mt-0.5 opacity-60 text-[7px] sm:text-[9px]' : ''}>
                          {i === 1 ? `AS ${part}` : part}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
