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
  const [startH] = inicio.split(':').map(Number)
  const [endH] = fim.split(':').map(Number)
  const currentHour = new Date().getHours()

  const hours: HourlyProduction[] = []
  for (let h = startH; h <= endH; h++) {
    const count = productions.filter((p) => {
      const pHour = new Date(p.timestamp).getHours()
      return pHour === h
    }).length

    hours.push({
      hora: `${String(h).padStart(2, '0')}h`,
      horaNum: h,
      quantidade: count,
      isCurrent: h === currentHour,
    })
  }

  return hours
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
