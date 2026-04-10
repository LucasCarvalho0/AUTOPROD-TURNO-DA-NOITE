'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getTodayRange } from '@/utils/cron-reset'
import type { RankingEntry } from '@/types'

export function useRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRanking = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { start, end } = getTodayRange()

    const { data } = await supabase
      .from('productions')
      .select('employee_id, employee:employees(id, nome, ativo)')
      .gte('timestamp', start)
      .lte('timestamp', end)

    if (!data) { setLoading(false); return }

    const countMap = new Map<string, { nome: string; ativo: boolean; count: number }>()
    data.forEach((p: any) => {
      const e = p.employee
      if (!e) return
      const existing = countMap.get(p.employee_id)
      if (existing) existing.count++
      else countMap.set(p.employee_id, { nome: e.nome, ativo: e.ativo, count: 1 })
    })

    const total = data.length || 1
    const sorted: RankingEntry[] = Array.from(countMap.entries())
      .map(([id, v], i) => ({
        employee: { id, nome: v.nome, ativo: v.ativo, created_at: '', updated_at: '' },
        quantidade: v.count,
        percentual: Math.round((v.count / total) * 100),
        posicao: i + 1,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .map((e, i) => ({ ...e, posicao: i + 1 }))

    setRanking(sorted)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRanking()
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('ranking-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'productions' }, () => {
        fetchRanking()
      })
      .subscribe()
    return () => { channel.unsubscribe() }
  }, [fetchRanking])

  return { ranking, loading, refetch: fetchRanking }
}
