'use client'

import { FileSpreadsheet, FileText } from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/utils/export'
import type { Production } from '@/types'
import { useState } from 'react'

interface ExportActionsProps {
  productions: Production[]
  meta: number
}

export function ExportActions({ productions, meta }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (isExporting || productions.length === 0) return
    setIsExporting(true)
    try {
      if (type === 'excel') {
        await exportToExcel(productions)
      } else {
        await exportToPDF(productions, meta)
      }
    } catch (err) {
      console.error('Export error:', err)
      alert('Erro ao exportar o relatório. Verifique os logs.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleExport('excel')}
          disabled={isExporting || productions.length === 0}
          className="group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-green-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          title="Exportar para Excel"
        >
          <div className="p-1.5 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-green-500" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">
            {isExporting ? 'Processando...' : 'Relatório Excel'}
          </span>
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting || productions.length === 0}
          className="group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-red-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          title="Exportar para PDF"
        >
          <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">
            {isExporting ? 'Gerando...' : 'Relatório PDF'}
          </span>
        </button>
      </div>

      <div className="hidden sm:block h-6 w-px bg-white/10 mx-2" />

      <div className="flex items-center gap-3 ml-auto sm:ml-0">
        <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-tighter text-white/30">Dados Sincronizados</span>
          </div>
          <div className="text-[11px] font-mono text-white/60 mt-0.5">
            {productions.length} registros no turno
          </div>
        </div>
      </div>
    </div>
  )
}
