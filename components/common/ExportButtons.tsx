'use client'

import { useState } from 'react'
import type { Production, RankingEntry } from '@/types'

interface ExportButtonsProps {
  productions: Production[]
  ranking?: RankingEntry[]
  meta?: number
}

export function ExportButtons({ productions, ranking, meta = 90 }: ExportButtonsProps) {
  const [loadingXlsx, setLoadingXlsx] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const handleExcelExport = async () => {
    setLoadingXlsx(true)
    try {
      const { exportToExcel } = await import('@/utils/export')
      await exportToExcel(productions)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingXlsx(false)
    }
  }

  const handlePdfExport = async () => {
    setLoadingPdf(true)
    try {
      const { exportToPDF } = await import('@/utils/export')
      await exportToPDF(productions, meta)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPdf(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExcelExport}
        disabled={loadingXlsx || productions.length === 0}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
        style={{
          background: 'rgba(24,201,125,0.12)',
          border: '1px solid rgba(24,201,125,0.25)',
          color: 'var(--accent-green)',
        }}
      >
        {loadingXlsx ? 'Gerando...' : '📊 Excel'}
      </button>
      <button
        onClick={handlePdfExport}
        disabled={loadingPdf || productions.length === 0}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
        style={{
          background: 'rgba(232,72,85,0.12)',
          border: '1px solid rgba(232,72,85,0.25)',
          color: 'var(--accent-red)',
        }}
      >
        {loadingPdf ? 'Gerando...' : '📄 PDF'}
      </button>
    </div>
  )
}
