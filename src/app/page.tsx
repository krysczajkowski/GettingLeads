import Link from 'next/link'
import GLLogo from './components/gl-logo'
import HeroFeed from './components/hero-feed'
import TrustMarquee from './components/trust-marquee'
import HowItWorks from './components/how-it-works'
import StatsBand from './components/stats-band'
import Nav from './components/nav'

const ArrowRight = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
)

const Check = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5"/></svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== Sticky nav ===== */}
      <Nav />

      {/* ===== Hero ===== */}
      <header className="relative overflow-hidden py-12 pb-16 md:py-24 md:pb-[120px]">
        {/* Dotted grid background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(11,15,14,0.06) 1px, transparent 0)',
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)',
          }}
        />
        <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600">
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
              </span>
              Now in public beta · v1.2
            </span>
            <h1 className="mt-[18px] text-[clamp(48px,5.8vw,76px)] font-semibold leading-[1.02] tracking-[-0.028em] text-ink-1000">
              Find leads in Facebook groups{' '}
              <span className="font-serif text-brand" style={{ fontWeight: 400 }}>while you sleep.</span>
            </h1>
            <p className="mt-[18px] max-w-[520px] text-[19px] leading-relaxed text-ink-700">
              GettingLeads monitors public groups around the clock, scores every post against your buyer, and delivers the ones worth replying to — straight to your inbox.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link href="/signup" className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-brand px-[22px] text-[15px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_1px_0_rgba(11,15,14,0.06),0_10px_20px_-4px_rgba(21,179,108,0.5)] active:translate-y-0 active:scale-[0.985]">
                Start free 14-day trial <ArrowRight />
              </Link>
              <a href="#product" className="inline-flex h-[52px] items-center justify-center rounded-[10px] border border-line-2 bg-white px-[22px] text-[15px] font-medium text-ink-1000 transition-all duration-[200ms] hover:border-line-3 hover:bg-surface-1">
                See a live demo
              </a>
            </div>
            <div className="mt-[18px] flex flex-wrap items-center gap-x-3.5 gap-y-1 font-mono text-[12px] text-ink-500">
              <span className="inline-flex items-center gap-1.5"><span className="text-brand"><Check /></span> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-brand"><Check /></span> Setup in 3 minutes</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-brand"><Check /></span> Cancel any time</span>
            </div>
          </div>
          <div className="hidden md:block">
            <HeroFeed />
          </div>
        </div>
      </header>

      {/* ===== Trust marquee ===== */}
      <TrustMarquee />

      {/* ===== How it works ===== */}
      <HowItWorks />

      {/* ===== Dashboard preview ===== */}
      <section className="border-t border-line-1 py-16 md:py-[120px]" id="product">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-20">
            <span className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600">
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
              </span>
              The product
            </span>
            <h2 className="mt-4 text-[clamp(36px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000">
              A morning queue, not another tab.
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-ink-700">
              Open the dashboard, work the top of the list, close the tab. Most of our customers spend under 15 minutes here a day.
            </p>
          </div>
          {/* Preview mock */}
          <div className="relative overflow-hidden rounded-[16px] border border-line-1 bg-surface-1 p-3.5 shadow-card">
            {/* Scan line */}
            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[16px]">
              <div className="absolute left-0 top-0 h-full w-[30%] animate-[gl-scan-line_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-brand/[0.12] to-transparent" />
            </div>
            <div className="rounded-[10px] border border-line-1 bg-white">
              {/* Mini dashboard mockup */}
              <div className="md:grid md:grid-cols-[170px_1fr] md:h-[420px]">
                {/* Sidebar */}
                <aside className="hidden flex-col border-r border-line-1 bg-white p-3.5 md:flex">
                  <div className="mb-3.5 flex items-center gap-2 px-1">
                    <GLLogo size={18} />
                    <span className="text-[13px] font-semibold tracking-[-0.01em]">GettingLeads</span>
                  </div>
                  <div className="px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-500">Workspace</div>
                  <div className="mb-px flex items-center gap-2 rounded-[6px] border border-line-1 bg-white px-2 py-1.5 text-[12px] font-medium shadow-card">
                    <span className="text-brand">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
                    </span>
                    Dashboard
                  </div>
                  <div className="mb-px flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[12px] text-ink-700">
                    <span className="text-ink-500">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
                    </span>
                    Settings
                  </div>
                  <div className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[12px] text-ink-700">
                    <span className="text-ink-500">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/></svg>
                    </span>
                    Billing
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 rounded-[8px] border border-green-100 bg-green-50 px-2.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.06em] text-green-700">
                    <span className="h-[5px] w-[5px] rounded-full bg-brand shadow-[0_0_0_3px_rgba(21,179,108,0.18)]" />
                    Live · monitoring
                  </div>
                </aside>
                {/* Main */}
                <main className="overflow-hidden p-[18px]">
                  <div className="mb-3">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-500">Overview · last 7 days</span>
                    <div className="mt-0.5 text-[22px] font-semibold tracking-[-0.025em] text-ink-1000">Dashboard</div>
                  </div>
                  {/* Mini stat strip */}
                  <div className="mb-2.5 grid grid-cols-2 overflow-hidden rounded-[8px] border border-line-1 bg-white shadow-card md:grid-cols-4">
                    {[
                      { label: 'Total leads', value: '6', delta: '+2 today' },
                      { label: 'Avg score', value: '96%', delta: '+4 pts' },
                      { label: 'Buying intent', value: '100%', delta: 'Stable' },
                      { label: 'Top group', value: 'Apartments PL', delta: '6 leads' },
                    ].map((s, i) => (
                      <div key={i} className={`flex flex-col gap-1 px-4 py-3.5 ${i >= 2 ? 'hidden md:flex' : ''} ${i === 0 ? 'border-r border-line-1' : ''} ${i === 1 || i === 2 ? 'border-line-1 md:border-r' : ''}`}>
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-500">{s.label}</span>
                        <span className="text-[20px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink-1000">{s.value}</span>
                        <span className="font-mono text-[10px] text-brand">{s.delta}</span>
                      </div>
                    ))}
                  </div>
                  {/* Mini usage card */}
                  <div className="mb-2.5 rounded-[8px] border border-line-1 bg-white p-3.5 shadow-card">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-500">This month</div>
                        <div className="mt-0.5 text-[13px] font-semibold tracking-[-0.01em]">Posts processed</div>
                      </div>
                      <span className="font-mono text-[10px] text-ink-600">2% of plan</span>
                    </div>
                    <div className="mb-2 mt-2">
                      <span className="text-[26px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-ink-1000">
                        111<span className="ml-0.5 text-[12px] font-medium text-ink-500"> / 5,000</span>
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full w-[2%] rounded-full bg-gradient-to-r from-green-400 to-brand" />
                    </div>
                  </div>
                  {/* Mini leads table */}
                  <div className="overflow-hidden rounded-[8px] border border-line-1 bg-white shadow-card">
                    <div className="flex items-baseline gap-1.5 border-b border-line-1 px-3.5 py-2.5">
                      <span className="text-[13px] font-semibold tracking-[-0.01em]">Leads</span>
                      <span className="font-mono text-[11px] text-ink-500">(6)</span>
                    </div>
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr>
                          {['Post', 'Group', 'Score', 'Reason', 'Date'].map(h => (
                            <th key={h} className="border-b border-line-1 bg-surface-1 px-3.5 py-[7px] text-left font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-ink-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { score: 98, reason: 'expressing need', date: 'May 14' },
                          { score: 98, reason: 'expressing need', date: 'May 14' },
                          { score: 86, reason: 'expressing need', date: 'May 13' },
                          { score: 99, reason: 'explicit purchase intent', date: 'May 13' },
                        ].map((l, i) => (
                          <tr key={i} className="border-b border-line-1 last:border-b-0">
                            <td className="px-3.5 py-2">
                              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand">
                                View post
                                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>
                              </span>
                            </td>
                            <td className="px-3.5 py-2 font-mono text-[10.5px] text-ink-600">facebook.com/groups/742...</td>
                            <td className="px-3.5 py-2">
                              <span className={`inline-block rounded-[5px] px-[7px] py-[2px] font-mono text-[10.5px] font-semibold ${l.score >= 80 ? 'bg-green-50 text-green-700' : 'bg-warn-50 text-warn-700'}`}>{l.score}%</span>
                            </td>
                            <td className="px-3.5 py-2 text-ink-600">{l.reason}</td>
                            <td className="whitespace-nowrap px-3.5 py-2 font-mono text-[10.5px] text-ink-500">{l.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="border-t border-line-1 py-16 md:py-[120px]">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-20">
            <span className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600">
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
              </span>
              Built for sales teams
            </span>
            <h2 className="mt-4 text-[clamp(36px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000">
              Quiet software that does its job.
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-ink-700">
              No dashboards inside dashboards. No 14 nested menus. The features below are roughly all of them — by design.
            </p>
          </div>
          <div className="grid grid-cols-1 overflow-hidden rounded-[16px] border border-line-1 bg-white md:grid-cols-3">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>, title: 'Buyer-fit scoring', desc: 'A single paragraph describing your brand powers every score. Tune it; the model adapts.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8"/></svg>, title: 'Category & reason', desc: 'Every match is tagged with the category and why it triggered. No guessing.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>, title: 'Scheduled scraping', desc: 'Set how often we check your groups — hourly through daily — in your timezone. Runs in the background.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>, title: 'Public groups only', desc: 'We monitor only what is publicly accessible. No private groups, no scraping, ToS-compliant.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0"/><path d="M17 4a4 4 0 0 1 0 8"/><path d="M23 21a8 8 0 0 0-4-7"/></svg>, title: 'Up to 10 groups', desc: 'Add public Facebook group URLs to your watchlist. Add, remove, or swap them out any time from Settings.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>, title: 'Jump to the post', desc: 'One click on any scored lead opens the original Facebook post in a new tab. Reply where they are.' },
            ].map((it, i) => (
              <div key={i} className={`p-5 md:p-8 ${i < 3 ? 'hidden md:block' : ''} ${i < 5 ? 'border-b border-line-1' : ''} ${i >= 3 ? 'md:border-b-0' : ''} ${i % 3 !== 2 ? 'md:border-r' : ''}`}>
                <div className="mb-[18px] flex h-11 w-11 items-center justify-center rounded-[10px] bg-green-50 text-brand">
                  <span className="h-[22px] w-[22px]">{it.icon}</span>
                </div>
                <div className="text-[17px] font-semibold tracking-[-0.01em]">{it.title}</div>
                <div className="mt-1.5 text-[14px] leading-relaxed text-ink-600">{it.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <StatsBand />

      {/* ===== Pricing ===== */}
      <section className="border-t border-line-1 py-16 md:py-[120px]" id="pricing">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mx-auto mb-10 max-w-[720px] text-center md:mb-20">
            <span className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-line-1 bg-surface-1 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-ink-600">
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
              </span>
              Pricing
            </span>
            <h2 className="mt-4 text-[clamp(36px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000">
              Pay for the leads, not the seats.
            </h2>
            <p className="mt-4 text-[18px] leading-relaxed text-ink-700">
              14-day free trial. Cancel any time. No annual lock-in.
            </p>
          </div>

          <div className="mx-auto max-w-md">
            <div className="relative rounded-[16px] border border-ink-1000 bg-white p-7 shadow-card-hover">
              <span className="absolute -top-2.5 left-6 rounded-full bg-ink-1000 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-white">Most popular</span>
              <div className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-500">Pro</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[48px] font-semibold tracking-[-0.025em]">$49</span>
                <span className="text-[14px] text-ink-500">/ month</span>
              </div>
              <p className="mt-1 text-[14px] leading-[1.5] text-ink-700">For founders and sales teams monitoring Facebook communities for leads.</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {[
                  '10 groups monitored',
                  '5,000 posts processed / month',
                  '1 buyer profile',
                  'AI-powered lead scoring',
                  'Daily digest email',
                  'CSV export',
                ].map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-[14px] leading-[1.4] text-ink-700">
                    <span className="mt-1 shrink-0 text-brand"><Check /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 flex h-11 w-full items-center justify-center rounded-[10px] bg-brand text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_6px_14px_-4px_rgba(21,179,108,0.4)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="border-t border-line-1 py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="relative overflow-hidden rounded-[24px] bg-ink-1000 px-6 py-12 text-white md:px-16 md:py-20">
            {/* Radar decoration */}
            <div className="pointer-events-none absolute -right-[120px] top-1/2 hidden h-[440px] w-[440px] -translate-y-1/2 opacity-30 md:block">
              <div className="absolute inset-0 rounded-full border border-white/15" />
              <div className="absolute inset-[44px] rounded-full border border-white/15" />
              <div className="absolute inset-[100px] rounded-full border border-white/15" />
              <div className="absolute inset-[156px] rounded-full border border-white/15" />
              <div className="absolute inset-0 animate-[gl-radar-sweep_4s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(21,179,108,0.6)_360deg)]" style={{ mixBlendMode: 'screen' }} />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2.5 py-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-white/70">
                <span className="relative h-1.5 w-1.5 rounded-full bg-brand">
                  <span className="absolute -inset-[3px] animate-[gl-pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-brand opacity-40" />
                </span>
                Try it free
              </span>
              <h2 className="mt-4 max-w-[600px] text-[clamp(36px,4.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
                The leads are already{' '}
                <span className="font-serif text-green-300" style={{ fontWeight: 400 }}>there.</span>
                <br />Stop missing them.
              </h2>
              <p className="mt-3.5 max-w-[560px] text-[18px] leading-relaxed text-white/65">
                Set up takes three minutes. The first scored lead lands in your inbox before you finish your coffee.
              </p>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <Link href="/signup" className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-brand px-[22px] text-[15px] font-medium text-fg-on-brand transition-all duration-[200ms] hover:bg-green-400">
                  Start free 14-day trial <ArrowRight />
                </Link>
                <a href="mailto:hello@gettingleads.com" className="inline-flex h-[52px] items-center justify-center rounded-[10px] border border-white/20 bg-transparent px-[22px] text-[15px] font-medium text-white transition-all duration-[200ms] hover:border-white/40 hover:bg-white/[0.06]">
                  Book a 15-minute demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-line-1 px-6 pb-8 pt-12 md:pt-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:mb-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-12">
            <div className="flex flex-col gap-3 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <GLLogo size={26} />
                <span className="text-[17px] font-semibold tracking-[-0.02em]">GettingLeads</span>
              </div>
              <p className="max-w-[280px] text-[14px] leading-[1.5] text-ink-600">Find leads in Facebook groups while you sleep. We only analyze public groups. We never store post content or author data.</p>
            </div>
            {[
              { title: 'Product', links: ['Overview', 'How it works', 'Pricing', 'Changelog'] },
              { title: 'Company', links: ['About', 'Customers', 'Privacy', 'Terms'] },
              { title: 'Resources', links: ['Help center', 'Status', 'API docs'] },
            ].map((col) => (
              <div key={col.title}>
                <h5 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-500">{col.title}</h5>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-[14px] text-ink-700 no-underline transition-colors duration-[200ms] hover:text-ink-1000">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1 border-t border-line-1 pt-5 font-mono text-[12px] text-ink-500 sm:flex-row sm:justify-between">
            <span>&copy; 2026 GettingLeads, Inc.</span>
            <span>v1.2 · All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
