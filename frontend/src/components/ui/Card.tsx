import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[3px] border border-ink/12 bg-white shadow-[0_1px_2px_rgba(22,33,44,0.04),0_4px_10px_-4px_rgba(22,33,44,0.08)] ${className}`}
    >
      {children}
    </div>
  )
}
