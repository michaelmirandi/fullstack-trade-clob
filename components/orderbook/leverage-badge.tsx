"use client"

import type { MarketSymbol } from "@/lib/types"
import { useMarketStore } from "@/lib/stores/market-store"

const LEVERAGE: Record<MarketSymbol, string> = {
  BTC: "40×",
  ETH: "25×",
}

export function LeverageBadge() {
  const symbol = useMarketStore((s) => s.symbol)
  return (
    <span
      className="inline-flex h-7 items-center rounded-lg px-2.5 text-xs font-semibold tracking-wide"
      style={{
        color: "var(--primary)",
        backgroundColor: "color-mix(in oklab, var(--primary) 14%, transparent)",
        border: "1px solid color-mix(in oklab, var(--primary) 24%, transparent)",
      }}
    >
      {LEVERAGE[symbol]}
    </span>
  )
}
