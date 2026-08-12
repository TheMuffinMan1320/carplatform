import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-ink text-vellum border border-ink hover:bg-blueprint disabled:bg-ink-faint disabled:border-ink-faint',
  secondary: 'bg-vellum text-ink border border-ink/30 hover:border-ink hover:bg-vellum-dim disabled:text-ink-faint disabled:border-ink/15',
  danger: 'bg-[#b3402c] text-vellum border border-[#b3402c] hover:bg-[#8f3222] disabled:bg-[#b3402c]/40 disabled:border-transparent',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:text-ink hover:border-ink/20 disabled:text-ink-faint',
}

export function Button({ variant = 'primary', loading, disabled, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[3px] px-4 py-2 font-display text-[13px] font-medium tracking-[0.01em] transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
