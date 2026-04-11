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
      
      const shiftStartTime = new Date(start).getTime()
      const shiftEndTime = new Date(end).getTime()

      // SAFETY: Buscamos TUDO das últimas 48 horas (máxima segurança)
      const safetyStartTime = Date.now() - (48 * 60 * 60 * 1000)
      const safetyStartISO = new Date(safetyStartTime).toISOString()

      const { data: allData, error: queryError } = await supabase
        .from('productions')
        .select('*, employee:employees(id, nome, ativo)')
        .gte('timestamp', safetyStartISO)
        .order('timestamp', { ascending: false })

      if (queryError) {
        throw queryError
      }

      // Filtramos em memória usando timestamps numéricos (100% robusto contra fuso e milissegundos)
      const prods = ((allData ?? []) as Production[]).filter(p => {
        const pTime = new Date(p.timestamp).getTime()
        return pTime >= shiftStartTime && pTime <= shiftEndTime
      })

      console.log(`[Dashboard] Busca 48h: ${allData?.length} registros | Turno atual: ${prods.length}`)

      // 2. Query para o ÚLTIMO carro absoluto (não zera no reset)
      const { data: lastData } = await supabase
        .from('productions')
        .select('*, employee:employees(id, nome, ativo)')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()

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
  
  // O "Início Real" do turno (ex: 16:48)
  const actualStart = new Date(shiftStart)
  actualStart.setHours(startH, startM, 0, 0)
  
  // 1. Primeiro intervalo parcial (ex: 16:48 até 17:00)
  if (startM > 0) {
    const startRange = new Date(actualStart)
    const endRange = new Date(actualStart)
    endRange.setMinutes(0, 0, 0)
    endRange.setHours(endRange.getHours() + 1)

    const label = `${inicio} - ${String(endRange.getHours()).padStart(2, '0')}:00`
    const objetivo = 2
    
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

  // 2. Intervalos de horas cheias (Ex: 17:00 até 05:00)
  const firstFullHour = startM > 0 ? (startH + 1) % 24 : startH
  const endHourForChart = 5 
  const totalHoursToShow = (endHourForChart - firstFullHour + 24) % 24
  
  for (let i = 0; i < totalHoursToShow; i++) {
    const currentH = (firstFullHour + i) % 24
    
    // Calcula o início e fim da janela horária cuidando da virada do dia
    const startRange = new Date(actualStart)
    startRange.setMinutes(0, 0, 0)
    startRange.setHours(actualStart.getHours() + (startM > 0 ? i + 1 : i))

    const endRange = new Date(startRange)
    endRange.setHours(startRange.getHours() + 1)

    const label = `${String(currentH).padStart(2, '0')}:00 - ${String((currentH + 1) % 24).padStart(2, '0')}:00`
    const objetivo = currentH === 21 ? 0 : META_POR_HORA

    const count = productionsWithDates.filter((p) => {
      return p.date >= startRange && p.date < endRange
    }).length

    console.log(`[Chart] Intervalo ${label}: ${count} veículos.`)

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
