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
  const [pendingVin, setPendingVin] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId)

  async function handleScan(vin: string) {
    setError('')
    setLoading(true)
    
    // Check duplicate before even showing the confirmation card to save time
    const supabase = getSupabaseClient()
    const { data: existing } = await supabase
      .from('productions')
      .select('id')
      .eq('vin', vin)
      .maybeSingle()

    if (existing) {
      setError(`O VIN ${vin} já foi registrado anteriormente!`)
      playError()
      setLoading(false)
      return
    }

    setPendingVin(vin)
    setLoading(false)
  }

  async function handleSave() {
    if (!pendingVin || !selectedEmpId || !selectedVersion) return
    
    setError('')
    setLoading(true)
    const supabase = getSupabaseClient()

    // Insert
    const { error: insertError } = await supabase.from('productions').insert({
      vin: pendingVin,
      employee_id: selectedEmpId,
      versao: selectedVersion,
    })

    if (insertError) {
      setError('Erro ao salvar no banco: ' + insertError.message)
      playError()
      setLoading(false)
      return
    }

    playSuccess()
    setLastRegistered({
      vin: pendingVin,
      employeeName: selectedEmployee?.nome ?? '—',
      versao: selectedVersion,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    })
    
    setPendingVin(null)
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

        {!pendingVin ? (
          <>
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
            <div 
              style={{
                ...stepStyle,
                opacity: (!selectedEmpId || !selectedVersion) ? 0.6 : 1,
                pointerEvents: (!selectedEmpId || !selectedVersion) ? 'none' : 'auto',
              }}
            >
              <StepHeader num={3} title="Bipar VIN" />
              
              {(!selectedEmpId || !selectedVersion) && (
                <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-tertiary)', border: '1px dashed var(--border-subtle)' }}>
                  ⚠️ Complete os passos 1 e 2 para liberar o scanner.
                </div>
              )}

              <VinScanner onScan={handleScan} disabled={loading || !selectedEmpId || !selectedVersion} />
            </div>
          </>
        ) : (
          /* Step 4: Final Confirmation */
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div 
              style={{
                ...stepStyle,
                border: '2px solid var(--accent-yellow)',
                background: 'rgba(245,184,0,0.05)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    Confirmar Dados
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Verifique as informações antes de salvar
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>Funcionário</span>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{selectedEmployee?.nome}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>Versão</span>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{selectedVersion}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>Código VIN</span>
                  <p className="font-display font-black text-2xl tracking-widest text-yellow-400">{pendingVin}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-5 rounded-xl font-display font-black text-xl tracking-widest shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
                  style={{ background: 'var(--accent-yellow)', color: '#000' }}
                >
                  {loading ? 'SALVANDO...' : 'SALVAR MONTAGEM'}
                </button>
                <button
                  onClick={() => setPendingVin(null)}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="mt-3 p-3 rounded-lg text-sm text-center"
            style={{
              background: 'rgba(232,72,85,0.1)',
              border: '1px solid rgba(232,72,85,0.25)',
              color: 'var(--accent-red)',
            }}
          >
            {error}
          </div>
        )}

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
