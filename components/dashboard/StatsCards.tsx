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

  // Calculate elapsed shift time (Industrial/Operational Day logic)
  const [h, m] = turnoInicio.split(':').map(Number)
  const now = new Date()
  const start = new Date(now)
  start.setHours(h, m, 0, 0)
  
  // Se agora for madrugada (00:00 - 04:59), as 16:48 pertencem a ONTEM
  if (now.getHours() < 5) {
    if (h >= 5) { // Se o turno começou depois das 5h (ex: 16:48), ele é de ontem
      start.setDate(start.getDate() - 1)
    }
  } else {
    // Se agora for dia (>= 05:00), e o turno começou cedo demais (ex: 05:00 AM),
    // ele tecnicamente pertence ao período que já resetou.
    if (h < 5) {
      // Caso raro: turno começando de madruga após o reset de hoje
    } else {
      // Turno normal (ex: 16:48) começou HOJE
      if (now.getTime() < start.getTime()) {
        // Se ainda não deu 16:48 hoje, o cronômetro deve ficar em 00:00 ou pegar o de ontem (mas aqui zera no reset)
      }
    }
  }

  const elapsedMs = Math.max(0, now.getTime() - start.getTime())
  const elapsedH = elapsedMs / 3600000
  const hours = Math.floor(elapsedH)
  const minutes = Math.floor((elapsedMs % 3600000) / 60000)
  const elapsedStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  
  // Média por hora real (evita erro de divisão por zero e reflete o tempo decorrido)
  const divisor = elapsedH > 0.1 ? elapsedH : 0.1 // Mínimo 6 minutos para começar a média
  const mediaHora = (totalBipados / divisor).toFixed(1)

  const cards = [
    {
      label: 'Bipados Hoje',
      value: totalBipados,
      sub: `${restantes} para meta`,
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
    {
      label: 'Produtividade',
      value: `${progress}%`,
      sub: 'Eficiência total',
      accent: 'var(--accent-orange)',
      icon: '⚡',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
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
