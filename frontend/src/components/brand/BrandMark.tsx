interface BrandMarkProps {
  className?: string
  inverse?: boolean
}

/** Drafting-compass mark: two legs joined at a hinge, point set on a dimension tick — the platform's "measured, not marketed" idea reduced to one glyph. */
export function BrandMark({ className = 'h-6 w-6', inverse = false }: BrandMarkProps) {
  const stroke = inverse ? '#cfe0f5' : '#122a4e'
  const accent = '#2f6fed'
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="7" r="2.4" fill={stroke} />
      <path d="M16 9.4 L7 27" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 9.4 L25 27" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 19 L21.5 19" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7" cy="27" r="1.6" fill={stroke} />
      <circle cx="25" cy="27" r="1.6" fill={accent} />
    </svg>
  )
}
