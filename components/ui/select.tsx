'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({ value: '', onValueChange: () => {}, open: false, setOpen: () => {} })

function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative" style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      className={cn('flex h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-sm outline-none transition-all', className)}
      style={{
        background: 'var(--bg-tertiary)',
        border: `1px solid ${open ? 'var(--accent-yellow)' : 'var(--border-medium)'}`,
        color: 'var(--text-primary)',
      }}
      onClick={() => setOpen(!open)}
    >
      {children}
      <span style={{ color: 'var(--text-secondary)', fontSize: '10px', marginLeft: '8px' }}>▼</span>
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  return (
    <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
      {value || placeholder}
    </span>
  )
}

function SelectContent({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext)
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg overflow-hidden animate-fade-in"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        {children}
      </div>
    </>
  )
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const { value: selected, onValueChange, setOpen } = React.useContext(SelectContext)
  const isSelected = selected === value
  return (
    <div
      className="px-3 py-2 text-sm cursor-pointer transition-colors"
      style={{
        background: isSelected ? 'rgba(245,184,0,0.1)' : 'transparent',
        color: isSelected ? 'var(--accent-yellow)' : 'var(--text-primary)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'transparent'
      }}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
    >
      {children}
    </div>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
