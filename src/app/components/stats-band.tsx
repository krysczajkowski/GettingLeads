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
        <div className="grid grid-cols-2 overflow-hidden rounded-[16px] border border-line-1 bg-white md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 px-5 py-6 md:px-7 md:py-8 ${i % 2 === 0 ? 'border-r border-line-1' : ''} ${i < 2 ? 'border-b border-line-1 md:border-b-0' : ''} ${i % 2 !== 0 && i < 3 ? 'md:border-r' : ''}`}
            >
              <div className="text-[32px] font-semibold leading-none tracking-[-0.025em] text-ink-1000 md:text-[44px]">
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
