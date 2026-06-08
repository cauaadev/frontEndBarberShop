import { api } from './client'
import type { ClientCreatePayload, StaffCreatePayload, User, UserRole, UserUpdatePayload } from '../types/api'

export const usersApi = {
  list: () =>
    api.get<User[]>('/user/findAll').then((r) => r.data),

  listByRole: (role: UserRole) =>
    api.get<User[]>('/user', { params: { role } }).then((r) => r.data),

  getById: (id: number) =>
    api.get<User>(`/user/${id}`).then((r) => r.data),

  /** Cria cliente (sem senha). Qualquer funcionário pode. */
  createClient: (payload: ClientCreatePayload) =>
    api.post<User>('/user/client', payload).then((r) => r.data),

  /** Cria funcionário (BARBER/ADM). Só ADM pode. */
  createStaff: (payload: StaffCreatePayload) =>
    api.post<User>('/user/staff', payload).then((r) => r.data),

  update: (id: number, payload: UserUpdatePayload) =>
    api.put<User>(`/user/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/user/${id}`),
}
