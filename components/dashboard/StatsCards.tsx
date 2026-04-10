'use client'

import { calcProgress } from '@/lib/utils'

interface StatsCardsProps {
  totalBipados: number
  meta: number
  turnoInicio: string
}

export function StatsCards({ totalBipados, meta, turnoInicio }: StatsCardsProps) {
  const progress = calcProgress(totalBipados, meta)
  const restantes = Math.max(0, meta - totalBipados)

  // Calculate elapsed shift time
  const [h, m] = turnoInicio.split(':').map(Number)
  const now = new Date()
  const start = new Date(now)
  start.setHours(h, m, 0, 0)
  const elapsedMs = Math.max(0, now.getTime() - start.getTime())
  const elapsedH = Math.floor(elapsedMs / 3600000)
  const elapsedM = Math.floor((elapsedMs % 3600000) / 60000)
  const elapsedStr = `${String(elapsedH).padStart(2, '0')}:${String(elapsedM).padStart(2, '0')}`
  const mediaHora = elapsedH > 0 ? (totalBipados / elapsedH).toFixed(1) : totalBipados.toString()

  const cards = [
    {
      label: 'Carros Bipados Hoje',
      value: totalBipados,
      sub: `${restantes} restantes para a meta`,
      accent: 'var(--accent-yellow)',
      icon: '🚗',
    },
    {
      label: 'Meta do Turno',
      value: meta,
      sub: `${progress}% concluído`,
      accent: 'var(--accent-green)',
      icon: '🎯',
    },
    {
      label: 'Tempo de Turno',
      value: elapsedStr,
      sub: `Início: ${turnoInicio}`,
      accent: 'var(--accent-blue)',
      icon: '⏱',
      mono: true,
    },
    {
      label: 'Média por Hora',
      value: mediaHora,
      sub: 'carros / hora',
      accent: 'var(--accent-purple)',
      icon: '📈',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative rounded-xl p-4 overflow-hidden"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
            style={{ background: card.accent }}
          />
          <div
            className="absolute right-3 top-3 text-2xl opacity-10"
          >
            {card.icon}
          </div>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
            {card.label}
          </div>
          <div
            className="font-display font-bold leading-none mb-1"
            style={{
              fontSize: card.mono ? '28px' : '34px',
              color: 'var(--text-primary)',
              letterSpacing: card.mono ? '0.05em' : undefined,
            }}
          >
            {card.value}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
