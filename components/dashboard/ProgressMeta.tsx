'use client'

import { calcProgress } from '@/lib/utils'

interface ProgressMetaProps {
  total: number
  meta: number
}

export function ProgressMeta({ total, meta }: ProgressMetaProps) {
  const pct = calcProgress(total, meta)

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="section-divider">Progresso da Meta</div>

      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 relative">
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full relative transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--accent-yellow), #ffdd00)',
              }}
            >
              <span
                className="absolute right-0 top-0 bottom-0 w-8 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </div>
          </div>
        </div>
        <div className="font-display font-bold text-lg w-14 text-right" style={{ color: 'var(--accent-yellow)' }}>
          {pct}%
        </div>
      </div>

      <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>0 carros</span>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {total} / {meta} carros
        </span>
        <span>Meta: {meta}</span>
      </div>
    </div>
  )
}
