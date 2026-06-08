import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { IconAlert, IconCheckCircle, IconInfo, IconX } from './Icons'

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  notify: (kind: ToastKind, message: string) => void
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const COLORS: Record<ToastKind, string> = {
  success: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
  error: 'bg-red-900/90 border-red-700 text-red-100',
  info: 'bg-zinc-800/95 border-zinc-700 text-zinc-100',
}

const ICONS: Record<ToastKind, typeof IconCheckCircle> = {
  success: IconCheckCircle,
  error: IconAlert,
  info: IconInfo,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const value: ToastContextValue = {
    notify,
    success: (m) => notify('success', m),
    error: (m) => notify('error', m),
    info: (m) => notify('info', m),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg animate-toast-in ${COLORS[t.kind]}`}
            >
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm flex-1">{t.message}</p>
              <button
                onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                className="text-current/70 hover:text-current"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}

/** Helper pra extrair mensagem de erro de uma response axios. */
export function extractError(err: any, fallback = 'Algo deu errado'): string {
  const data = err?.response?.data
  if (!data) return err?.message ?? fallback
  if (typeof data === 'string') return data
  if (typeof data === 'object') return Object.values(data).join(', ')
  return fallback
}
