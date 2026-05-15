import Link from 'next/link'

export default function BillingSuccessPage() {
  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Payment</span>
        <h1 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000">Payment successful</h1>
      </div>

      <div className="rounded-[16px] border border-green-100 bg-gradient-to-b from-green-50 to-white p-8 text-center shadow-card">
        <p className="text-[16px] font-medium text-ink-1000">Your subscription is now active.</p>
        <p className="mt-2 text-[14px] text-ink-600">
          You can start monitoring Facebook groups for leads right away.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-brand px-[18px] py-2.5 text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(21,179,108,0.35)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
