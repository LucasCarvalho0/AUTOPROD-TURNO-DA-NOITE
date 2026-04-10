import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@/types'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) return null
  return session
}

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data } = await supabase
    .from('users')
    .select('*, cargo')
    .eq('id', user.id)
    .single()

  return data as User | null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireAdmin() {
  const user = await getUser()
  if (!user || user.tipo !== 'admin') {
    redirect('/login')
  }
  return user
}

export async function signIn(matricula: string, senha: string) {
  const supabase = await createClient()

  // Sign in with email pattern based on matricula
  const email = `${matricula}@autoprod.internal`
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })

  if (error) {
    return { error: 'Matrícula ou senha incorreta' }
  }

  // Get user profile data
  const { data: userData } = await supabase
    .from('users')
    .select('id, matricula, nome, tipo, cargo')
    .eq('id', data.user.id)
    .single()

  return { data, user: userData }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
