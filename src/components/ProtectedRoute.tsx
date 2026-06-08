import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/api'

interface Props {
  children: ReactNode
  requireRole?: UserRole | UserRole[]
}

export function ProtectedRoute({ children, requireRole }: Props) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requireRole) {
    const allowed = Array.isArray(requireRole) ? requireRole : [requireRole]
    if (!user || !allowed.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
