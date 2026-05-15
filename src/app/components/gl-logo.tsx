export default function GLLogo({ size = 24, inverted = false }: { size?: number; inverted?: boolean }) {
  const c = inverted ? '#FFFFFF' : '#15B36C'
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="GettingLeads">
      <circle cx="16" cy="16" r="13.5" stroke={c} strokeWidth="1.6" opacity={inverted ? 0.4 : 0.25}/>
      <circle cx="16" cy="16" r="8.5" stroke={c} strokeWidth="1.6" opacity={inverted ? 0.65 : 0.5}/>
      <path d="M16 16 L16 2.5 A13.5 13.5 0 0 1 27.7 9.25 Z" fill={c} fillOpacity={inverted ? 0.25 : 0.18}/>
      <path d="M16 2.5 A13.5 13.5 0 0 1 27.7 9.25" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2.4" fill={c}/>
      <circle cx="23.4" cy="7.4" r="2.1" fill={c}/>
    </svg>
  )
}
