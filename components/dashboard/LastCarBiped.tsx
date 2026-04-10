'use client'

import type { LastProduction } from '@/types'

interface LastCarBipedProps {
  last: LastProduction | null
}

export function LastCarBiped({ last }: LastCarBipedProps) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="section-divider">Último VIN Bipado</div>

      {!last ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>
          Aguardando primeiro registro...
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>
              AO VIVO
            </span>
          </div>

          <div
            className="font-display font-bold tracking-widest break-all"
            style={{ fontSize: '20px', color: 'var(--accent-yellow)' }}
          >
            {last.vin}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { label: 'Funcionário', value: last.employeeName },
              { label: 'Versão', value: last.versao },
              { label: 'Hora', value: last.timestamp },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {item.label}
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
