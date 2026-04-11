// Daily reset logic - to be deployed as a Supabase Edge Function
// File: supabase/functions/daily-reset/index.ts
// Cron: 0 8 * * * (todo dia às 05:00 BRT = 08:00 UTC)

export const DAILY_RESET_HOUR = 5

/**
 * LÓGICA DE DIA OPERACIONAL (Industrial)
 * --------------------------------------
 * Turno 2: Inicia às 16:48 e vai até a madrugada (até o reset das 05:00).
 * O "dia" de produção só zera às 05:00 da manhã.
 * 
 * Exemplo: Se agora são 02:00 AM de sábado, o sistema deve considerar 
 * que ainda estamos no turno de SEXTA-FEIRA.
 */

export function shouldReset(lastResetDate: string | null): boolean {
  if (!lastResetDate) return true
  const last = new Date(lastResetDate)
  const now = new Date()
  
  // Ponto de virada oficial: 05:00 AM de hoje
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), DAILY_RESET_HOUR, 0, 0)
  
  if (now >= todayReset) {
    // Se já passou das 05:00 hoje, o último reset deve ter sido HOJE às 05:00
    return last < todayReset
  } else {
    // Se ainda NÃO deu 05:00 hoje, o último reset deve ter sido ONTEM às 05:00
    const yesterdayReset = new Date(todayReset)
    yesterdayReset.setDate(yesterdayReset.getDate() - 1)
    return last < yesterdayReset
  }
}

/**
 * Returns today's production window (since last reset at 05:00)
 */
export function getTodayRange(): { start: string; end: string } {
  const now = new Date()
  
  // Criamos o ponto de início (reset) baseado no horário de reset diário (05:00) HOJE
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), DAILY_RESET_HOUR, 0, 0, 0)
  
  // Se agora ainda não deu 05:00 AM, o "Dia Operacional" começou às 05:00 de ONTEM
  if (now.getTime() < start.getTime()) {
    start.setDate(start.getDate() - 1)
  }
  
  // O fim do período é exatamente 24h após o início
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)

  console.log('[DEBUG-RESET] Janela Ativa:', {
    agora: now.toLocaleString(),
    inicioFiltro: start.toLocaleString(),
    fimFiltro: end.toLocaleString(),
    startISO: start.toISOString()
  })

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
