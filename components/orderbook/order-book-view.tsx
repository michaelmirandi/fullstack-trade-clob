"use client"

import { OrderBookRow } from "@/components/orderbook/order-book-row"
import { OrderBookRowHorizontal } from "@/components/orderbook/order-book-row-horizontal"
import { OrderBookRowSkeleton } from "@/components/orderbook/order-book-row-skeleton"
import { SpreadRow } from "@/components/orderbook/spread-row"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { useMaxLevels } from "@/lib/hooks/use-max-levels"
import { getPriceDecimals } from "@/lib/ticks"
import { useBookStore } from "@/lib/stores/book-store"
import { useMarketStore } from "@/lib/stores/market-store"

export function OrderBookView() {
  const bids = useBookStore((s) => s.bids)
  const asks = useBookStore((s) => s.asks)
  const symbol = useMarketStore((s) => s.symbol)
  const nSigFigs = useMarketStore((s) => s.nSigFigs)
  const mantissa = useMarketStore((s) => s.mantissa)
  const displayUnit = useMarketStore((s) => s.displayUnit)
  const maxLevels = useMaxLevels()
  const isMobile = useIsMobile()
  const unitLabel = displayUnit === "USD" ? "USD" : symbol
  const priceDecimals = getPriceDecimals(symbol, nSigFigs, mantissa)

  const visibleBids = bids.slice(0, maxLevels)
  const visibleAsks = asks.slice(0, maxLevels)
  const maxCumulative = Math.max(
    visibleBids.at(-1)?.cumulative ?? 0,
    visibleAsks.at(-1)?.cumulative ?? 0,
  )

  if (isMobile) {
    return (
      <div className="text-xs">
        <div className="grid grid-cols-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <div className="grid grid-cols-2 gap-2 px-3 py-1.5">
            <span>Total ({unitLabel})</span>
            <span className="text-right">Price</span>
          </div>
          <div className="grid grid-cols-2 gap-2 px-3 py-1.5">
            <span>Price</span>
            <span className="text-right">Total ({unitLabel})</span>
          </div>
        </div>


        <div className="grid grid-cols-2">
          <div className="[contain:content]">
            {visibleBids.length === 0
              ? Array.from({ length: maxLevels }).map((_, i) => (
                  <HorizontalSkeleton key={`bs-${i}`} />
                ))
              : visibleBids.map((lvl, i) => (
                  <OrderBookRowHorizontal
                    key={`b-${i}`}
                    level={lvl}
                    side="bid"
                    maxCumulative={maxCumulative}
                    priceDecimals={priceDecimals}
                    displayUnit={displayUnit}
                  />
                ))}
          </div>
          <div className="[contain:content]">
            {visibleAsks.length === 0
              ? Array.from({ length: maxLevels }).map((_, i) => (
                  <HorizontalSkeleton key={`as-${i}`} />
                ))
              : visibleAsks.map((lvl, i) => (
                  <OrderBookRowHorizontal
                    key={`a-${i}`}
                    level={lvl}
                    side="ask"
                    maxCumulative={maxCumulative}
                    priceDecimals={priceDecimals}
                    displayUnit={displayUnit}
                  />
                ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-xs">
      <div className="grid grid-cols-3 gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Price</span>
        <span className="text-right">Size ({unitLabel})</span>
        <span className="text-right">Total ({unitLabel})</span>
      </div>

      <div className="book-side-ask [contain:content]">
        {visibleAsks.length === 0
          ? Array.from({ length: maxLevels }).map((_, i) => (
              <OrderBookRowSkeleton key={`as-${i}`} />
            ))
          : visibleAsks.slice().reverse().map((lvl, i) => (
              <OrderBookRow
                key={`a-${i}`}
                level={lvl}
                side="ask"
                maxCumulative={maxCumulative}
                priceDecimals={priceDecimals}
                displayUnit={displayUnit}
                symbol={symbol}
              />
            ))}
      </div>

      <SpreadRow />

      <div className="book-side-bid [contain:content]">
        {visibleBids.length === 0
          ? Array.from({ length: maxLevels }).map((_, i) => (
              <OrderBookRowSkeleton key={`bs-${i}`} />
            ))
          : visibleBids.map((lvl, i) => (
              <OrderBookRow
                key={`b-${i}`}
                level={lvl}
                side="bid"
                maxCumulative={maxCumulative}
                priceDecimals={priceDecimals}
                displayUnit={displayUnit}
                symbol={symbol}
              />
            ))}
      </div>
    </div>
  )
}

function HorizontalSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 px-3 h-6 items-center">
      <span className="h-2 w-12 rounded-sm bg-muted-foreground/15 animate-pulse" />
      <span className="h-2 w-10 justify-self-end rounded-sm bg-muted-foreground/15 animate-pulse" />
    </div>
  )
}
