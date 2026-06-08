import { NavLink, Outlet } from 'react-router-dom'
import { UserMenu } from './UserMenu'
import { IconCalendar, IconHome, IconScissors, IconUsers } from './Icons'
import type { ReactNode } from 'react'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <IconHome className="h-5 w-5" />, end: true },
  { to: '/schedules', label: 'Agendamentos', icon: <IconCalendar className="h-5 w-5" /> },
  { to: '/users', label: 'Pessoas', icon: <IconUsers className="h-5 w-5" /> },
  { to: '/services', label: 'Serviços', icon: <IconScissors className="h-5 w-5" /> },
]

export function Layout() {
  return (
    <div className="min-h-screen flex bg-zinc-950">
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-brand-500 tracking-tight">CORTE BRABO</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Painel de gestão</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border-l-2 border-brand-500 pl-[10px]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
