// Daily reset logic - to be deployed as a Supabase Edge Function
// File: supabase/functions/daily-reset/index.ts
// Cron: 0 23 * * * (every day at 23:00 BRT)

export const DAILY_RESET_HOUR = 5

/**
 * Client-side: check if reset should be triggered
 */
export function shouldReset(lastResetDate: string | null): boolean {
  if (!lastResetDate) return true
  const last = new Date(lastResetDate)
  const now = new Date()
  
  // Se agora passou do horário de reset de hoje, e o último reset foi em um dia anterior
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), DAILY_RESET_HOUR, 0, 0)
  const isAfterResetToday = now >= todayReset
  
  if (isAfterResetToday) {
    // Se hoje já passou das 05:00, o último reset tem que ser de hoje às 05:00
    return last < todayReset
  } else {
    // Se hoje ainda não deu 05:00, o último reset tem que ser de ontem às 05:00
    const yesterdayReset = new Date(todayReset)
    yesterdayReset.setDate(yesterdayReset.getDate() - 1)
    return last < yesterdayReset
  }
}

/**
 * Returns today's production window (since last reset)
 */
export function getTodayRange(): { start: string; end: string } {
  const now = new Date()
  const currentHour = now.getHours()
  
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), DAILY_RESET_HOUR, 0, 0)
  
  // Se ainda não deu 05:00 da manhã, o "Dia de Produção" começou às 05:00 de ontem
  if (currentHour < DAILY_RESET_HOUR) {
    start.setDate(start.getDate() - 1)
  }
  
  const end = new Date(start)
  end.setHours(end.getHours() + 23, 59, 59, 999)

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
