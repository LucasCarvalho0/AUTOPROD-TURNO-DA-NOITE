// @ts-nocheck
// AutoProd — Daily Reset Edge Function
// Deploy: supabase functions deploy daily-reset
// Cron:   0 2 * * *    (todo dia às 02:00 BRT = 05:00 UTC)
//
// Configure o cron em:
// Supabase Dashboard → Edge Functions → daily-reset → Schedule

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validate cron secret
  const authHeader = req.headers.get('Authorization')
  const cronSecret = Deno.env.get('CRON_SECRET')

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )

  const now = new Date().toISOString()
  console.log(`[daily-reset] Iniciando reset às ${now}`)

  try {
    // Log the reset
    const { error: logError } = await supabase
      .from('daily_resets')
      .insert({ reset_at: now })

    if (logError) {
      console.error('[daily-reset] Erro ao registrar log:', logError)
      throw logError
    }

    // NOTE: Productions are NOT deleted — full history is preserved.
    // The dashboard always queries with date filters (today's range).
    // So "reset" = just logging that a new day has begun.
    //
    // If you DO want to clear today's data (e.g. for shift resets), 
    // uncomment the block below:
    //
    // const yesterday = new Date()
    // yesterday.setDate(yesterday.getDate() - 1)
    // const { error: archiveError } = await supabase
    //   .from('productions')
    //   .update({ archived: true })
    //   .lt('timestamp', yesterday.toISOString())
    // if (archiveError) throw archiveError

    console.log('[daily-reset] Reset concluído com sucesso')

    return new Response(
      JSON.stringify({
        success: true,
        reset_at: now,
        message: 'Reset diário registrado. Dashboard filtra por data automaticamente.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('[daily-reset] Erro:', err)
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
