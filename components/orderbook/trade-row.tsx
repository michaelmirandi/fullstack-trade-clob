"use client"

import { memo } from "react"
import { formatPrice, formatSize, formatTime } from "@/lib/format"
import type { DisplayUnit, Trade } from "@/lib/types"

interface Props {
  trade: Trade
  priceDecimals: number
  displayUnit: DisplayUnit
  animate?: boolean
}

export const TradeRow = memo(function TradeRow({
  trade,
  priceDecimals,
  displayUnit,
  animate = true,
}: Props) {
  const isBuy = trade.side === "buy"
  const color = isBuy ? "var(--bid)" : "var(--ask)"
  const rowStyle = {
    "--trade-flash": isBuy ? "var(--bid-fill)" : "var(--ask-fill)",
  } as React.CSSProperties

  return (
    <div
      className={`${animate ? "trade-row " : ""}grid grid-cols-3 gap-2 px-3 h-6 items-center font-semibold cursor-default`}
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
