'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Employee, EmployeeForm } from '@/types'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('nome')

    if (error) {
      setError(error.message)
    } else {
      setEmployees((data ?? []) as Employee[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEmployees()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('employees-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        fetchEmployees()
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [fetchEmployees])

  const createEmployee = async (form: EmployeeForm) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('employees')
      .insert({ nome: form.nome, ativo: form.ativo ?? true } as any)
      .select()
      .single()

    if (error) return { error: error.message }
    return { data: data as Employee }
  }

  const updateEmployee = async (id: string, form: Partial<EmployeeForm>) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('employees')
      .update({ ...form, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) return { error: error.message }
    return { data: data as Employee }
  }

  const deleteEmployee = async (id: string) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) return { error: error.message }
    return { success: true }
  }

  const toggleEmployee = async (id: string, ativo: boolean) => {
    return updateEmployee(id, { ativo: !ativo })
  }

  return {
    employees,
    activeEmployees: employees.filter((e) => e.ativo),
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployee,
    refetch: fetchEmployees,
  }
}
