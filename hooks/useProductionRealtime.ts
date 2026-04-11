'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getTodayRange } from '@/utils/cron-reset'
import type { Production, HourlyProduction, RankingEntry, LastProduction, RealtimePayload } from '@/types'

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

      console.log('[Dashboard] Fetching with range:', { start, end })

      // 1. Query para os dados do turno atual (zeram no reset)
      const { data: rangeData, error: rangeError } = await supabase
        .from('productions')
        .select('*, employee:employees(id, nome, ativo)')
        .gte('timestamp', start)
        .lte('timestamp', end)
        .order('timestamp', { ascending: false })

      if (rangeError) throw rangeError

      // 2. Query para o ÚLTIMO carro absoluto (não zera no reset)
      const { data: lastData } = await supabase
        .from('productions')
        .select('*, employee:employees(id, nome, ativo)')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()

      const prods = (rangeData ?? []) as Production[]
      console.log('[Dashboard] Rows fetched:', prods.length)

      setState({
        productions: prods,
        totalToday: prods.length,
        hourlyData: buildHourlyData(prods, turnoInicio, turnoFim),
        ranking: buildRanking(prods),
        lastProduction: lastData ? buildLastProduction(lastData as Production) : null,
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
        async (payload: any) => {
          console.log('Realtime INSERT received:', payload)
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
      .subscribe((status: string) => {
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

  const [startH, startM] = inicio.split(':').map(Number)
  const [endH] = fim.split(':').map(Number)
  const now = new Date()

  const productionsWithDates = productions.map(p => ({
    ...p,
    date: new Date(p.timestamp)
  }))

  const intervals: HourlyProduction[] = []
  const META_POR_HORA = 11

  // Ponto de partida âncora: o início do turno de PRODUÇÃO baseado no reset
  const { start: shiftStartISO } = getTodayRange()
  const shiftStart = new Date(shiftStartISO)
  
  // Vamos descobrir a data "Real" de início baseada em turno_inicio
  // Se shiftStart é 05:00 de ontem e inicio é 16:48, o turno começou 16:48 de ontem.
  const actualStart = new Date(shiftStart)
  actualStart.setHours(startH, startM, 0, 0)
  
  // Se o actualStart calculado acima ficou ANTES do shiftStart (o reset), 
  // significa que na verdade o turno inicia no mesmo dia do reset (ex: turno inicia as 07:00 e reset as 05:00)
  // Mas no nosso caso (16:48 e 05:00), 16:48 ontem é > 05:00 ontem. OK.
  
  // 1. Primeiro intervalo parcial (ex: 16:48 até 17:00)
  if (startM > 0) {
    const startRange = new Date(actualStart)
    const endRange = new Date(actualStart)
    endRange.setMinutes(0, 0, 0)
    endRange.setHours(endRange.getHours() + 1)

    const label = `${inicio} AS ${String(endRange.getHours()).padStart(2, '0')}:00`
    const objetivo = 2 // Fixado em 2 conforme imagem de referência Excel
    
    const count = productionsWithDates.filter((p) => {
      return p.date.getTime() >= startRange.getTime() && p.date.getTime() < endRange.getTime()
    }).length

    intervals.push({
      hora: label,
      horaNum: startH,
      quantidade: count,
      objetivo: objetivo,
      isCurrent: now.getTime() >= startRange.getTime() && now.getTime() < endRange.getTime(),
    })
  }

  // 2. Intervalos de horas cheias
  const firstFullHour = startM > 0 ? (startH + 1) % 24 : startH
  const hourDiff = (endH - firstFullHour + 24) % 24
  
  for (let i = 0; i <= hourDiff; i++) {
    const currentH = (firstFullHour + i) % 24
    
    const startRange = new Date(actualStart)
    startRange.setMinutes(0, 0, 0)
    // Se passamos de 24h, o setHours cuida do incremento de dia
    startRange.setHours(actualStart.getHours() + (startM > 0 ? i + 1 : i))

    const endRange = new Date(startRange)
    endRange.setHours(startRange.getHours() + 1)

    const label = `${String(currentH).padStart(2, '0')}:00 AS ${String((currentH + 1) % 24).padStart(2, '0')}:00`
    const objetivo = currentH === 21 ? 0 : META_POR_HORA

    const count = productionsWithDates.filter((p) => {
      return p.date.getTime() >= startRange.getTime() && p.date.getTime() < endRange.getTime()
    }).length

    intervals.push({
      hora: label,
      horaNum: currentH,
      quantidade: count,
      objetivo: objetivo,
      isCurrent: now.getTime() >= startRange.getTime() && now.getTime() < endRange.getTime(),
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
