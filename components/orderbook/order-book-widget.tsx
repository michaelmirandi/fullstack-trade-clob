"use client"

import { useState } from "react"
import { ColorizeToggle } from "@/components/orderbook/colorize-toggle"
import { LeverageBadge } from "@/components/orderbook/leverage-badge"
import {
  OrderBookTabs,
  type OrderBookTab,
} from "@/components/orderbook/order-book-tabs"
import { SigFigsSelect } from "@/components/orderbook/sig-figs-select"
import { StatusPill } from "@/components/orderbook/status-pill"
import { SymbolSelect } from "@/components/orderbook/symbol-select"
import { UnitToggle } from "@/components/orderbook/unit-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useOrderbookSocket } from "@/lib/hooks/use-orderbook-socket"

export function OrderBookWidget() {
  useOrderbookSocket()
  const [tab, setTab] = useState<OrderBookTab>("orders")

  return (
    <TooltipProvider delayDuration={150}>
      <div className="mx-auto w-full max-w-[380px] border border-border rounded-lg bg-card text-card-foreground overflow-hidden">
        <header className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <SymbolSelect />
            <LeverageBadge />
          </div>
          <div className="flex items-center gap-3">
            <StatusPill />
            <ThemeToggle />
          </div>
        </header>

        <OrderBookTabs value={tab} onValueChange={setTab} />

        <footer className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border">
          {tab === "trades" ? <ColorizeToggle /> : <SigFigsSelect />}
          <UnitToggle />
        </footer>
      </div>
    </TooltipProvider>
  )
}
