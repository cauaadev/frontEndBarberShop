import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconChevronDown, IconLogOut, IconUser } from './Icons'

const ROLE_LABEL: Record<string, string> = {
  ADM: 'Admin', BARBER: 'Barbeiro', CLIENT: 'Cliente',
}

const ROLE_COLOR: Record<string, string> = {
  ADM: 'bg-brand-600/20 text-brand-300 border-brand-600/40',
  BARBER: 'bg-blue-600/20 text-blue-300 border-blue-600/40',
  CLIENT: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!user) return null

  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition-colors text-left"
      >
        <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{user.name}</p>
          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${ROLE_COLOR[user.role]}`}>
            {ROLE_LABEL[user.role]}
          </span>
        </div>
        <IconChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs text-zinc-500">Logado como</p>
            <p className="text-sm font-medium text-zinc-100">{user.name}</p>
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <IconUser className="h-4 w-4" />
            <span>Meu perfil</span>
          </button>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-900/30 transition-colors border-t border-zinc-800"
          >
            <IconLogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  )
}
