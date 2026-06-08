export type UserRole = 'BARBER' | 'CLIENT' | 'ADM'

export type ScheduleStatus = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO'

export interface User {
  id: number
  name: string
  telefone: string
  role: UserRole
}

/** Cliente — sem senha, cadastrado pelo funcionário. */
export interface ClientCreatePayload {
  name: string
  telefone: string
}

/** Funcionário — com senha pra login. */
export interface StaffCreatePayload {
  name: string
  telefone: string
  password: string
  role: 'BARBER' | 'ADM'
}

export interface UserUpdatePayload {
  name: string
  telefone: string
  role: UserRole
}

export interface LoginPayload {
  telefone: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  name: string
  role: UserRole
}

export interface Service {
  serviceId: number
  serviceName: string
  price: number
  description: string
}

export interface ServicePayload {
  serviceName: string
  price: number
  description: string
}

export interface Schedule {
  scheduleId: number
  clientId: number
  clientName: string
  barberNames: string[]
  serviceNames: string[]
  status: ScheduleStatus
  date: string
}

export interface SchedulePayload {
  clientId: number
  barberIds: number[]
  serviceIds: number[]
  date: string
}
