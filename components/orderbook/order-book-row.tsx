"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  formatBase,
  formatPrice,
  formatSize,
  formatTotal,
  formatUsdCurrency,
} from "@/lib/format"
import { useLevelFlash } from "@/lib/hooks/use-level-flash"
import type { DisplayUnit, Level, Side } from "@/lib/types"

interface Props {
  level: Level
  side: Side
  maxCumulative: number
  priceDecimals: number
  displayUnit: DisplayUnit
  symbol: string
}

export function OrderBookRow({
  level,
  side,
  maxCumulative,
  priceDecimals,
  displayUnit,
  symbol,
}: Props) {
  const fill = maxCumulative > 0 ? level.cumulative / maxCumulative : 0
  const isAsk = side === "ask"
  const avgFill = level.cumulative > 0
    ? level.cumulativeNotional / level.cumulative
    : 0
  // const flashId = useLevelFlash(level.px, level.sz)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="book-row relative grid grid-cols-3 gap-2 px-3 h-6 items-center cursor-default font-semibold">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 pointer-events-none z-[6]"
            style={{
              width: "100%",
              transformOrigin: "left",
              transform: `scaleX(${fill})`,
              backgroundColor: isAsk ? "var(--ask-fill)" : "var(--bid-fill)",
              transition: "transform 180ms ease-out",
            }}
          />
          {(level.isNewLevel || level.isPopLevel) && (
            <span
              key={`${level.px}-new-level-flash`}
              aria-hidden
              className="orderbook-row-flash absolute inset-0 pointer-events-none z-[7]"
              style={{
                "--orderbook-flash": isAsk ? "var(--ask-fill)" : "var(--bid-fill)",
              } as React.CSSProperties}
            />
          )}

          <span
            className="relative z-10"
            style={{ color: isAsk ? "var(--ask)" : "var(--bid)" }}
          >
            {formatPrice(level.px, priceDecimals)}
          </span>
          <span className="relative z-10 text-right text-foreground">
            {formatSize(level.sz, level.px, displayUnit)}
          </span>
          <span className="relative z-10 text-right text-muted-foreground">
            {formatTotal(level.cumulative, level.cumulativeNotional, displayUnit)}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="left"
        sideOffset={6}
        collisionPadding={8}
        className="font-mono"
      >
        <div className="flex flex-col gap-0.5 text-[11px] font-semibold">
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Avg fill</span>
            <span className="tabular-nums">${formatPrice(avgFill, priceDecimals)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Size</span>
            <span className="tabular-nums">
              {formatBase(level.cumulative)} {symbol}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-70">Notional</span>
            <span className="tabular-nums">
              {formatUsdCurrency(level.cumulativeNotional)}
            </span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
