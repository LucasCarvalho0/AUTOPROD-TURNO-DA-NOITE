'use client'

import { useState } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/Topbar'
import { EmployeeSelector } from '@/components/registrar/EmployeeSelector'
import { VersionSelector } from '@/components/registrar/VersionSelector'
import { VinScanner } from '@/components/registrar/VinScanner'
import { SuccessAnimation } from '@/components/registrar/SuccessAnimation'
import { useSoundFeedback } from '@/components/common/SoundFeedback'
import type { CarVersion } from '@/types'

interface LastRegistered {
  vin: string
  employeeName: string
  versao: CarVersion
  hora: string
}

export default function RegistrarMontagemPage() {
  const { activeEmployees, employees } = useEmployees()
  const { playSuccess, playError } = useSoundFeedback()

  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<CarVersion | null>(null)
  const [lastRegistered, setLastRegistered] = useState<LastRegistered | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId)

  async function handleScan(vin: string) {
    setError('')

    if (!selectedEmpId) {
      setError('Selecione um funcionário antes de bipar.')
      playError()
      return
    }
    if (!selectedVersion) {
      setError('Selecione a versão do carro antes de bipar.')
      playError()
      return
    }

    setLoading(true)
    const supabase = getSupabaseClient()

    // Check duplicate
    const { data: existing } = await supabase
      .from('productions')
      .select('id')
      .eq('vin', vin)
      .single()

    if (existing) {
      setError(`VIN ${vin} já foi registrado anteriormente!`)
      playError()
      setLoading(false)
      return
    }

    // Insert
    const { error: insertError } = await supabase.from('productions').insert({
      vin,
      employee_id: selectedEmpId,
      versao: selectedVersion,
    })

    if (insertError) {
      setError('Erro ao registrar: ' + insertError.message)
      playError()
      setLoading(false)
      return
    }

    playSuccess()
    setLastRegistered({
      vin,
      employeeName: selectedEmployee?.nome ?? '—',
      versao: selectedVersion,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    })
    setLoading(false)
  }

  const stepStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  }

  const StepHeader = ({ num, title }: { num: number; title: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
        style={{ background: 'var(--accent-yellow)', color: '#000' }}
      >
        {num}
      </div>
      <div className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </div>
    </div>
  )

  return (
    <>
      <Topbar title="Registrar Montagem" />
      <div className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 max-w-2xl">

        {/* Step 1: Employee */}
        <div style={stepStyle}>
          <StepHeader num={1} title="Selecionar Funcionário" />
          <EmployeeSelector
            employees={activeEmployees}
            selected={selectedEmpId}
            onSelect={setSelectedEmpId}
          />
        </div>

        {/* Step 2: Version */}
        <div style={stepStyle}>
          <StepHeader num={2} title="Selecionar Versão" />
          <VersionSelector selected={selectedVersion} onSelect={setSelectedVersion} />
        </div>

        {/* Step 3: VIN */}
        <div style={stepStyle}>
          <StepHeader num={3} title="Bipar VIN" />
          <VinScanner onScan={handleScan} disabled={loading} />
          {error && (
            <div
              className="mt-3 p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(232,72,85,0.1)',
                border: '1px solid rgba(232,72,85,0.25)',
                color: 'var(--accent-red)',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Success feedback */}
        {lastRegistered && (
          <SuccessAnimation
            vin={lastRegistered.vin}
            employeeName={lastRegistered.employeeName}
            versao={lastRegistered.versao}
            hora={lastRegistered.hora}
            onDismiss={() => setLastRegistered(null)}
          />
        )}
      </div>
    </>
  )
}
