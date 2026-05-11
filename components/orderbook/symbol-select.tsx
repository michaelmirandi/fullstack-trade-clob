"use client"

import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MarketSymbol } from "@/lib/types"
import { SYMBOLS } from "@/lib/types"
import { useMarketStore } from "@/lib/stores/market-store"

function SymbolIcon({ symbol }: { symbol: MarketSymbol }) {
  if (symbol === "ETH") {
    return (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
        <Image src="/ETH.svg" alt="" aria-hidden width={16} height={16} />
      </span>
    )
  }
  return (
    <Image
      src={`/${symbol}.svg`}
      alt=""
      aria-hidden
      width={16}
      height={16}
      className="shrink-0"
    />
  )
}

export function SymbolSelect() {
  const symbol = useMarketStore((s) => s.symbol)
  const setSymbol = useMarketStore((s) => s.setSymbol)

  return (
    <Select value={symbol} onValueChange={(v) => setSymbol(v as MarketSymbol)}>
      <SelectTrigger className="h-7 text-xs font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SYMBOLS.map((s) => (
          <SelectItem key={s} value={s}>
            <SymbolIcon symbol={s} />
            <span className='font-semibold'>{s}-USD</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
