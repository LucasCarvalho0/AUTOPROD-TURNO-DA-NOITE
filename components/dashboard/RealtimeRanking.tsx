'use client'

import { getInitials, getMedalClass, getEmployeeColor, getEmployeeColorBg } from '@/lib/utils'
import type { RankingEntry } from '@/types'

interface RealtimeRankingProps {
  ranking: RankingEntry[]
  limit?: number
}

export function RealtimeRanking({ ranking, limit = 5 }: RealtimeRankingProps) {
  const displayed = ranking.slice(0, limit)

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="section-divider">Ranking em Tempo Real</div>

      {displayed.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-tertiary)' }}>
          Nenhuma produção registrada hoje
        </p>
      ) : (
        <div className="space-y-0">
          {displayed.map((entry, idx) => (
            <div
              key={entry.employee.id}
              className="flex items-center gap-3 py-2.5"
              style={{
                borderBottom: idx < displayed.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Medal */}
              <span className={`font-display font-bold text-xl w-7 text-center ${getMedalClass(entry.posicao)}`}>
                {entry.posicao}
              </span>

              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
                style={{
                  background: getEmployeeColorBg(idx),
                  color: getEmployeeColor(idx),
                }}
              >
                {getInitials(entry.employee.nome)}
              </div>

              {/* Name */}
              <div className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {entry.employee.nome}
              </div>

              {/* Progress bar */}
              <div className="flex-[2] mx-2">
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${entry.percentual}%`,
                      background: getEmployeeColor(idx),
                    }}
                  />
                </div>
              </div>

              {/* Count */}
              <div className="font-display font-bold text-lg" style={{ color: 'var(--accent-yellow)' }}>
                {entry.quantidade}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
