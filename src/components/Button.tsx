import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { IconLoader } from './Icons'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 hover:bg-brand-700 active:bg-brand-700 text-white shadow-sm shadow-brand-900/50',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-700 text-zinc-100 border border-zinc-700',
  danger: 'bg-red-800 hover:bg-red-900 active:bg-red-900 text-white',
  ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-300',
}

const SIZES: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  fullWidth,
  className = '',
  disabled,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <IconLoader className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
