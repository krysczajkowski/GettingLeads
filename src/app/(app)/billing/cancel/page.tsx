import Link from 'next/link'

export default function BillingCancelPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="font-medium text-gray-800">Your payment was not completed.</p>
        <p className="mt-2 text-sm text-gray-500">
          No charges were made. You can try again whenever you&apos;re ready.
        </p>
        <Link
          href="/billing"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Back to Billing
        </Link>
      </div>
    </div>
  )
}
