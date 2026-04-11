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

export function useProductionRealtime(turnoInicio = '16:48', turnoFim = '05:00') {
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
    try {
      const supabase = getSupabaseClient()
      const { start, end } = getTodayRange()

      const { data, error } = await supabase
        .from('productions')
        .select('*, employee:employees(id, nome, ativo)')
        .gte('timestamp', start)
        .lte('timestamp', end)
        .order('timestamp', { ascending: false })

      if (error) throw error

      const prods = (data ?? []) as Production[]
      setState({
        productions: prods,
        totalToday: prods.length,
        hourlyData: buildHourlyData(prods, turnoInicio, turnoFim),
        ranking: buildRanking(prods),
        lastProduction: prods[0] ? buildLastProduction(prods[0]) : null,
        loading: false,
        error: null,
      })
    } catch (err: any) {
      console.error('Fetch error:', err)
      setState((s) => ({ ...s, error: err.message, loading: false }))
    }
  }, [turnoInicio, turnoFim])

  useEffect(() => {
    fetchProductions()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('productions-realtime-all')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'productions' },
        async (payload) => {
          // Quando um carro é inserido, vamos buscar o registro completo (com o join do funcionário)
          const { data, error } = await supabase
            .from('productions')
            .select('*, employee:employees(id, nome, ativo)')
            .eq('id', payload.new.id)
            .single()

          if (!error && data) {
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
          } else {
            // Se falhar o fetch individual, recarrega tudo para garantir
            fetchProductions()
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime production active')
        }
      })

    return () => {
      supabase.removeChannel(channel)
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

  const productionsWithDates = productions.map(p => ({
    ...p,
    date: new Date(p.timestamp)
  }))

  const [startH, startM] = inicio.split(':').map(Number)
  const [endH] = fim.split(':').map(Number)
  const now = new Date()

  const intervals: HourlyProduction[] = []
  const META_POR_HORA = 11

  // Ponto de partida âncora: o início do turno de PRODUÇÃO (calculado via cron-reset)
  const { start: shiftStartISO } = getTodayRange()
  const shiftStart = new Date(shiftStartISO)
  
  // Criamos uma data base para os cálculos de horas cheias
  const anchorDate = new Date(shiftStart)
  anchorDate.setMinutes(0, 0, 0)

  // 1. Primeiro intervalo (ex: 16:48 até 17:00)
  if (startM > 0) {
    const startRange = new Date(shiftStart)
    
    const endRange = new Date(startRange)
    if (endRange.getMinutes() > 0) {
      endRange.setHours(endRange.getHours() + 1, 0, 0, 0)
    }

    const label = `${inicio} AS ${String(endRange.getHours()).padStart(2, '0')}:00`
    
    // Meta proporcional aos minutos restantes da hora
    const minutosRestantes = 60 - startM
    const objetivo = Math.round((META_POR_HORA * minutosRestantes) / 60)
    
    const count = productionsWithDates.filter((p) => {
      return p.date >= startRange && p.date < endRange
    }).length

    intervals.push({
      hora: label,
      horaNum: startH,
      quantidade: count,
      objetivo: objetivo,
      isCurrent: now >= startRange && now < endRange,
    })
  }

  // 2. Intervalos de horas cheias (ex: 17:00 até 18:00)
  let h = startM > 0 ? (startH + 1) % 24 : startH
  const totalHours = (endH - h + 24) % 24

  for (let i = 0; i <= totalHours; i++) {
    const currentH = (h + i) % 24
    
    const startRange = new Date(anchorDate)
    // Ajustamos o dia baseado no deslocamento acumulado desde o início do turno
    // Se o turno começou às 16:00 e estamos na hora 2 (2 AM), i será ~10.
    // Usamos o shiftStart como âncora real.
    startRange.setHours(shiftStart.getHours() + (startM > 0 ? i + 1 : i), 0, 0, 0)

    const endRange = new Date(startRange)
    endRange.setHours(startRange.getHours() + 1, 0, 0, 0)

    const startLabel = String(currentH).padStart(2, '0') + ':00'
    const endLabel = String((currentH + 1) % 24).padStart(2, '0') + ':00'
    const label = `${startLabel} AS ${endLabel}`

    // Regra: meta 0 se for horário de janta (21:00 às 22:00)
    const objetivo = currentH === 21 ? 0 : META_POR_HORA

    const count = productionsWithDates.filter((p) => {
      return p.date >= startRange && p.date < endRange
    }).length

    intervals.push({
      hora: label,
      horaNum: currentH,
      quantidade: count,
      objetivo: objetivo,
      isCurrent: now >= startRange && now < endRange,
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
