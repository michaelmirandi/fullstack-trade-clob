import { create } from "zustand"
import type {
  ConnectionStatus,
  Level,
  MidDirection,
  Side,
  WsBook,
  WsLevel,
} from "@/lib/types"
import { hl } from "@/lib/hl-socket"
import { useMarketStore } from "@/lib/stores/market-store"

interface BookState {
  bids: Level[]
  asks: Level[]
  spread: number | null
  midPrice: number | null
  midDirection: MidDirection
  maxCumulative: number
  lastUpdate: number
  status: ConnectionStatus

  applySnapshot: (book: WsBook) => void
  resetLevels: () => void
  setStatus: (s: ConnectionStatus) => void
}

const EMPTY_LEVELS: Pick<
  BookState,
  | "bids"
  | "asks"
  | "maxCumulative"
  | "lastUpdate"
  | "spread"
  | "midPrice"
  | "midDirection"
> = {
  bids: [],
  asks: [],
  maxCumulative: 0,
  lastUpdate: 0,
  spread: null,
  midPrice: null,
  midDirection: "flat",
}

function deriveLevels(raw: WsLevel[], side: Side): Level[] {
  const sorted = [...raw].sort((a, b) =>
    side === "bid" ? +b.px - +a.px : +a.px - +b.px,
  )

  const levels: Level[] = []
  let cumulative = 0
  let cumulativeNotional = 0

  for (const lvl of sorted) {
    const px = +lvl.px
    const sz = +lvl.sz
    cumulative += sz
    cumulativeNotional += sz * px
    levels.push({ px, sz, n: lvl.n, cumulative, cumulativeNotional })
  }

  return levels
}

export const useBookStore = create<BookState>()((set, get) => ({
  ...EMPTY_LEVELS,
  status: "idle",

  applySnapshot: (book) => {
    const [rawBids, rawAsks] = book.levels
    const bids = deriveLevels(rawBids ?? [], "bid")
    const asks = deriveLevels(rawAsks ?? [], "ask")

    const maxCumulative = Math.max(
      bids.at(-1)?.cumulative ?? 0,
      asks.at(-1)?.cumulative ?? 0,
    )

    const spread = book.spread !== undefined ? +book.spread : null

    const topBid = bids[0]?.px
    const topAsk = asks[0]?.px
    const midPrice =
      topBid !== undefined && topAsk !== undefined ? (topBid + topAsk) / 2 : null

    const prevMid = get().midPrice
    const prevDirection = get().midDirection

    const orderedPrevAsks = get().asks.map(a => a.px).sort((a, b) => a - b)
    const orderedPrevBids = get().bids.map(b => b.px).sort((a, b) => b - a)

    const orderedAsks = asks.map(a => a.px).sort((a, b) => a - b)
    const orderedBids = bids.map(b => b.px).sort((a, b) => b - a)

    const prevAskLevelPxs = new Set(orderedPrevAsks)
    const prevBidLevelPxs = new Set(orderedPrevBids)

    const askLevelPxs = new Set(orderedAsks)
    const bidLevelPxs = new Set(orderedBids)

    const removedAskIndicies = new Set(orderedPrevAsks.map((a, i) => askLevelPxs.has(a) ? -1 : i).filter(a => a !== -1))
    const removedBidIndicies = new Set(orderedPrevBids.map((b, i) => bidLevelPxs.has(b) ? -1 : i).filter(b => b !== -1))



    const newAsks = asks.sort((a, b) => a.px - b.px).map((a, i) => {
      return {
        ...a,
        isNewLevel: !prevAskLevelPxs.has(a.px),
        isPopLevel: removedAskIndicies.has(i)
      }
    })

    const newBids = bids.sort((a, b) => b.px - a.px).map((b, i) => {
      return {
        ...b,
        isNewLevel: !prevBidLevelPxs.has(b.px),
        isPopLevel: removedBidIndicies.has(i)
      }
    })


    let midDirection: MidDirection
    if (midPrice == null || prevMid == null) midDirection = "flat"
    else if (midPrice > prevMid) midDirection = "up"
    else if (midPrice < prevMid) midDirection = "down"
    else midDirection = prevDirection

    set({
      bids: newBids,
      asks: newAsks,
      maxCumulative,
      lastUpdate: book.time,
      spread,
      midPrice,
      midDirection,
    })
  },

  resetLevels: () => set({ ...EMPTY_LEVELS }),
  setStatus: (status) => set({ status }),
}))

if (typeof window !== "undefined") {
  hl.on("l2Book", (book) => {
    if (book.coin !== useMarketStore.getState().symbol) return
    useBookStore.getState().applySnapshot(book)
  })

  hl.onStatus((status) => {
    useBookStore.getState().setStatus(status)
  })
}
