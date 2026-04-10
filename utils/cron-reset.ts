// Daily reset logic - to be deployed as a Supabase Edge Function
// File: supabase/functions/daily-reset/index.ts
// Cron: 0 23 * * * (every day at 23:00 BRT)

export const DAILY_RESET_HOUR = 23

/**
 * Client-side: check if reset should be triggered
 */
export function shouldReset(lastResetDate: string | null): boolean {
  if (!lastResetDate) return true
  const last = new Date(lastResetDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate())
  return today > lastDay
}

/**
 * Returns today's production window (since last reset)
 */
export function getTodayRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

// -------------------------------------------------------
// SUPABASE EDGE FUNCTION (deploy separately)
// supabase/functions/daily-reset/index.ts
// -------------------------------------------------------
export const EDGE_FUNCTION_CODE = `
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== \`Bearer \${Deno.env.get('CRON_SECRET')}\`) {
    return new Response('Unauthorized', { status: 401 })
  }

  console.log('Running daily reset at', new Date().toISOString())

  // Archive yesterday productions (optional: keep history, just mark as archived)
  // Productions table keeps full history — dashboard filters by today's date
  // So the "reset" is just ensuring the dashboard queries use today's date filter

  // Log the reset
  const { error } = await supabase
    .from('daily_resets')
    .insert({ reset_at: new Date().toISOString() })

  if (error) {
    console.error('Reset log error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, reset_at: new Date().toISOString() }))
})
`
