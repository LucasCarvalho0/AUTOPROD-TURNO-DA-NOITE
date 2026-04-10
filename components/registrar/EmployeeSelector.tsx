'use client'

import type { Employee } from '@/types'

interface EmployeeSelectorProps {
  employees: Employee[]
  selected: string | null
  onSelect: (id: string) => void
}

export function EmployeeSelector({ employees, selected, onSelect }: EmployeeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {employees.map((emp) => {
        const isSelected = selected === emp.id
        return (
          <button
            key={emp.id}
            onClick={() => onSelect(emp.id)}
            className="px-3 py-3 rounded-xl text-sm font-medium text-left transition-all"
            style={{
              background: isSelected ? 'rgba(245,184,0,0.12)' : 'var(--bg-secondary)',
              border: isSelected ? '1px solid var(--accent-yellow)' : '1px solid var(--border-subtle)',
              color: isSelected ? 'var(--accent-yellow)' : 'var(--text-secondary)',
            }}
          >
            {emp.nome}
          </button>
        )
      })}

      {employees.length === 0 && (
        <p className="col-span-3 text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
          Nenhum funcionário ativo
        </p>
      )}
    </div>
  )
}
