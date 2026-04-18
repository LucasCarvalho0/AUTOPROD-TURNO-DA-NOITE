import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  console.log('Testing connection to Supabase...')
  const { data, error } = await supabase.from('settings').select('*').limit(1)

  if (error) {
    console.error('Database Connection Error:', error)
  } else {
    console.log('Connection Successful! Settings found:', data)
  }
}

testConnection()
