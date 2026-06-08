import { api } from './client'
import type { Schedule, SchedulePayload, ScheduleStatus } from '../types/api'

export const schedulesApi = {
  list: (filters?: { status?: ScheduleStatus; clientId?: number; barberId?: number }) =>
    api.get<Schedule[]>('/schedule', { params: filters }).then((r) => r.data),

  getById: (id: number) => api.get<Schedule>(`/schedule/${id}`).then((r) => r.data),

  create: (payload: SchedulePayload) =>
    api.post<Schedule>('/schedule', payload).then((r) => r.data),

  update: (id: number, payload: SchedulePayload) =>
    api.put<Schedule>(`/schedule/${id}`, payload).then((r) => r.data),

  changeStatus: (id: number, status: ScheduleStatus) =>
    api.patch<Schedule>(`/schedule/${id}/status`, null, { params: { status } }).then((r) => r.data),

  delete: (id: number) => api.delete(`/schedule/${id}`),
}
