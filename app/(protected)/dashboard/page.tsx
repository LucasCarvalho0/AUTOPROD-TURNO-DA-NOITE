'use client'

import { useSettings } from '@/hooks/useSettings'
import { useProductionRealtime } from '@/hooks/useProductionRealtime'
import { Topbar } from '@/components/layout/Topbar'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ProgressMeta } from '@/components/dashboard/ProgressMeta'
import { HourlyProductionChart } from '@/components/dashboard/HourlyProductionChart'
import { RealtimeRanking } from '@/components/dashboard/RealtimeRanking'
import { LastCarBiped } from '@/components/dashboard/LastCarBiped'

export default function DashboardPage() {
  const { settings } = useSettings()
  const {
    totalToday,
    hourlyData,
    ranking,
    lastProduction,
    loading,
  } = useProductionRealtime(settings.turno_inicio, settings.turno_fim)

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-5 pb-20 md:pb-5">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <span className="font-display text-lg" style={{ color: 'var(--text-secondary)' }}>
              Carregando dados...
            </span>
          </div>
        ) : (
          <>
            {/* Debug Label - Reset Industrial */}
            <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.03] w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-white/50">
                Operação Ativa: Bipados desde às 05:00 AM (Reset Diário)
              </span>
            </div>

            <StatsCards
              totalBipados={totalToday}
              meta={settings.meta}
              turnoInicio={settings.turno_inicio}
            />

            <ProgressMeta total={totalToday} meta={settings.meta} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-2">
                <HourlyProductionChart data={hourlyData} />
              </div>
              <div className="flex flex-col">
                <LastCarBiped last={lastProduction} />
                <div 
                  className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] flex-1 flex flex-col justify-center items-center text-center"
                >
                  <span className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Status do Turno</span>
                  <div className="text-xl font-bold text-white/80">
                    {totalToday} Veículos
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    Bipados desde ontem às {settings.turno_inicio}
                  </div>
                </div>
              </div>
            </div>

            <RealtimeRanking ranking={ranking} limit={5} />
          </>
        )}
      </div>
    </>
  )
}
