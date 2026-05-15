'use client'

const groups = [
  { name: 'Shopify Founders', count: '47k' },
  { name: 'SaaS Operators', count: '22k' },
  { name: 'DTC CMOs', count: '14k' },
  { name: 'Agency Owners', count: '19k' },
  { name: 'Ecom Insiders', count: '31k' },
  { name: 'B2B SaaS Founders', count: '28k' },
  { name: 'Indie Hackers', count: '54k' },
  { name: 'CFO Network', count: '9k' },
  { name: 'PLG Collective', count: '12k' },
  { name: 'Cold Email Wizards', count: '8k' },
]

const all = [...groups, ...groups]

export default function TrustMarquee() {
  return (
    <section className="border-y border-line-1 bg-surface-1 py-12">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mb-[18px] text-center font-mono text-[12px] uppercase tracking-[0.08em] text-ink-500">
          Currently monitoring 1,847 groups · 12.6M members
        </div>
        <div
          className="flex overflow-hidden"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div className="flex shrink-0 animate-[gl-marquee_40s_linear_infinite] gap-12 pr-12">
            {all.map((g, i) => (
              <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap text-[16px] text-ink-700">
                <svg className="text-brand opacity-70" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0"/><path d="M17 4a4 4 0 0 1 0 8"/><path d="M23 21a8 8 0 0 0-4-7"/>
                </svg>
                {g.name}
                <span className="font-mono text-[12px] text-ink-500">{g.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
