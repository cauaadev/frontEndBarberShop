import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { LoginResponse, UserRole } from '../types/api'
import { authApi } from '../api/auth'

interface AuthUser {
  userId: number
  name: string
  role: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (telefone: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (telefone: string, password: string) => {
    const res: LoginResponse = await authApi.login({ telefone, password })
    const u: AuthUser = { userId: res.userId, name: res.name, role: res.role }
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(res.token)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
