"use client"

import { formatPct, formatPrice } from "@/lib/format"
import { useBookStore } from "@/lib/stores/book-store"
import { useMarketStore } from "@/lib/stores/market-store"

export function SpreadRow() {
  const midPrice = useBookStore((s) => s.midPrice)
  const spread = useBookStore((s) => s.spread)
  const midDirection = useBookStore((s) => s.midDirection)
  const symbol = useMarketStore((s) => s.symbol)
  const nSigFigs = useMarketStore((s) => s.nSigFigs)
  const mantissa = useMarketStore((s) => s.mantissa)

  const isFinestTick = nSigFigs === 5 && mantissa === null
  const pct = midPrice && spread ? (spread / midPrice) * 100 : null

  const arrow = !isFinestTick
    ? ""
    : midDirection === "up"
      ? "▲"
      : midDirection === "down"
        ? "▼"
        : ""
  const midColor = !isFinestTick
    ? "var(--muted-foreground)"
    : midDirection === "up"
      ? "var(--mid-up)"
      : midDirection === "down"
        ? "var(--mid-down)"
        : "var(--muted-foreground)"

  if (midPrice == null) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-y border-border text-xs">
        <span className="h-3 w-20 rounded-sm bg-muted-foreground/15 animate-pulse" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-10 rounded-sm bg-muted-foreground/15 animate-pulse" />
          <span className="h-2 w-12 rounded-sm bg-muted-foreground/15 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center px-3 py-2 border-y border-border text-xs ${
        isFinestTick ? "justify-between gap-3" : "justify-center"
      }`}
    >
      {isFinestTick && (
        <div
          className="flex items-baseline gap-1.5 transition-colors"
          style={{ color: midColor }}
        >
          <span className="font-semibold tabular-nums">
            {formatPrice(midPrice, 2)}
          </span>
          <span className="text-[10px] leading-none">{arrow}</span>
        </div>
      )}
      <div className={`flex items-baseline gap-${isFinestTick ? '2': '4'} text-muted-foreground font-semibold`}>
        <span className="text-[11px] uppercase tracking-wide">spread</span>
        <span className="tabular-nums">
          {spread != null ? formatPrice(spread, symbol === "BTC" ? 0 : 1) : "—"}
        </span>
        <span className="tabular-nums text-[11px]">
          {pct != null ? `(${formatPct(pct)})` : ""}
        </span>
      </div>
    </div>
  )
}
