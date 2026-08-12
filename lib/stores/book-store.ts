import { create } from "zustand"
import type {
  ConnectionStatus,
  Level,
  MidDirection,
  Side,
  WsBook,
  WsLevel,
} from "@/lib/types"
import { hl, isFastBook } from "@/lib/hl-socket"
import { useMarketStore } from "@/lib/stores/market-store"

// How long a fast (5-level / 0.5s) snapshot stays authoritative for the top
// of book. Beyond this we fall back to the deep snapshot's own top levels.
const FAST_STALE_MS = 3_000

interface BookState {
  bids: Level[]
  asks: Level[]
  spread: number | null
  midPrice: number | null
  midDirection: MidDirection
  maxCumulative: number
  lastUpdate: number
  status: ConnectionStatus

  // Latest raw snapshot from each feed; merged on every apply.
  fastBook: WsBook | null
  fastReceivedAt: number
  deepBook: WsBook | null

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
  | "fastBook"
  | "fastReceivedAt"
  | "deepBook"
> = {
  bids: [],
  asks: [],
  maxCumulative: 0,
  lastUpdate: 0,
  spread: null,
  midPrice: null,
  midDirection: "flat",
  fastBook: null,
  fastReceivedAt: 0,
  deepBook: null,
}

/**
 * Merge the fast feed (authoritative top of book) with the deep feed's tail.
 * Deep levels inside or crossing the fast range are dropped: they are up to
 * 2-5s stale, and letting them through would rewind the top of book.
 */
function mergeRawLevels(
  fastBook: WsBook,
  deepBook: WsBook | null,
): [WsLevel[], WsLevel[]] {
  const [fastBids, fastAsks] = fastBook.levels
  if (!deepBook) return [fastBids ?? [], fastAsks ?? []]

  const [deepBids, deepAsks] = deepBook.levels
  const lowestFastBid = (fastBids ?? []).reduce(
    (min, l) => Math.min(min, +l.px),
    Infinity,
  )
  const highestFastAsk = (fastAsks ?? []).reduce(
    (max, l) => Math.max(max, +l.px),
    -Infinity,
  )

  const bids = [
    ...(fastBids ?? []),
    ...(deepBids ?? []).filter((l) => +l.px < lowestFastBid),
  ]
  const asks = [
    ...(fastAsks ?? []),
    ...(deepAsks ?? []).filter((l) => +l.px > highestFastAsk),
  ]
  return [bids, asks]
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
    const now = Date.now()
    const incomingIsFast = isFastBook(book)

    const fastBook = incomingIsFast ? book : get().fastBook
    const fastReceivedAt = incomingIsFast ? now : get().fastReceivedAt
    const deepBook = incomingIsFast ? get().deepBook : book

    const fastIsFresh =
      fastBook !== null && now - fastReceivedAt < FAST_STALE_MS

    // Fast feed owns the top of book while fresh; otherwise fall back to
    // the deep snapshot wholesale (e.g. right after subscribe/reconnect).
    const [rawBids, rawAsks] = fastIsFresh
      ? mergeRawLevels(fastBook, deepBook)
      : ((deepBook ?? fastBook)?.levels ?? [[], []])

    const bids = deriveLevels(rawBids ?? [], "bid")
    const asks = deriveLevels(rawAsks ?? [], "ask")

    const maxCumulative = Math.max(
      bids.at(-1)?.cumulative ?? 0,
      asks.at(-1)?.cumulative ?? 0,
    )

    // Take the spread from whichever feed currently owns the top of book.
    const topSource = fastIsFresh ? fastBook : (deepBook ?? fastBook)
    const spread =
      topSource?.spread !== undefined ? +topSource.spread : null

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
      // Deep snapshots can arrive carrying an older time than the latest
      // fast one; never let lastUpdate move backwards.
      lastUpdate: Math.max(get().lastUpdate, book.time),
      spread,
      midPrice,
      midDirection,
      fastBook,
      fastReceivedAt,
      deepBook,
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
