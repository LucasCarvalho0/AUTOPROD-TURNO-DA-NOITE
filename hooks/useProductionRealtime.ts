'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getTodayRange } from '@/utils/cron-reset'
import type { Production, HourlyProduction, RankingEntry, LastProduction } from '@/types'

interface ProductionState {
  productions: Production[]
  totalToday: number
  hourlyData: HourlyProduction[]
  ranking: RankingEntry[]
  lastProduction: LastProduction | null
  loading: boolean
  error: string | null
}

export function useProductionRealtime(turnoInicio = '06:00', turnoFim = '16:48') {
  const [state, setState] = useState<ProductionState>({
    productions: [],
    totalToday: 0,
    hourlyData: [],
    ranking: [],
    lastProduction: null,
    loading: true,
    error: null,
  })

  const fetchProductions = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { start, end } = getTodayRange()

    const { data, error } = await supabase
      .from('productions')
      .select('*, employee:employees(id, nome, ativo)')
      .gte('timestamp', start)
      .lte('timestamp', end)
      .order('timestamp', { ascending: false })

    if (error) {
      setState((s) => ({ ...s, error: error.message, loading: false }))
      return
    }

    const prods = (data ?? []) as Production[]
    setState((s) => ({
      ...s,
      productions: prods,
      totalToday: prods.length,
      hourlyData: buildHourlyData(prods, turnoInicio, turnoFim),
      ranking: buildRanking(prods),
      lastProduction: prods[0] ? buildLastProduction(prods[0]) : null,
      loading: false,
      error: null,
    }))
  }, [turnoInicio, turnoFim])

  useEffect(() => {
    fetchProductions()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('productions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'productions' },
        async (payload: any) => {
          // Fetch with employee join
          const { data } = await supabase
            .from('productions')
            .select('*, employee:employees(id, nome, ativo)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            const newProd = data as Production
            setState((s) => {
              const updated = [newProd, ...s.productions]
              return {
                ...s,
                productions: updated,
                totalToday: updated.length,
                hourlyData: buildHourlyData(updated, turnoInicio, turnoFim),
                ranking: buildRanking(updated),
                lastProduction: buildLastProduction(newProd),
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [fetchProductions, turnoInicio, turnoFim])

  return { ...state, refetch: fetchProductions }
}

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------

function buildHourlyData(
  productions: Production[],
  inicio: string,
  fim: string
): HourlyProduction[] {
  if (!inicio || !fim) return []

  const [startH, startM] = inicio.split(':').map(Number)
  const [endH] = fim.split(':').map(Number)
  const now = new Date()
  const currentHour = now.getHours()

  const intervals: HourlyProduction[] = []

  // 1. Primeiro intervalo (ex: 16:48 até 17:00)
  if (startM > 0) {
    const nextHour = (startH + 1) % 24
    const label = `${inicio} - ${String(nextHour).padStart(2, '0')}:00`
    
    const count = productions.filter((p) => {
      const d = new Date(p.timestamp)
      const ph = d.getHours()
      const pm = d.getMinutes()
      // Está na hora inicial mas após os minutos iniciais?
      if (ph === startH) return pm >= startM
      return false
    }).length

    intervals.push({
      hora: label,
      horaNum: startH,
      quantidade: count,
      isCurrent: currentHour === startH,
    })
  }

  // 2. Intervalos de horas cheias (ex: 17:00 até 18:00)
  // Calculamos a quantidade de horas entre a primeira hora cheia e a última hora cheia
  let h = startM > 0 ? (startH + 1) % 24 : startH
  const totalHours = (endH - h + 24) % 24

  for (let i = 0; i <= totalHours; i++) {
    const currentH = (h + i) % 24
    const nextH = (currentH + 1) % 24
    const label = `${String(currentH).padStart(2, '0')}:00 - ${String(nextH).padStart(2, '0')}:00`

    const count = productions.filter((p) => {
      const ph = new Date(p.timestamp).getHours()
      return ph === currentH
    }).length

    intervals.push({
      hora: label,
      horaNum: currentH,
      quantidade: count,
      isCurrent: currentHour === currentH,
    })
  }

  return intervals
}

function buildRanking(productions: Production[]): RankingEntry[] {
  const countMap = new Map<string, { employee: Production['employee']; count: number }>()

  productions.forEach((p) => {
    if (!p.employee) return
    const existing = countMap.get(p.employee_id)
    if (existing) {
      existing.count++
    } else {
      countMap.set(p.employee_id, { employee: p.employee, count: 1 })
    }
  })

  const sorted = Array.from(countMap.values())
    .sort((a, b) => b.count - a.count)

  const total = productions.length || 1

  return sorted.map((entry, i) => ({
    employee: entry.employee!,
    quantidade: entry.count,
    percentual: Math.round((entry.count / total) * 100),
    posicao: i + 1,
  }))
}

function buildLastProduction(p: Production): LastProduction {
  return {
    vin: p.vin,
    employeeName: p.employee?.nome ?? '—',
    versao: p.versao,
    timestamp: new Date(p.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}
