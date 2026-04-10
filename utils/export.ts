import type * as ExcelJS from 'exceljs'
import type { Production, RankingEntry } from '@/types'
import { formatDateTime } from '@/lib/utils'

// -------------------------------------------------------
// EXCEL EXPORT
// -------------------------------------------------------

export async function exportToExcel(
  productions: Production[],
  filename = 'producao-turno'
): Promise<void> {
  const ExcelJSImport = (await import('exceljs')).default
  const workbook = new ExcelJSImport.Workbook() as ExcelJS.Workbook
  workbook.creator = 'AutoProd Sistema'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Produção', {
    properties: { tabColor: { argb: 'FFF5B800' } },
  })

  // Header style
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: 'FF000000' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5B800' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      bottom: { style: 'thin', color: { argb: 'FFE0A800' } },
    },
  }

  sheet.columns = [
    { header: '#', key: 'num', width: 6 },
    { header: 'VIN', key: 'vin', width: 22 },
    { header: 'Funcionário', key: 'funcionario', width: 24 },
    { header: 'Versão', key: 'versao', width: 16 },
    { header: 'Data/Hora', key: 'timestamp', width: 20 },
  ]

  // Apply header styles
  const headerRow = sheet.getRow(1)
  headerRow.height = 28
  headerRow.eachCell((cell) => {
    Object.assign(cell, headerStyle)
  })

  // Data rows
  productions.forEach((p, i) => {
    const row = sheet.addRow({
      num: i + 1,
      vin: p.vin,
      funcionario: p.employee?.nome ?? '—',
      versao: p.versao,
      timestamp: formatDateTime(p.timestamp),
    })

    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1A1D25' },
        }
      })
    }
  })

  // Auto-fit columns
  sheet.columns.forEach((col) => {
    col.alignment = { vertical: 'middle' }
  })

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Resumo')
  summarySheet.addRow(['Total de VINs registrados', productions.length])
  summarySheet.addRow(['Gerado em', new Date().toLocaleString('pt-BR')])

  // Download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, `${filename}-${dateSlug()}.xlsx`)
}

export async function exportRankingToExcel(
  ranking: RankingEntry[],
  filename = 'ranking-turno'
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Ranking')

  sheet.columns = [
    { header: 'Posição', key: 'posicao', width: 10 },
    { header: 'Funcionário', key: 'nome', width: 28 },
    { header: 'Carros Produzidos', key: 'quantidade', width: 20 },
    { header: '% do Total', key: 'percentual', width: 14 },
  ]

  ranking.forEach((entry) => {
    sheet.addRow({
      posicao: `${entry.posicao}º`,
      nome: entry.employee.nome,
      quantidade: entry.quantidade,
      percentual: `${entry.percentual.toFixed(1)}%`,
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, `${filename}-${dateSlug()}.xlsx`)
}

// -------------------------------------------------------
// PDF EXPORT
// -------------------------------------------------------

export async function exportToPDF(
  productions: Production[],
  meta: number,
  filename = 'producao-turno'
): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header
  doc.setFillColor(10, 12, 15)
  doc.rect(0, 0, 297, 25, 'F')
  doc.setTextColor(245, 184, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('AUTOPROD — Relatório de Produção', 14, 16)

  doc.setTextColor(138, 155, 176)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22)
  doc.text(`Total: ${productions.length} VINs  |  Meta: ${meta}`, 200, 22)

  // Table
  autoTable(doc, {
    startY: 30,
    head: [['#', 'VIN', 'Funcionário', 'Versão', 'Data/Hora']],
    body: productions.map((p, i) => [
      i + 1,
      p.vin,
      p.employee?.nome ?? '—',
      p.versao,
      formatDateTime(p.timestamp),
    ]),
    headStyles: {
      fillColor: [245, 184, 0],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fillColor: [24, 27, 34],
      textColor: [240, 242, 245],
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [17, 19, 24],
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 48, font: 'courier', fontStyle: 'bold' },
      2: { cellWidth: 52 },
      3: { cellWidth: 35 },
      4: { cellWidth: 45 },
    },
    margin: { left: 14, right: 14 },
  })

  doc.save(`${filename}-${dateSlug()}.pdf`)
}

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function dateSlug(): string {
  return new Date()
    .toLocaleDateString('pt-BR')
    .replace(/\//g, '-')
}
