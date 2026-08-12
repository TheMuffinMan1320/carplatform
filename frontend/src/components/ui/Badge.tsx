import type { ReactNode } from 'react'
import { BADGE_TONE_CLASSES, type BadgeTone } from '../../lib/enumLabels'

interface BadgeProps {
  tone: BadgeTone
  children: ReactNode
}

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONE_CLASSES[tone]}`}>
      {children}
    </span>
  )
}
