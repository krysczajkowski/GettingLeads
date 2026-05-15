'use client'

import NumTicker from './num-ticker'

export default function StatsBand() {
  const stats = [
    { num: 1847, label: 'groups monitored', format: (n: number) => Math.round(n).toLocaleString() },
    { num: 12.6, label: 'million members reached', suffix: 'M', format: (n: number) => n.toFixed(1) },
    { num: 284, label: 'leads scored / day · avg', format: (n: number) => Math.round(n).toLocaleString() },
    { num: 87, label: 'reply rate on top decile', suffix: '%', format: (n: number) => String(Math.round(n)) },
  ]

  return (
    <section className="border-t border-line-1 py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-4 overflow-hidden rounded-[16px] border border-line-1 bg-white">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 px-7 py-8 ${i < 3 ? 'border-r border-line-1' : ''}`}
            >
              <div className="text-[44px] font-semibold leading-none tracking-[-0.025em] text-ink-1000">
                <NumTicker to={s.num} format={s.format} />
                {s.suffix && <span>{s.suffix}</span>}
              </div>
              <div className="font-mono text-[13px] uppercase tracking-[0.06em] text-ink-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
