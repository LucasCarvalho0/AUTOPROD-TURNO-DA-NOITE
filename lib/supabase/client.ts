import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types'

// Singleton — cria o cliente apenas uma vez no browser
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Next.js Environment Variables (Supabase) não definidas!')
  }

  _client = createBrowserClient<Database>(supabaseUrl || '', supabaseAnonKey || '')
  return _client
}
