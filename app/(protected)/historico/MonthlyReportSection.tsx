'use client'

import { useState } from 'react'
import { MonthlyReport } from '@/components/dashboard/MonthlyReport'

export function MonthlyReportSection() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{
          background: 'rgba(245,184,0,0.08)',
          border: '1px solid rgba(245,184,0,0.2)',
          color: 'var(--accent-yellow)',
        }}
      >
        <span>{open ? '▲' : '▼'}</span>
        {open ? 'Ocultar Relatório Mensal' : 'Ver Relatório Mensal'}
      </button>

      {open && (
        <div className="mt-4 animate-fade-in-up">
          <MonthlyReport />
        </div>
      )}
    </div>
  )
}
