interface VehicleBlueprintProps {
  className?: string
  variant?: 'compact' | 'executive'
  stroke?: string
  showDimensions?: boolean
}

const PROFILES = {
  compact: {
    body: 'M20,150 L20,132 C20,120 30,110 46,106 L86,90 C102,74 124,64 148,64 L270,64 C292,64 312,76 324,92 L350,108 C374,112 392,120 402,132 L402,150',
    beltStart: 88,
    beltEnd: 324,
    wheelLeft: 94,
    wheelRight: 332,
    archLeft: 64,
    archRight: 302,
    roofY: 64,
    lengthLabel: '179.2 IN',
    heightLabel: '56.4 IN',
  },
  executive: {
    body: 'M14,150 L14,128 C14,116 24,106 40,103 L82,84 C100,68 126,58 154,58 L296,58 C322,58 344,70 358,90 L382,106 C404,110 420,120 428,132 L428,150',
    beltStart: 82,
    beltEnd: 358,
    wheelLeft: 88,
    wheelRight: 382,
    archLeft: 58,
    archRight: 352,
    roofY: 58,
    lengthLabel: '196.8 IN',
    heightLabel: '58.1 IN',
  },
} as const

/** Vehicle rendered as a measured technical drawing, standing in for a photo — the platform has no image-upload endpoint, and this is the world's own answer to that gap. Dimension figures are illustrative (schematic, "scale n.t.s."), not per-vehicle data — the API has no length/height fields. */
export function VehicleBlueprint({ className = 'h-full w-full', variant = 'compact', stroke = 'currentColor', showDimensions = false }: VehicleBlueprintProps) {
  const p = PROFILES[variant]
  const lengthX1 = p.archLeft - 20
  const lengthX2 = p.archRight + 80
  return (
    <svg viewBox="0 0 440 178" className={className} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
      <line x1="0" y1="150" x2="440" y2="150" strokeOpacity="0.3" strokeWidth={1} />
      <path d={`M${p.archLeft},150 a30,30 0 0 1 60,0`} strokeOpacity="0.45" strokeWidth={1.5} />
      <path d={`M${p.archRight},150 a30,30 0 0 1 60,0`} strokeOpacity="0.45" strokeWidth={1.5} />
      <path d={p.body} />
      <line x1={p.beltStart} y1={variant === 'executive' ? 84 : 90} x2={p.beltEnd} y2={variant === 'executive' ? 90 : 96} strokeOpacity="0.5" strokeWidth={1} strokeDasharray="1 5" />
      <circle cx={p.wheelLeft} cy="150" r="22" />
      <circle cx={p.wheelLeft} cy="150" r="4.5" fill={stroke} stroke="none" />
      <circle cx={p.wheelRight} cy="150" r="22" />
      <circle cx={p.wheelRight} cy="150" r="4.5" fill={stroke} stroke="none" />
      {showDimensions && (
        <g strokeOpacity="0.55" strokeWidth={1}>
          {/* overall length, top */}
          <line x1={lengthX1} y1="16" x2={lengthX2} y2="16" />
          <line x1={lengthX1} y1="11" x2={lengthX1} y2="21" />
          <line x1={lengthX2} y1="11" x2={lengthX2} y2="21" />
          <text
            x={(lengthX1 + lengthX2) / 2}
            y="9"
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="9"
            letterSpacing="1"
            fill={stroke}
            fillOpacity="0.75"
            stroke="none"
          >
            {p.lengthLabel}
          </text>
          {/* overall height, left */}
          <line x1="8" y1={p.roofY} x2="8" y2="150" />
          <line x1="3" y1={p.roofY} x2="13" y2={p.roofY} />
          <line x1="3" y1="150" x2="13" y2="150" />
          <text
            x="8"
            y={(p.roofY + 150) / 2}
            transform={`rotate(-90 8 ${(p.roofY + 150) / 2})`}
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="8"
            letterSpacing="1"
            fill={stroke}
            fillOpacity="0.75"
            stroke="none"
          >
            {p.heightLabel}
          </text>
        </g>
      )}
    </svg>
  )
}
