'use client'

import { useState, useEffect } from 'react'

export default function NumTicker({
  to,
  duration = 1200,
  format = (n: number) => Math.round(n).toLocaleString(),
}: {
  to: number
  duration?: number
  format?: (n: number) => string
}) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf: number
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(eased * to)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])

  return <>{format(val)}</>
}
