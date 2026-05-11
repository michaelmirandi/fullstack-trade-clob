import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type {
  DisplayUnit,
  Mantissa,
  MarketSymbol,
  NSigFigs,
} from "@/lib/types"

interface MarketState {
  symbol: MarketSymbol
  nSigFigs: NSigFigs
  mantissa: Mantissa
  displayUnit: DisplayUnit
  setSymbol: (s: MarketSymbol) => void
  setSigFigs: (n: NSigFigs, m: Mantissa) => void
  setDisplayUnit: (u: DisplayUnit) => void
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      symbol: "BTC",
      nSigFigs: 5,
      mantissa: null,
      displayUnit: "USD",
      setSymbol: (symbol) => set({ symbol }),
      setSigFigs: (nSigFigs, mantissa) => set({ nSigFigs, mantissa }),
      setDisplayUnit: (displayUnit) => set({ displayUnit }),
    }),
    {
      name: "clob-market",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      skipHydration: true,
      partialize: (state) => ({
        symbol: state.symbol,
        nSigFigs: state.nSigFigs,
        mantissa: state.mantissa,
        displayUnit: state.displayUnit,
      }),
    },
  ),
)
