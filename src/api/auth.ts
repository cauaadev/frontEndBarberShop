import { api } from './client'
import type { LoginPayload, LoginResponse } from '../types/api'

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),
}
