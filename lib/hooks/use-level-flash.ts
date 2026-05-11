import { useEffect, useRef, useState } from "react"

const NOTIONAL_THRESHOLD_USD = 250_000

export function useLevelFlash(px: number, sz: number) {
  const prevRef = useRef<{ px: number; sz: number } | null>(null)
  const idRef = useRef(0)
  const [flashId, setFlashId] = useState<number | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    if (prev && prev.px === px) {
      const deltaNotional = Math.abs(sz - prev.sz) * px
      if (deltaNotional >= NOTIONAL_THRESHOLD_USD) {
        idRef.current += 1
        setFlashId(idRef.current)
      }
    }
    prevRef.current = { px, sz }
  }, [px, sz])

  return flashId
}
