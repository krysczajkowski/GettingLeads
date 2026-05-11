import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gray-900">GettingLeads</h1>
      <p className="mt-4 max-w-md text-center text-lg text-gray-600">
        Find potential leads in public Facebook groups, automatically. AI-powered classification delivers relevant conversations to your dashboard daily.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Log in
        </Link>
      </div>
      <p className="mt-12 max-w-sm text-center text-xs text-gray-400">
        We only analyze public groups. We never store post content or author data. You are responsible for the lawful use of the results found.
      </p>
    </div>
  )
}
