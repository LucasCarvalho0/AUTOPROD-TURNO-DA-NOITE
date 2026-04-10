// Este arquivo é o alias dos tipos gerados pelo Supabase CLI.
// Para regenerar com o CLI: supabase gen types typescript --linked > lib/supabase/types.ts
//
// Por ora re-exporta do types/index.ts para manter compatibilidade.

export type { Database } from '@/types'

// Helpers de acesso às linhas/inserções de cada tabela
import type { Database } from '@/types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Aliases convenientes
export type UserRow       = Tables<'users'>
export type EmployeeRow   = Tables<'employees'>
export type ProductionRow = Tables<'productions'>
export type SettingsRow   = Tables<'settings'>
