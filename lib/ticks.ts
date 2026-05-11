import type { Mantissa, MarketSymbol, NSigFigs } from "@/lib/types"

export interface TickOption {
  nSigFigs: NSigFigs
  mantissa: Mantissa
  label: string
  value: string
}

const opt = (
  nSigFigs: NSigFigs,
  mantissa: Mantissa,
  label: string,
): TickOption => ({
  nSigFigs,
  mantissa,
  label,
  value: mantissa !== null ? `${nSigFigs}_${mantissa}` : `${nSigFigs}`,
})

export const TICK_OPTIONS: Record<MarketSymbol, TickOption[]> = {
  BTC: [
    opt(5, null, "1"),
    opt(5, 2, "2"),
    opt(5, 5, "5"),
    opt(4, null, "10"),
    opt(3, null, "100"),
    opt(2, null, "1,000"),
  ],
  ETH: [
    opt(5, null, "0.1"),
    opt(5, 2, "0.2"),
    opt(5, 5, "0.5"),
    opt(4, null, "1"),
    opt(3, null, "10"),
    opt(2, null, "100"),
  ],
}

export const tickValueOf = (n: NSigFigs, m: Mantissa) =>
  m !== null ? `${n}_${m}` : `${n}`

export function getPriceDecimals(
  symbol: MarketSymbol,
  nSigFigs: NSigFigs,
  mantissa: Mantissa,
): number {
  const value = tickValueOf(nSigFigs, mantissa)
  const option = TICK_OPTIONS[symbol].find((o) => o.value === value)
  if (!option) return 0
  const dot = option.label.indexOf(".")
  return dot === -1 ? 0 : option.label.length - dot - 1
}
