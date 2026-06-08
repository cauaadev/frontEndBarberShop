import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
