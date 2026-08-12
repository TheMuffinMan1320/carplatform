import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
}

function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      {children}
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  )
}

const FIELD_CLASSES =
  'rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500'
const FIELD_ERROR_CLASSES = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', ...rest }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <input className={`${FIELD_CLASSES} ${error ? FIELD_ERROR_CLASSES : ''} ${className}`} {...rest} />
    </FieldWrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
}

export function Select({ label, error, hint, className = '', children, ...rest }: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select className={`${FIELD_CLASSES} ${error ? FIELD_ERROR_CLASSES : ''} ${className}`} {...rest}>
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
