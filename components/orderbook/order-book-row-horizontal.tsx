"use client"

import { formatPrice, formatTotal } from "@/lib/format"
import { useLevelFlash } from "@/lib/hooks/use-level-flash"
import type { DisplayUnit, Level, Side } from "@/lib/types"

interface Props {
  level: Level
  side: Side
  maxCumulative: number
  priceDecimals: number
  displayUnit: DisplayUnit
}

export function OrderBookRowHorizontal({
  level,
  side,
  maxCumulative,
  priceDecimals,
  displayUnit,
}: Props) {
  const fill = maxCumulative > 0 ? level.cumulative / maxCumulative : 0
  const isAsk = side === "ask"
  const flashId = useLevelFlash(level.px, level.sz)

  return (
    <div className="relative grid grid-cols-2 gap-2 px-3 h-6 items-center font-semibold">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 pointer-events-none z-[6]"
        style={{
          width: "100%",
          transformOrigin: isAsk ? "left" : "right",
          transform: `scaleX(${fill})`,
          backgroundColor: isAsk ? "var(--ask-fill)" : "var(--bid-fill)",
          transition: "transform 180ms ease-out",
        }}
      />
      {flashId !== null && (
        <span
          key={flashId}
          aria-hidden
          className="orderbook-row-flash absolute inset-0 pointer-events-none z-[7]"
          style={{
            "--orderbook-flash": isAsk ? "var(--ask-fill)" : "var(--bid-fill)",
          } as React.CSSProperties}
        />
      )}

      {isAsk ? (
        <>
          <span
            className="relative z-10"
            style={{ color: "var(--ask)" }}
          >
            {formatPrice(level.px, priceDecimals)}
          </span>
          <span className="relative z-10 text-right text-muted-foreground">
            {formatTotal(level.cumulative, level.cumulativeNotional, displayUnit)}
          </span>
        </>
      ) : (
        <>
          <span className="relative z-10 text-muted-foreground">
            {formatTotal(level.cumulative, level.cumulativeNotional, displayUnit)}
          </span>
          <span
            className="relative z-10 text-right"
            style={{ color: "var(--bid)" }}
          >
            {formatPrice(level.px, priceDecimals)}
          </span>
        </>
      )}
    </div>
  )
}
