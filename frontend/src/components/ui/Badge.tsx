import type { ReactNode } from 'react'
import { BADGE_DOT_CLASSES, BADGE_TONE_CLASSES, type BadgeTone } from '../../lib/enumLabels'

interface BadgeProps {
  tone: BadgeTone
  children: ReactNode
}

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] ${BADGE_TONE_CLASSES[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${BADGE_DOT_CLASSES[tone]}`} />
      {children}
    </span>
  )
}
