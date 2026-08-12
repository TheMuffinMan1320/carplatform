import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  inverse?: boolean
  children: ReactNode
}

function FieldWrapper({ label, error, hint, inverse, children }: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && (
        <span
          className={`font-mono text-[11px] font-medium uppercase tracking-[0.08em] ${inverse ? 'text-blueprint-line-dim' : 'text-ink-soft'}`}
        >
          {label}
        </span>
      )}
      {children}
      {hint && !error && (
        <span className={`font-mono text-[11px] ${inverse ? 'text-blueprint-line-dim' : 'text-ink-faint'}`}>{hint}</span>
      )}
      {error && <span className="font-mono text-[11px] text-[#b3402c]">{error}</span>}
    </label>
  )
}

const FIELD_CLASSES =
  'rounded-[3px] border border-ink/25 bg-vellum px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal'
const FIELD_CLASSES_INVERSE =
  'rounded-[3px] border border-blueprint-line-dim/50 bg-blueprint-deep/60 px-3 py-2 text-sm text-blueprint-line placeholder:text-blueprint-line-dim focus:border-blueprint-line focus:outline-none focus:ring-1 focus:ring-blueprint-line'
const FIELD_ERROR_CLASSES = 'border-[#b3402c] focus:border-[#b3402c] focus:ring-[#b3402c]'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  inverse?: boolean
}

export function Input({ label, error, hint, inverse, className = '', ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} inverse={inverse}>
      <input className={`${inverse ? FIELD_CLASSES_INVERSE : FIELD_CLASSES} ${error ? FIELD_ERROR_CLASSES : ''} ${className}`} {...rest} />
    </FieldWrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  inverse?: boolean
}

export function Select({ label, error, hint, inverse, className = '', children, ...rest }: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} inverse={inverse}>
      <select className={`${inverse ? FIELD_CLASSES_INVERSE : FIELD_CLASSES} ${error ? FIELD_ERROR_CLASSES : ''} ${className}`} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function TextArea({ label, error, hint, className = '', ...rest }: TextAreaProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <textarea className={`${FIELD_CLASSES} ${error ? FIELD_ERROR_CLASSES : ''} ${className}`} {...rest} />
    </FieldWrapper>
  )
}
