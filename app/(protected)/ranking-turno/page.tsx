'use client'

import { useRanking } from '@/hooks/useRanking'
import { Topbar } from '@/components/layout/Topbar'
import { getInitials, getMedalClass, getEmployeeColor, getEmployeeColorBg } from '@/lib/utils'

export default function RankingTurnoPage() {
  const { ranking, loading } = useRanking()

  const maxQtd = ranking[0]?.quantidade || 1

  return (
    <>
      <Topbar title="Ranking do Turno" />
      <div className="flex-1 overflow-y-auto p-5 pb-20 md:pb-5">
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
        >
          {loading ? (
            <div className="p-10 text-center" style={{ color: 'var(--text-secondary)' }}>
              Carregando ranking...
            </div>
          ) : ranking.length === 0 ? (
            <div className="p-10 text-center" style={{ color: 'var(--text-tertiary)' }}>
              Nenhuma produção registrada hoje
            </div>
          ) : (
            ranking.map((entry, idx) => (
              <div
                key={entry.employee.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors"
                style={{
                  borderBottom: idx < ranking.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: idx === 0 ? 'rgba(245,184,0,0.04)' : 'transparent',
                }}
              >
                {/* Position */}
                <div
                  className={`font-display font-bold text-2xl w-8 text-center ${getMedalClass(entry.posicao)}`}
                >
                  {entry.posicao}
                </div>

                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                  style={{
                    background: getEmployeeColorBg(idx),
                    color: getEmployeeColor(idx),
                  }}
                >
                  {getInitials(entry.employee.nome)}
                </div>

                {/* Name + status */}
                <div className="w-40 flex-shrink-0">
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {entry.employee.nome}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {entry.employee.ativo ? 'Ativo' : 'Inativo'}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 mx-4 hidden sm:block">
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round((entry.quantidade / maxQtd) * 100)}%`,
                        background: getEmployeeColor(idx),
                      }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-display font-bold text-3xl"
                    style={{ color: 'var(--accent-yellow)' }}
                  >
                    {entry.quantidade}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    carros
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
