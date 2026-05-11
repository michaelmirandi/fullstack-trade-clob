import { create } from "zustand"
import type { Trade, WsTrade } from "@/lib/types"
import { hl } from "@/lib/hl-socket"
import { useMarketStore } from "@/lib/stores/market-store"

const MAX_TRADES = 50

interface TradesState {
  trades: Trade[]
  applyTrades: (incoming: WsTrade[]) => void
  reset: () => void
}

export const useTradesStore = create<TradesState>()((set) => ({
  trades: [],

  applyTrades: (incoming) => {
    if (!incoming.length) return
    const converted: Trade[] = incoming.map((t) => ({
      px: +t.px,
      sz: +t.sz,
      side: t.side === "B" ? "buy" : "sell",
      time: t.time,
      tid: t.tid,
    }))
    set((state) => {
      const merged = [...converted.reverse(), ...state.trades]
      return { trades: merged.slice(0, MAX_TRADES) }
    })
  },

  reset: () => set({ trades: [] }),
}))

if (typeof window !== "undefined") {
  hl.on("trades", (trades) => {
    if (!trades.length) return
    if (trades[0].coin !== useMarketStore.getState().symbol) return
    useTradesStore.getState().applyTrades(trades)
  })
}
