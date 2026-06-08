import { useEffect, useState } from 'react'
import { servicesApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { IconEdit, IconPlus, IconScissors, IconTrash } from '../components/Icons'
import { extractError, useToast } from '../components/Toast'
import type { Service, ServicePayload } from '../types/api'

const empty: ServicePayload = { serviceName: '', price: 0, description: '' }

export function ServicesPage() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdm = user?.role === 'ADM'

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<{ id: number | null; data: ServicePayload } | null>(null)

  const load = () => {
    setLoading(true)
    servicesApi.list().then(setServices).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (editing.id == null) {
        await servicesApi.create(editing.data)
        toast.success('Serviço criado')
      } else {
        await servicesApi.update(editing.id, editing.data)
        toast.success('Serviço atualizado')
      }
      setEditing(null)
      load()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (s: Service) => {
    if (!confirm(`Deletar "${s.serviceName}"?`)) return
    try {
      await servicesApi.delete(s.serviceId)
      toast.success('Serviço deletado')
      load()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  return (
    <div>
      <PageHeader
        title={isAdm ? 'Serviços' : 'Tabela de preços'}
        subtitle={isAdm ? 'Gerencie o catálogo da barbearia' : 'Confira os preços disponíveis'}
        actions={
          isAdm && (
            <Button onClick={() => setEditing({ id: null, data: { ...empty } })}
                    icon={<IconPlus className="h-4 w-4" />}>
              Novo serviço
            </Button>
          )
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-2/3 mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.serviceId} className="card card-hover flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-white">{s.serviceName}</h3>
                <span className="text-brand-500 font-bold whitespace-nowrap">
                  R$ {s.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-4 flex-1 min-h-[40px]">{s.description}</p>
              {isAdm && (
                <div className="flex gap-2 pt-3 border-t border-zinc-800">
                  <Button variant="secondary" size="sm" fullWidth
                          icon={<IconEdit className="h-3.5 w-3.5" />}
                          onClick={() => setEditing({
                            id: s.serviceId,
                            data: { serviceName: s.serviceName, price: s.price, description: s.description },
                          })}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" fullWidth
                          icon={<IconTrash className="h-3.5 w-3.5" />}
                          onClick={() => handleDelete(s)}>
                    Deletar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing && isAdm}
        onClose={() => setEditing(null)}
        title={editing?.id == null ? 'Novo serviço' : 'Editar serviço'}
        subtitle={editing?.id == null ? 'Adicione um novo serviço ao catálogo' : 'Atualize as informações'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>Salvar</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={editing.data.serviceName}
                     onChange={(e) => setEditing({ ...editing, data: { ...editing.data, serviceName: e.target.value } })} />
            </div>
            <div>
              <label className="label">Preço (R$)</label>
              <input type="number" step="0.01" className="input" value={editing.data.price}
                     onChange={(e) => setEditing({ ...editing, data: { ...editing.data, price: parseFloat(e.target.value) || 0 } })} />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea className="input resize-none" rows={3} value={editing.data.description}
                        onChange={(e) => setEditing({ ...editing, data: { ...editing.data, description: e.target.value } })} />
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
      <IconScissors className="h-12 w-12 text-zinc-700 mb-3" />
      <p className="text-zinc-400 font-medium">Nenhum serviço cadastrado</p>
      <p className="text-zinc-600 text-sm mt-1">Adicione serviços pra começar</p>
    </div>
  )
}
