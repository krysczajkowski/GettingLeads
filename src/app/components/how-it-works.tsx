'use client'

import { useState, useEffect } from 'react'

function StepDemoBuyer() {
  const text = 'ecommerce founders shipping out of US, doing $50k-$500k MRR, frustrated with their current 3PL'
  const [typed, setTyped] = useState('')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 35)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full p-3">
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-500">buyer.txt</div>
      <div className="min-h-[70px] font-mono text-[12px] leading-[1.5] text-ink-1000">
        {typed}
        <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-[gl-pulse-dot_1s_steps(2)_infinite] bg-brand align-middle" />
      </div>
    </div>
  )
}

function StepDemoGroups() {
  const groups = [
    { name: 'Shopify Founders', count: '47k', checked: true },
    { name: 'DTC CMOs', count: '14k', checked: true },
    { name: 'Ecom Insiders', count: '31k', checked: true },
    { name: 'Indie Hackers', count: '54k', checked: false },
  ]

  return (
    <div className="flex w-full flex-col gap-1.5 p-3">
      {groups.map((g, i) => (
        <div key={i} className="flex items-center gap-2 rounded-[6px] border border-line-1 bg-white px-2 py-1.5 text-[12px]">
          <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border ${g.checked ? 'border-brand bg-brand' : 'border-line-2 bg-white'}`}>
            {g.checked && (
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="m5 12 4 4 10-10"/></svg>
            )}
          </span>
          <span className="font-medium text-ink-1000">{g.name}</span>
          <span className="ml-auto font-mono text-[10px] text-ink-500">{g.count}</span>
        </div>
      ))}
    </div>
  )
}

function StepDemoInbox() {
  const items = [
    { score: 94, who: 'Marisa R.', text: '3PL for skincare brands...' },
    { score: 88, who: 'Aria K.', text: 'Agency for creative testing...' },
    { score: 71, who: 'Jordan T.', text: 'Cold email warmup recs...' },
  ]

  return (
    <div className="flex w-full flex-col gap-1.5 p-3">
      {items.map((l, i) => (
        <div key={i} className="flex items-center gap-2 rounded-[6px] border border-line-1 bg-white px-2.5 py-2 text-[12px]">
          <span className={`inline-flex items-baseline gap-[3px] rounded-[6px] px-2 py-1 font-mono text-[12px] font-semibold ${l.score >= 80 ? 'bg-green-50 text-green-700' : 'bg-warn-50 text-warn-700'}`}>
            {l.score}<span className="text-[10px] font-normal opacity-50">/100</span>
          </span>
          <span className="hidden font-medium text-ink-1000 sm:inline">{l.who}</span>
          <span className="truncate text-ink-600">{l.text}</span>
        </div>
      ))}
    </div>
  )
}

export default function HowItWorks() {
  const steps = [
    {
      num: 'Step 1',
      title: 'Describe your buyer',
      desc: 'One paragraph. The product owner, their stack, the moment they need you. No keyword lists, no boolean queries.',
      demo: <StepDemoBuyer />,
    },
    {
      num: 'Step 2',
      title: 'Pick your groups',
      desc: 'Browse 1,800+ pre-indexed public groups, or paste a Facebook URL and we\'ll start monitoring within an hour.',
      demo: <StepDemoGroups />,
    },
    {
      num: 'Step 3',
      title: 'Wake up to leads',
      desc: 'Every morning, a ranked queue lands in your inbox. Open one, read the surrounding context, reply in one click.',
      demo: <StepDemoInbox />,
    },
  ]

  return (
    <section className="border-t border-line-1 py-16 md:py-[120px]" id="how">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Section head */}
        <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-20">
          <span className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600">
            <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
              <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
            </span>
            How it works
          </span>
          <h2 className="mt-4 text-[clamp(36px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000">
            Three steps. No prospecting list.
          </h2>
          <p className="mt-4 text-[18px] leading-relaxed text-ink-700">
            You tell us who you sell to. We watch the groups they hang out in. You wake up to a ranked queue of conversations to join.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex min-h-[320px] flex-col overflow-hidden rounded-[16px] border border-line-1 bg-white p-7 transition-all duration-[400ms] hover:-translate-y-0.5 hover:border-line-2 hover:shadow-card-hover"
            >
              <div className="font-mono text-[12px] tracking-[0.08em] text-ink-500">{step.num}</div>
              <div className="mt-2 text-[22px] font-semibold tracking-[-0.02em]">{step.title}</div>
              <div className="mt-2.5 text-[14px] leading-relaxed text-ink-700">{step.desc}</div>
              <div className="mt-auto flex min-h-[140px] items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-line-2 bg-surface-1">
                {step.demo}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
