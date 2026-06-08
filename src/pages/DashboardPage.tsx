import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { schedulesApi } from '../api/schedules'
import { usersApi } from '../api/users'
import { servicesApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { IconCalendar, IconClock, IconScissors, IconUser } from '../components/Icons'
import type { Schedule } from '../types/api'

export function DashboardPage() {
  const { user } = useAuth()
  const isAdm = user?.role === 'ADM'
  const isBarber = user?.role === 'BARBER'

  const [stats, setStats] = useState({
    schedules: 0, clients: 0, services: 0, pendentes: 0,
  })
  const [upcoming, setUpcoming] = useState<Schedule[]>([])

  useEffect(() => {
    Promise.all([
      schedulesApi.list().catch(() => []),
      schedulesApi.list({ status: 'PENDENTE' }).catch(() => []),
      servicesApi.list().catch(() => []),
      usersApi.list('CLIENT').catch(() => []),
    ]).then(([sch, pend, srv, cli]) => {
      setStats({
        schedules: sch.length,
        pendentes: pend.length,
        services: srv.length,
        clients: cli.length,
      })
      const sorted = [...sch].sort((a: Schedule, b: Schedule) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      setUpcoming(sorted.slice(0, 5))
    })
  }, [])

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0]}`}
        subtitle={
          isAdm ? 'Visão geral da barbearia'
                : isBarber ? 'Seus atendimentos de hoje'
                : ''
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={isBarber ? 'Meus atendimentos' : 'Agendamentos'}
                  value={stats.schedules}
                  icon={<IconCalendar className="h-5 w-5" />} />
        <StatCard label="Pendentes" value={stats.pendentes} highlight
                  icon={<IconClock className="h-5 w-5" />} />
        <StatCard label="Clientes" value={stats.clients}
                  icon={<IconUser className="h-5 w-5" />} />
        <StatCard label="Serviços" value={stats.services}
                  icon={<IconScissors className="h-5 w-5" />} />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <IconClock className="h-5 w-5 text-brand-500" />
          Próximos agendamentos
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-zinc-500 text-sm py-6 text-center">Nenhum agendamento programado.</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {upcoming.map((s) => (
              <div key={s.scheduleId} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-zinc-100 font-medium">{s.clientName}</p>
                  <p className="text-xs text-zinc-500">
                    {s.serviceNames.join(', ')} — com {s.barberNames.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-300">
                    {new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(s.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, highlight }: {
  label: string; value: number; icon: ReactNode; highlight?: boolean
}) {
  return (
    <div className={`card card-hover ${highlight ? 'border-brand-600/50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-zinc-400">{label}</p>
        <div className={highlight ? 'text-brand-500' : 'text-zinc-500'}>{icon}</div>
      </div>
      <p className={`text-3xl font-bold ${highlight ? 'text-brand-400' : 'text-white'}`}>{value}</p>
    </div>
  )
}
