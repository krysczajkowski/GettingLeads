'use client'

export function strengthOf(pw: string): number {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(s, 3)
}

export function StrengthMeter({ value }: { value: string }) {
  const s = strengthOf(value)
  const labels = ['Too short', 'Weak', 'Okay', 'Strong']
  const barColors = ['', 'bg-danger-500', 'bg-warn-500', 'bg-brand']
  return (
    <div className="mt-0.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-[2px] transition-colors duration-200 ${s > i ? barColors[s] : 'bg-surface-3'}`}
          />
        ))}
      </div>
      <span className="w-[60px] text-right font-mono text-[11px] text-ink-500">{labels[s]}</span>
    </div>
  )
}
