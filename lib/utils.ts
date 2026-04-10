import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm")
}

export function formatTime(date: string | Date) {
  return formatDate(date, 'HH:mm')
}

export function todayRange() {
  const now = new Date()
  return {
    start: startOfDay(now).toISOString(),
    end: endOfDay(now).toISOString(),
  }
}

export function getShiftHours(inicio: string, fim: string): string[] {
  const [startH] = inicio.split(':').map(Number)
  const [endH] = fim.split(':').map(Number)
  const hours: string[] = []
  for (let h = startH; h <= endH; h++) {
    hours.push(`${String(h).padStart(2, '0')}h`)
  }
  return hours
}

export function calcProgress(current: number, meta: number): number {
  if (meta <= 0) return 0
  return Math.min(100, Math.round((current / meta) * 100))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getMedalClass(position: number): string {
  if (position === 1) return 'rank-gold'
  if (position === 2) return 'rank-silver'
  if (position === 3) return 'rank-bronze'
  return 'text-text-tertiary'
}

export function getEmployeeColor(index: number): string {
  const colors = [
    '#2d8cf0',
    '#18c97d',
    '#f5b800',
    '#8b5cf6',
    '#e84855',
    '#06b6d4',
    '#f97316',
  ]
  return colors[index % colors.length]
}

export function getEmployeeColorBg(index: number): string {
  const colors = [
    'rgba(45,140,240,0.18)',
    'rgba(24,201,125,0.18)',
    'rgba(245,184,0,0.18)',
    'rgba(139,92,246,0.18)',
    'rgba(232,72,85,0.18)',
    'rgba(6,182,212,0.18)',
    'rgba(249,115,22,0.18)',
  ]
  return colors[index % colors.length]
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
