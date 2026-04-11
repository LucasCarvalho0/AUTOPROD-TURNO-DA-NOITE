'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Settings, SettingsForm } from '@/types'

const DEFAULT_SETTINGS: Settings = {
  id: '',
  meta: 90,
  turno_inicio: '16:48',
  turno_fim: '05:00',
  hora_extra: '04:00',
  updated_at: new Date().toISOString(),
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseClient() as any

    // Use maybeSingle to handle 0 rows without throwing
    const { data, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      console.error('Erro ao carregar configurações:', fetchError.message)
      setError(fetchError.message)
      setLoading(false)
      return
    }

    if (data) {
      setSettings(data as Settings)
    } else {
      // Table is empty — insert default settings
      console.log('Tabela settings vazia, inserindo configurações padrão...')
      const { data: inserted, error: insertError } = await supabase
        .from('settings')
        .insert({
          meta: DEFAULT_SETTINGS.meta,
          turno_inicio: DEFAULT_SETTINGS.turno_inicio,
          turno_fim: DEFAULT_SETTINGS.turno_fim,
          hora_extra: DEFAULT_SETTINGS.hora_extra,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao criar configurações padrão:', insertError.message)
        setError(insertError.message)
      } else if (inserted) {
        setSettings(inserted as Settings)
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseClient() as any
    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload: any) => {
        if (payload.new && payload.new.id) {
          setSettings(payload.new as Settings)
        }
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [fetchSettings])

  const updateSettings = async (form: SettingsForm) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseClient() as any

    if (!settings.id) {
      // No settings row yet, insert instead
      const { data, error: insertError } = await supabase
        .from('settings')
        .insert({ ...form })
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao criar configurações:', insertError.message)
        return { error: insertError.message }
      }
      setSettings(data as Settings)
      return { data: data as Settings }
    }

    // Update existing row by ID
    const { data, error: updateError } = await supabase
      .from('settings')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao salvar configurações:', updateError.message, updateError.details, updateError.hint)
      return { error: updateError.message }
    }
    setSettings(data as Settings)
    return { data: data as Settings }
  }

  return { settings, loading, error, updateSettings, refetch: fetchSettings }
}
