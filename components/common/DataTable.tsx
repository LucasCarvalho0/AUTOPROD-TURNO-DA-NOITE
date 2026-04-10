'use client'

import { useState } from 'react'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T, index: number) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyMessage?: string
  keyExtractor: (row: T, index: number) => string
}

export function DataTable<T>({ data, columns, emptyMessage = 'Nenhum registro encontrado', keyExtractor }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)', width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
                className="transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
