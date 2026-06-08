import { api } from './client'
import type { Service, ServicePayload } from '../types/api'

export const servicesApi = {
  list: () => api.get<Service[]>('/service').then((r) => r.data),
  getById: (id: number) => api.get<Service>(`/service/${id}`).then((r) => r.data),
  create: (payload: ServicePayload) => api.post<Service>('/service', payload).then((r) => r.data),
  update: (id: number, payload: ServicePayload) =>
    api.put<Service>(`/service/${id}`, payload).then((r) => r.data),
  delete: (id: number) => api.delete(`/service/${id}`),
}
