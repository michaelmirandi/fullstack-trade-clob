"use client"

import { useEffect } from "react"
import { hl } from "@/lib/hl-socket"
import { useBookStore } from "@/lib/stores/book-store"
import { useMarketStore } from "@/lib/stores/market-store"
import { useTradesStore } from "@/lib/stores/trades-store"

export function useOrderbookSocket() {
  const symbol = useMarketStore((s) => s.symbol)
  const nSigFigs = useMarketStore((s) => s.nSigFigs)
  const mantissa = useMarketStore((s) => s.mantissa)

  useEffect(() => {
    void useMarketStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    useBookStore.getState().resetLevels()
    return hl.subscribe({ type: "l2Book", coin: symbol, nSigFigs, mantissa })
  }, [symbol, nSigFigs, mantissa])

  useEffect(() => {
    useTradesStore.getState().reset()
    return hl.subscribe({ type: "trades", coin: symbol })
  }, [symbol])
}
