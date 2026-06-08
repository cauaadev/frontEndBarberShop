import { useEffect, useRef, useState } from 'react'
import { IconChevronDown, IconCheck, IconX } from './Icons'

export interface Option<T> {
  value: T
  label: string
  hint?: string
}

interface Props<T> {
  options: Option<T>[]
  value: T[]
  onChange: (next: T[]) => void
  placeholder?: string
  emptyHint?: string
}

export function MultiSelect<T extends string | number>({
  options, value, onChange, placeholder = 'Selecionar...', emptyHint = 'Nenhuma opção',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (v: T) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  const selectedOptions = options.filter((o) => value.includes(o.value))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between min-h-[42px] text-left"
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {selectedOptions.length === 0 ? (
            <span className="text-zinc-500">{placeholder}</span>
          ) : (
            selectedOptions.map((o) => (
              <span
                key={String(o.value)}
                className="inline-flex items-center gap-1 bg-brand-600/20 border border-brand-600/40 text-brand-200 text-xs px-2 py-0.5 rounded"
              >
                {o.label}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(o.value) }}
                  className="hover:text-white"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <IconChevronDown className={`h-4 w-4 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-md shadow-xl">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-zinc-500">{emptyHint}</p>
          ) : (
            options.map((o) => {
              const selected = value.includes(o.value)
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-zinc-800 transition-colors ${selected ? 'bg-zinc-800/60' : ''}`}
                >
                  <div>
                    <p className="text-zinc-100">{o.label}</p>
                    {o.hint && <p className="text-xs text-zinc-500">{o.hint}</p>}
                  </div>
                  {selected && <IconCheck className="h-4 w-4 text-brand-500" />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
