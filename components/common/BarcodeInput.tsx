'use client'

import { useRef, useEffect } from 'react'

interface BarcodeInputProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Invisible input that captures physical scanner keystrokes.
 * Keeps focus so the scanner (which acts as a keyboard) sends
 * characters directly here without the user needing to click.
 */
export function BarcodeInput({ value, onChange, onSubmit, disabled, placeholder }: BarcodeInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) ref.current?.focus()
  }, [disabled])

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      onKeyDown={(e) => { if (e.key === 'Enter') onSubmit() }}
      disabled={disabled}
      placeholder={placeholder ?? 'Bipe o código aqui...'}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      className="w-full px-5 py-4 rounded-xl outline-none transition-all font-display font-bold tracking-widest"
      style={{
        fontSize: '22px',
        background: 'var(--bg-secondary)',
        border: '2px solid var(--border-medium)',
        color: 'var(--accent-yellow)',
      }}
      onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
    />
  )
}
