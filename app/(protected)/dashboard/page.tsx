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
              <div>
                <LastCarBiped last={lastProduction} />
              </div>
            </div>

            <RealtimeRanking ranking={ranking} limit={5} />
          </>
        )}
      </div>
    </>
  )
}
