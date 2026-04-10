'use client'

import type { CarVersion } from '@/types'

interface VersionSelectorProps {
  selected: CarVersion | null
  onSelect: (v: CarVersion) => void
}

const versions: { value: CarVersion; desc: string }[] = [
  { value: 'L3 Exclusive', desc: 'Versão premium completa' },
  { value: 'L2 Advanced', desc: 'Versão intermediária' },
]

export function VersionSelector({ selected, onSelect }: VersionSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {versions.map((v) => {
        const isSelected = selected === v.value
        return (
          <button
            key={v.value}
            onClick={() => onSelect(v.value)}
            className="p-5 rounded-xl text-center transition-all"
            style={{
              background: isSelected ? 'rgba(245,184,0,0.08)' : 'var(--bg-secondary)',
              border: isSelected ? '2px solid var(--accent-yellow)' : '2px solid var(--border-subtle)',
            }}
          >
            <div className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {v.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {v.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}
