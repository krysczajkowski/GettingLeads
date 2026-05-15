import Link from 'next/link'

export default function BillingCancelPage() {
  return (
    <div>
      <div className="mb-7 flex flex-col gap-2">
        <span className="eyebrow">Payment</span>
        <h1 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink-1000">Payment cancelled</h1>
      </div>

      <div className="rounded-[16px] border border-line-1 bg-white p-8 text-center shadow-card">
        <p className="text-[16px] font-medium text-ink-1000">Your payment was not completed.</p>
        <p className="mt-2 text-[14px] text-ink-600">
          No charges were made. You can try again whenever you&apos;re ready.
        </p>
        <Link
          href="/billing"
          className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-brand px-[18px] py-2.5 text-[14px] font-medium text-fg-on-brand shadow-[0_1px_0_rgba(11,15,14,0.06),0_4px_10px_-2px_rgba(21,179,108,0.35)] transition-all duration-[200ms] hover:-translate-y-px hover:bg-brand-hover"
        >
          Back to billing
        </Link>
      </div>
    </div>
  )
}
