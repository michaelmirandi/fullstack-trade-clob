"use client"

import { memo } from "react"
import { formatPrice, formatSize, formatTime } from "@/lib/format"
import { useTradesStore } from "@/lib/stores/trades-store"
import type { DisplayUnit, Trade } from "@/lib/types"

interface Props {
  trade: Trade
  priceDecimals: number
  displayUnit: DisplayUnit
  animate?: boolean
}

const TIERS = [
  { max: 1_000, h: "h-6", opacity: 0 },
  { max: 10_000, h: "h-8", opacity: 0.1 },
  { max: 100_000, h: "h-10", opacity: 0.22 },
  { max: Infinity, h: "h-14", opacity: 0.36 },
] as const

function tierFor(notional: number) {
  return TIERS.find((t) => notional < t.max)!
}

export const TradeRow = memo(function TradeRow({
  trade,
  priceDecimals,
  displayUnit,
  animate = true,
}: Props) {
  const colorize = useTradesStore((s) => s.colorize)
  const isBuy = trade.side === "buy"
  const color = isBuy ? "var(--bid)" : "var(--ask)"
  const tier = tierFor(trade.px * trade.sz)
  const heightClass = colorize ? tier.h : "h-6"
  const bg =
    !colorize || tier.opacity === 0
      ? "transparent"
      : `color-mix(in srgb, ${color} ${tier.opacity * 100}%, transparent)`
  const rowStyle = {
    "--trade-flash": isBuy ? "var(--bid-fill)" : "var(--ask-fill)",
    backgroundColor: bg,
  } as React.CSSProperties

  return (
    <div
      className={`${animate ? "trade-row " : ""}grid grid-cols-3 gap-2 px-3 ${heightClass} items-center font-semibold cursor-default border-b border-border/40 transition-[height,background-color] duration-[250ms] ease-in-out`}
      style={rowStyle}
    >
      <span className="font-medium" style={{ color }}>
        {formatPrice(trade.px, priceDecimals)}
      </span>
      <span className="text-right text-foreground">
        {formatSize(trade.sz, trade.px, displayUnit)}
      </span>
      <span className="text-right text-muted-foreground tabular-nums">
        {formatTime(trade.time)}
      </span>
    </div>
  )
})
