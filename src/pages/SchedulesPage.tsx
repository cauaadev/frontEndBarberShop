import { useEffect, useMemo, useState } from 'react'
import { schedulesApi } from '../api/schedules'
import { usersApi } from '../api/users'
import { servicesApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { MultiSelect } from '../components/MultiSelect'
import { IconCalendar, IconCheck, IconClock, IconPlus, IconTrash, IconX } from '../components/Icons'
import { extractError, useToast } from '../components/Toast'
import type { Schedule, SchedulePayload, ScheduleStatus, Service, User } from '../types/api'

const STATUS_META: Record<ScheduleStatus, { label: string; color: string; icon: typeof IconClock }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-900/40 text-yellow-300 border-yellow-800', icon: IconClock },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-900/40 text-blue-300 border-blue-800', icon: IconCheck },
  CONCLUIDO: { label: 'Concluído', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800', icon: IconCheck },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-900/40 text-red-300 border-red-800', icon: IconX },
}

const emptyPayload: SchedulePayload = { clientId: 0, barberIds: [], serviceIds: [], date: '' }

export function SchedulesPage() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdm = user?.role === 'ADM'
  const isBarber = user?.role === 'BARBER'

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [barbers, setBarbers] = useState<User[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | ''>('')
  const [creating, setCreating] = useState<SchedulePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientSearch, setClientSearch] = useState('')

  const loadSchedules = () => {
    setLoading(true)
    schedulesApi.list(statusFilter ? { status: statusFilter } : undefined)
      .then(setSchedules).finally(() => setLoading(false))
  }
  useEffect(loadSchedules, [statusFilter])

  // Listas auxiliares (clientes, barbeiros, serviços) pra montar agendamento
  useEffect(() => {
    usersApi.list('CLIENT').then(setClients).catch(() => setClients([]))
    usersApi.list('BARBER').then(setBarbers).catch(() => setBarbers([]))
    servicesApi.list().then(setServices).catch(() => setServices([]))
  }, [])

  const handleChangeStatus = async (id: number, status: ScheduleStatus) => {
    try {
      await schedulesApi.changeStatus(id, status)
      toast.success(`Marcado como ${STATUS_META[status].label.toLowerCase()}`)
      loadSchedules()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deletar este agendamento?')) return
    try {
      await schedulesApi.delete(id)
      toast.success('Agendamento removido')
      loadSchedules()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const handleCreate = async () => {
    if (!creating) return
    if (!creating.clientId) return toast.error('Escolha um cliente')
    if (!creating.barberIds.length) return toast.error('Escolha pelo menos 1 barbeiro')
    if (!creating.serviceIds.length) return toast.error('Escolha pelo menos 1 serviço')
    if (!creating.date) return toast.error('Escolha data e hora')

    setSaving(true)
    try {
      await schedulesApi.create(creating)
      toast.success('Agendamento criado')
      setCreating(null)
      setClientSearch('')
      loadSchedules()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const totalPrice = useMemo(() => {
    if (!creating) return 0
    return services
      .filter((s) => creating.serviceIds.includes(s.serviceId))
      .reduce((sum, s) => sum + s.price, 0)
  }, [creating, services])

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients
    const q = clientSearch.toLowerCase()
    return clients.filter((c) =>
      c.name.toLowerCase().includes(q) || c.telefone.includes(q)
    )
  }, [clients, clientSearch])

  const canChangeStatus = isAdm || isBarber
  const canDelete = isAdm

  return (
    <div>
      <PageHeader
        title={isBarber ? 'Meus atendimentos' : 'Agendamentos'}
        subtitle={
          isBarber ? 'Atendimentos onde você está escalado'
                   : 'Todos os agendamentos da barbearia'
        }
        actions={
          <>
            <select className="input w-auto" value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ScheduleStatus | '')}>
              <option value="">Todos os status</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <Button icon={<IconPlus className="h-4 w-4" />}
                    onClick={() => setCreating({ ...emptyPayload })}>
              Novo
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-1/3 mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-2/3 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {schedules.map((s) => {
            const status = STATUS_META[s.status]
            const StatusIcon = status.icon
            return (
              <div key={s.scheduleId} className="card card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg text-white">{s.clientName}</p>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {new Date(s.date).toLocaleString('pt-BR', {
                        weekday: 'short', day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-zinc-500">Barbeiros: </span>
                    <span className="text-zinc-200">{s.barberNames.join(', ')}</span>
                  </p>
                  <p>
                    <span className="text-zinc-500">Serviços: </span>
                    <span className="text-zinc-200">{s.serviceNames.join(', ')}</span>
                  </p>
                </div>

                {((canChangeStatus && (s.status === 'PENDENTE' || s.status === 'CONFIRMADO')) || canDelete) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-800">
                    {canChangeStatus && s.status === 'PENDENTE' && (
                      <Button variant="secondary" size="sm" icon={<IconCheck className="h-3.5 w-3.5" />}
                              onClick={() => handleChangeStatus(s.scheduleId, 'CONFIRMADO')}>
                        Confirmar
                      </Button>
                    )}
                    {canChangeStatus && (s.status === 'PENDENTE' || s.status === 'CONFIRMADO') && (
                      <>
                        <Button variant="secondary" size="sm"
                                onClick={() => handleChangeStatus(s.scheduleId, 'CONCLUIDO')}>
                          Concluir
                        </Button>
                        <Button variant="secondary" size="sm"
                                onClick={() => handleChangeStatus(s.scheduleId, 'CANCELADO')}>
                          Cancelar
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-900/30 ml-auto"
                              icon={<IconTrash className="h-3.5 w-3.5" />}
                              onClick={() => handleDelete(s.scheduleId)}>
                        Remover
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!creating} onClose={() => { setCreating(null); setClientSearch('') }}
        title="Novo agendamento"
        subtitle="Escolha o cliente, barbeiros, serviços e horário"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreating(null); setClientSearch('') }}>Cancelar</Button>
            <Button onClick={handleCreate} loading={saving}>Criar agendamento</Button>
          </>
        }
      >
        {creating && (
          <div className="space-y-4">
            <div>
              <label className="label">Cliente</label>
              {clients.length === 0 ? (
                <div className="px-3 py-2 bg-yellow-900/20 border border-yellow-800 text-yellow-300 text-sm rounded-md">
                  Nenhum cliente cadastrado. Vá em <strong>Pessoas</strong> primeiro.
                </div>
              ) : (
                <>
                  <input className="input mb-2" placeholder="Buscar por nome ou telefone..."
                         value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                  <select className="input" value={creating.clientId}
                          onChange={(e) => setCreating({ ...creating, clientId: Number(e.target.value) })}>
                    <option value={0}>Selecione um cliente</option>
                    {filteredClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.telefone}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div>
              <label className="label">Barbeiros</label>
              <MultiSelect
                options={barbers.map((b) => ({ value: b.id, label: b.name }))}
                value={creating.barberIds}
                onChange={(ids) => setCreating({ ...creating, barberIds: ids })}
                placeholder="Selecionar barbeiros"
                emptyHint="Nenhum barbeiro cadastrado"
              />
            </div>

            <div>
              <label className="label">Serviços</label>
              <MultiSelect
                options={services.map((s) => ({
                  value: s.serviceId,
                  label: s.serviceName,
                  hint: `R$ ${s.price.toFixed(2)}`,
                }))}
                value={creating.serviceIds}
                onChange={(ids) => setCreating({ ...creating, serviceIds: ids })}
                placeholder="Selecionar serviços"
                emptyHint="Nenhum serviço cadastrado"
              />
              {creating.serviceIds.length > 0 && (
                <div className="mt-2 flex items-center justify-between px-3 py-2 bg-brand-600/10 border border-brand-600/30 rounded-md">
                  <span className="text-xs text-zinc-400">Total estimado</span>
                  <span className="text-brand-400 font-semibold">R$ {totalPrice.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div>
              <label className="label">Data e hora</label>
              <input type="datetime-local" className="input" value={creating.date}
                     onChange={(e) => setCreating({ ...creating, date: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <IconCalendar className="h-12 w-12 text-zinc-700 mb-3" />
      <p className="text-zinc-400 font-medium">Nenhum agendamento</p>
      <p className="text-zinc-600 text-sm mt-1">Tudo limpo por aqui</p>
    </div>
  )
}
