"use client"

import { useState } from "react"
import { OrderBookRowSkeleton } from "@/components/orderbook/order-book-row-skeleton"
import { TradeRow } from "@/components/orderbook/trade-row"
import { useMaxLevels } from "@/lib/hooks/use-max-levels"
import { getPriceDecimals } from "@/lib/ticks"
import { useMarketStore } from "@/lib/stores/market-store"
import { useTradesStore } from "@/lib/stores/trades-store"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import type { Trade } from "@/lib/types"

export function TradesView() {
  const trades = useTradesStore((s) => s.trades)
  const displayUnit = useMarketStore((s) => s.displayUnit)
  const symbol = useMarketStore((s) => s.symbol)
  const nSigFigs = useMarketStore((s) => s.nSigFigs)
  const mantissa = useMarketStore((s) => s.mantissa)
  const maxLevels = useMaxLevels()
  const isMobile = useIsMobile()

  const [initialTids, setInitialTids] = useState<Set<Trade["tid"]> | null>(null)
  if (initialTids === null && trades.length > 0) {
    setInitialTids(new Set(trades.map((t) => t.tid)))
  }

  const unitLabel = displayUnit === "USD" ? "USD" : symbol
  const priceDecimals = getPriceDecimals(symbol, nSigFigs, mantissa)

  const containerHeight = isMobile ? maxLevels * 24 : maxLevels * 2 * 24 + 35

  return (
    <div className="text-xs">
      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Size ({unitLabel})</span>
        <span className="text-right">Time</span>
      </div>
      <div
        className="overflow-y-auto [contain:content]"
        style={{ maxHeight: containerHeight }}
      >
        {trades.length === 0
          ? Array.from({ length: maxLevels * 2 }).map((_, i) => (
              <OrderBookRowSkeleton key={`ts-${i}`} />
            ))
          : trades.map((t) => (
              <TradeRow
                key={t.tid}
                trade={t}
                priceDecimals={priceDecimals}
                displayUnit={displayUnit}
                animate={!initialTids?.has(t.tid)}
              />
            ))}
      </div>
    </div>
  )
}
