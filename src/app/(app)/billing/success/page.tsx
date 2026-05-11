import Link from 'next/link'

export default function BillingSuccessPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-8 text-center">
        <p className="font-medium text-green-800">Your subscription is now active.</p>
        <p className="mt-2 text-sm text-green-700">
          You can start monitoring Facebook groups for leads right away.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
