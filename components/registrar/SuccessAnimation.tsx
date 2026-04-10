'use client'

import type { CarVersion } from '@/types'

interface SuccessAnimationProps {
  vin: string
  employeeName: string
  versao: CarVersion
  hora: string
  onDismiss: () => void
}

export function SuccessAnimation({ vin, employeeName, versao, hora, onDismiss }: SuccessAnimationProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl animate-scale-in"
      style={{
        background: 'rgba(24,201,125,0.08)',
        border: '1px solid rgba(24,201,125,0.25)',
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-2xl"
        style={{ background: 'rgba(24,201,125,0.2)', color: 'var(--accent-green)' }}
      >
        ✓
      </div>
      <div className="flex-1">
        <div
          className="font-display font-bold text-xl tracking-widest mb-1"
          style={{ color: 'var(--accent-green)' }}
        >
          {vin}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {employeeName} · {versao} · Registrado às {hora}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-xl px-2"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ✕
      </button>
    </div>
  )
}
