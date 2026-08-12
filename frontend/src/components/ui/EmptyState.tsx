import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 rounded-[3px] border border-dashed border-ink/25 px-6 py-16 text-center">
      <span className="absolute left-3 top-3 h-2.5 w-2.5 border-l border-t border-ink/25" />
      <span className="absolute right-3 top-3 h-2.5 w-2.5 border-r border-t border-ink/25" />
      <span className="absolute bottom-3 left-3 h-2.5 w-2.5 border-b border-l border-ink/25" />
      <span className="absolute bottom-3 right-3 h-2.5 w-2.5 border-b border-r border-ink/25" />
      <p className="font-display text-base font-medium text-ink">{title}</p>
      {message && <p className="max-w-sm text-sm text-ink-soft">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
