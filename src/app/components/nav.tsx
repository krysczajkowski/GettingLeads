'use client'

import { useState } from 'react'
import Link from 'next/link'
import GLLogo from './gl-logo'

const ArrowRight = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
)

const navLinks = [
  { href: '#product', label: 'Product' },
  { href: '#how', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-line-1 bg-white/72 backdrop-blur-[14px]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-center gap-9">
          <a href="#" className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em] text-ink-1000 no-underline">
            <GLLogo size={26} />
            GettingLeads
          </a>
          <div className="hidden gap-7 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-[14px] text-ink-700 no-underline transition-colors duration-[200ms] hover:text-ink-1000">{l.label}</a>
            ))}
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="inline-flex h-9 items-center rounded-[6px] px-3.5 text-[13px] font-medium text-ink-700 transition-all duration-[200ms] hover:bg-surface-2 hover:text-ink-1000">Sign in</Link>
          <Link href="/signup" className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-brand px-3.5 text-[13px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover">
            Start free trial <ArrowRight />
          </Link>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-[6px] text-ink-700 transition-colors hover:bg-surface-2 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          ) : (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          )}
        </button>
      </div>
      {open && (
        <div className="border-t border-line-1 bg-white px-6 pb-6 pt-4 shadow-pop md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[15px] text-ink-700 no-underline transition-colors duration-[200ms] hover:text-ink-1000">{l.label}</a>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center rounded-[10px] border border-line-2 text-[14px] font-medium text-ink-700 transition-all duration-[200ms] hover:bg-surface-1">Sign in</Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-[200ms] hover:bg-brand-hover">
              Start free trial <ArrowRight />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
