'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function NavItem({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-[6px] border px-2.5 py-2 text-[13.5px] transition-colors duration-[120ms] ${
        active
          ? 'border-line-1 bg-white font-medium text-ink-1000 shadow-card'
          : 'border-transparent text-ink-700 hover:bg-surface-2 hover:text-ink-1000'
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center transition-colors duration-[120ms] ${
          active ? 'text-brand' : 'text-ink-500 group-hover:text-ink-700'
        }`}
      >
        {icon}
      </span>
      {children}
    </Link>
  )
}
