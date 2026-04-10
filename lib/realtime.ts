'use client'

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Production, Employee, Settings } from '@/types'

type TableName = 'productions' | 'employees' | 'settings'

interface SubscribeOptions<T> {
  table: TableName
  onInsert?: (record: T) => void
  onUpdate?: (record: T) => void
  onDelete?: (record: Partial<T>) => void
}

export function useRealtimeSubscription<T>({
  table,
  onInsert,
  onUpdate,
  onDelete,
}: SubscribeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    const channelName = `realtime:${table}:${Date.now()}`
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload: any) => onInsert?.(payload.new as T)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload: any) => onUpdate?.(payload.new as T)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table },
        (payload: any) => onDelete?.(payload.old as Partial<T>)
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [table]) // eslint-disable-line react-hooks/exhaustive-deps

  return channelRef
}

export function useProductionRealtime(
  onNewProduction: (p: Production) => void
) {
  return useRealtimeSubscription<Production>({
    table: 'productions',
    onInsert: onNewProduction,
  })
}

export function useEmployeeRealtime(callbacks: {
  onInsert?: (e: Employee) => void
  onUpdate?: (e: Employee) => void
  onDelete?: (e: Partial<Employee>) => void
}) {
  return useRealtimeSubscription<Employee>({
    table: 'employees',
    ...callbacks,
  })
}

export function useSettingsRealtime(onUpdate: (s: Settings) => void) {
  return useRealtimeSubscription<Settings>({
    table: 'settings',
    onUpdate,
  })
}
