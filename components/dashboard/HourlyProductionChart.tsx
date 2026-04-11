'use client'

import type { HourlyProduction } from '@/types'

interface HourlyProductionChartProps {
  data: HourlyProduction[]
}

export function HourlyProductionChart({ data }: HourlyProductionChartProps) {
  const max = Math.max(...data.map((d) => Math.max(d.quantidade, d.objetivo)), 15) // Mínimo 15 para escala fixa

  return (
    <div
      className="rounded-xl p-6 relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(180deg, var(--bg-tertiary) 0%, rgba(20,20,20,1) 100%)', 
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="font-display font-black text-xs tracking-[0.2em] text-blue-400 opacity-80 mb-1">
            MONITORAMENTO INDÚSTRIA
          </span>
          <h3 className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Produção Hora a Hora
          </h3>
        </div>
        <div className="flex items-center gap-6 p-2 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shadow-[0_0_8px_rgba(14,165,233,0.5)]" style={{ background: '#0ea5e9' }} />
            <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>OBJETIVO</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shadow-[0_0_8px_rgba(163,230,53,0.5)]" style={{ background: '#a3e635' }} />
            <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>REALIZADO</span>
          </div>
        </div>
      </div>

      <div className="relative h-64 mt-4 flex items-end">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full border-t border-white/40 border-dashed" />
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative w-full h-full flex items-end gap-1 px-2 z-10">
          {data.map((item) => {
            const objH = Math.round((item.objetivo / max) * 100)
            const realH = Math.round((item.quantidade / max) * 100)
            
            return (
              <div key={item.hora} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-[2px] h-full relative group-hover:scale-y-[1.02] transition-transform">
                  
                  {/* Objetivo Bar (Blue) */}
                  <div className="relative flex flex-col items-center group/bar_obj h-full justify-end">
                    {item.objetivo > 0 && (
                      <span className="absolute -top-6 text-[10px] font-black text-blue-400">
                        {item.objetivo}
                      </span>
                    )}
                    <div
                      className="w-2.5 sm:w-3.5 rounded-t-sm transition-all duration-700 delay-100 shadow-[2px_0_5px_rgba(0,0,0,0.3)]"
                      style={{
                        height: `${objH}%`,
                        background: 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>

                  {/* Realizado Bar (Lime) */}
                  <div className="relative flex flex-col items-center group/bar_real h-full justify-end">
                    <span className={`absolute -top-6 text-[10px] font-black ${item.quantidade >= item.objetivo && item.objetivo > 0 ? 'text-[#bef264]' : 'text-gray-400'}`}>
                      {item.quantidade}
                    </span>
                    <div
                      className="w-2.5 sm:w-3.5 rounded-t-sm transition-all duration-700 shadow-[2px_0_5px_rgba(0,0,0,0.3)]"
                      style={{
                        height: `${realH}%`,
                        background: item.quantidade >= item.objetivo && item.objetivo > 0 
                          ? 'linear-gradient(180deg, #a3e635 0%, #4d7c0f 100%)' 
                          : 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: item.isCurrent ? '0 0 15px rgba(163,230,53,0.2)' : 'none'
                      }}
                    />
                  </div>
                </div>
                
                {/* Hour Label - Split into two lines for "AS" */}
                <div className="mt-4 w-full h-10 flex flex-col items-center justify-start">
                  <div 
                    className="text-[8px] font-black tracking-tighter leading-tight whitespace-pre-wrap text-center uppercase" 
                    style={{ color: item.isCurrent ? 'var(--accent-yellow)' : 'var(--text-tertiary)' }}
                  >
                    {item.hora.replace(' AS ', '\nAS\n')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
