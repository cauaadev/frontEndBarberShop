import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { IconX } from './Icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${SIZES[size]} bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-modal-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
