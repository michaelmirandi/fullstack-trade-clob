"use client"

import { useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TICK_OPTIONS, tickValueOf } from "@/lib/ticks"
import { useMarketStore } from "@/lib/stores/market-store"

export function SigFigsSelect() {
  const nSigFigs = useMarketStore((s) => s.nSigFigs)
  const mantissa = useMarketStore((s) => s.mantissa)
  const setSigFigs = useMarketStore((s) => s.setSigFigs)
  const symbol = useMarketStore((s) => s.symbol)
  const options = TICK_OPTIONS[symbol]
  const current = tickValueOf(nSigFigs, mantissa)

  useEffect(() => {
    if (options.some((o) => o.value === current)) return
    const first = options[0]
    setSigFigs(first.nSigFigs, first.mantissa)
  }, [options, current, setSigFigs])

  return (
    <Select
      value={current}
      onValueChange={(v) => {
        const o = options.find((opt) => opt.value === v)
        if (o) setSigFigs(o.nSigFigs, o.mantissa)
      }}
    >
      <SelectTrigger className="h-7 text-xs font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup className='text-xs font-semibold'>
          <SelectLabel>Decimals</SelectLabel>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
