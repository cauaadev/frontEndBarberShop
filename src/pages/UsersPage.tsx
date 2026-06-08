import { useEffect, useState } from 'react'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { IconEdit, IconPlus, IconTrash, IconUser, IconUsers } from '../components/Icons'
import { extractError, useToast } from '../components/Toast'
import type { ClientCreatePayload, StaffCreatePayload, User, UserRole } from '../types/api'

type TabKey = 'clients' | 'staff'

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'Cliente', BARBER: 'Barbeiro', ADM: 'Admin',
}
const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
  BARBER: 'bg-blue-600/20 text-blue-300 border-blue-600/40',
  ADM: 'bg-brand-600/20 text-brand-300 border-brand-600/40',
}

const emptyClient: ClientCreatePayload = { name: '', telefone: '' }
const emptyStaff: StaffCreatePayload = { name: '', telefone: '', password: '', role: 'BARBER' }

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const isAdm = currentUser?.role === 'ADM'
  const toast = useToast()

  const [tab, setTab] = useState<TabKey>('clients')
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [creatingClient, setCreatingClient] = useState<ClientCreatePayload | null>(null)
  const [creatingStaff, setCreatingStaff] = useState<StaffCreatePayload | null>(null)

  const load = () => {
    setLoading(true)
    console.log('[UsersPage] load', { roleFilter, tab })

    const request = roleFilter === 'ALL'
      ? usersApi.list()
      : usersApi.listByRole(roleFilter)

    request
      .then((result) => {
        console.log('[UsersPage] resposta recebida', { count: result.length, result })
        const byRole = roleFilter === 'ALL'
          ? result
          : result.filter((u) => u.role === roleFilter)

        setUsers(tab === 'clients'
          ? byRole.filter((u) => u.role === 'CLIENT')
          : byRole.filter((u) => u.role !== 'CLIENT'))
      })
      .catch((err) => {
        console.error('[UsersPage] erro ao carregar', err)
        setUsers([])
        toast.error(extractError(err))
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [tab, roleFilter])

  // Auto-troca de tab ao escolher cargo no dropdown
  const handleRoleFilterChange = (value: 'ALL' | UserRole) => {
    setRoleFilter(value)
    if (value === 'CLIENT') setTab('clients')
    else if (value === 'BARBER' || value === 'ADM') setTab('staff')
  }

  const canEdit = (u: User) => isAdm || u.id === currentUser?.userId
  const canDelete = (_: User) => isAdm

  const handleDelete = async (u: User) => {
    if (!confirm(`Deletar ${u.name}?`)) return
    try {
      await usersApi.delete(u.id)
      toast.success('Removido com sucesso')
      load()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await usersApi.update(editing.id, {
        name: editing.name, telefone: editing.telefone, role: editing.role,
      })
      toast.success('Salvo')
      setEditing(null)
      load()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleCreateClient = async () => {
    if (!creatingClient) return
    setSaving(true)
    try {
      await usersApi.createClient(creatingClient)
      toast.success('Cliente cadastrado')
      setCreatingClient(null)
      load()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleCreateStaff = async () => {
    if (!creatingStaff) return
    setSaving(true)
    try {
      await usersApi.createStaff(creatingStaff)
      toast.success('Funcionário cadastrado')
      setCreatingStaff(null)
      load()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Pessoas"
        subtitle="Clientes da barbearia e funcionários do sistema"
        actions={
          tab === 'clients' ? (
            <Button icon={<IconPlus className="h-4 w-4" />}
                    onClick={() => setCreatingClient({ ...emptyClient })}>
              Novo cliente
            </Button>
          ) : isAdm ? (
            <Button icon={<IconPlus className="h-4 w-4" />}
                    onClick={() => setCreatingStaff({ ...emptyStaff })}>
              Novo funcionário
            </Button>
          ) : null
        }
      />

      {/* Tabs + filtro de rota */}
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-zinc-800">
        <div className="flex gap-1">
          <TabButton active={tab === 'clients'} onClick={() => setTab('clients')}>
            <IconUser className="h-4 w-4" /> Clientes
          </TabButton>
          <TabButton active={tab === 'staff'} onClick={() => setTab('staff')}>
            <IconUsers className="h-4 w-4" /> Funcionários
          </TabButton>
        </div>

        <div className="flex items-center gap-2 pb-3">
          <label className="text-xs text-zinc-400">Buscar:</label>
          <select
            className="input py-1 text-sm"
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value as 'ALL' | UserRole)}
          >
            <option value="ALL">Todos (findAll)</option>
            <option value="CLIENT">Apenas clientes (findByRole)</option>
            <option value="BARBER">Apenas barbeiros (findByRole)</option>
            <option value="ADM">Apenas admins (findByRole)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : users.length === 0 ? (
        <EmptyState kind={tab} />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr className="text-left text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                {tab === 'staff' && <th className="px-4 py-3 font-medium">Cargo</th>}
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{formatPhone(u.telefone)}</td>
                  {tab === 'staff' && (
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {canEdit(u) && (
                        <Button variant="ghost" size="sm" icon={<IconEdit className="h-3.5 w-3.5" />}
                                onClick={() => setEditing(u)}>Editar</Button>
                      )}
                      {canDelete(u) && (
                        <Button variant="ghost" size="sm" icon={<IconTrash className="h-3.5 w-3.5" />}
                                onClick={() => handleDelete(u)}
                                className="text-red-400 hover:bg-red-900/30">Remover</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: criar cliente */}
      <Modal
        open={!!creatingClient} onClose={() => setCreatingClient(null)}
        title="Novo cliente"
        subtitle="Cadastro rápido — só nome e telefone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreatingClient(null)}>Cancelar</Button>
            <Button onClick={handleCreateClient} loading={saving}>Cadastrar</Button>
          </>
        }
      >
        {creatingClient && (
          <div className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={creatingClient.name} autoFocus
                     onChange={(e) => setCreatingClient({ ...creatingClient, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={creatingClient.telefone} placeholder="11999999999"
                     onChange={(e) => setCreatingClient({ ...creatingClient, telefone: e.target.value.replace(/\D/g, '') })} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: criar funcionário */}
      <Modal
        open={!!creatingStaff} onClose={() => setCreatingStaff(null)}
        title="Novo funcionário"
        subtitle="Funcionários acessam o sistema com senha"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreatingStaff(null)}>Cancelar</Button>
            <Button onClick={handleCreateStaff} loading={saving}>Cadastrar</Button>
          </>
        }
      >
        {creatingStaff && (
          <div className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={creatingStaff.name} autoFocus
                     onChange={(e) => setCreatingStaff({ ...creatingStaff, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Telefone (vai ser usado pra login)</label>
              <input className="input" value={creatingStaff.telefone} placeholder="11999999999"
                     onChange={(e) => setCreatingStaff({ ...creatingStaff, telefone: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div>
              <label className="label">Senha inicial</label>
              <input type="password" className="input" value={creatingStaff.password}
                     onChange={(e) => setCreatingStaff({ ...creatingStaff, password: e.target.value })} />
              <p className="text-xs text-zinc-500 mt-1">Mínimo 6 caracteres. Funcionário pode trocar depois.</p>
            </div>
            <div>
              <label className="label">Cargo</label>
              <select className="input" value={creatingStaff.role}
                      onChange={(e) => setCreatingStaff({ ...creatingStaff, role: e.target.value as 'BARBER' | 'ADM' })}>
                <option value="BARBER">Barbeiro</option>
                <option value="ADM">Admin</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: editar */}
      <Modal
        open={!!editing} onClose={() => setEditing(null)}
        title="Editar"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} loading={saving}>Salvar</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={editing.name}
                     onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={editing.telefone}
                     onChange={(e) => setEditing({ ...editing, telefone: e.target.value.replace(/\D/g, '') })} />
            </div>
            {isAdm && (
              <div>
                <label className="label">Cargo</label>
                <select className="input" value={editing.role}
                        onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })}>
                  <option value="CLIENT">Cliente</option>
                  <option value="BARBER">Barbeiro</option>
                  <option value="ADM">Admin</option>
                </select>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'border-brand-500 text-white'
          : 'border-transparent text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

function SkeletonTable() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-zinc-800/50 rounded" />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ kind }: { kind: TabKey }) {
  const isClients = kind === 'clients'
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      {isClients ? <IconUser className="h-12 w-12 text-zinc-700 mb-3" />
                 : <IconUsers className="h-12 w-12 text-zinc-700 mb-3" />}
      <p className="text-zinc-400 font-medium">
        {isClients ? 'Nenhum cliente cadastrado' : 'Nenhum funcionário cadastrado'}
      </p>
      <p className="text-zinc-600 text-sm mt-1">
        {isClients ? 'Clique em "Novo cliente" pra começar' : 'Adicione barbeiros e admins'}
      </p>
    </div>
  )
}

function formatPhone(p: string): string {
  if (p.length === 11) return `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7)}`
  if (p.length === 10) return `(${p.slice(0, 2)}) ${p.slice(2, 6)}-${p.slice(6)}`
  return p
}
