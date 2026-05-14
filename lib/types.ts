// Hyperliquid l2Book types
export interface WsLevel {
  px: string
  sz: string
  n: number
}

export interface WsBook {
  coin: string
  levels: [WsLevel[], WsLevel[]] // [bids, asks]
  time: number
  spread: string // present in actual payload; not documented
}

// Hyperliquid trades types
export interface WsTrade {
  coin: string
  side: "A" | "B" // A = sell-aggressor, B = buy-aggressor
  px: string
  sz: string
  hash: string
  time: number
  tid: number
  users: [string, string] // [buyer, seller] — unused
}

// Internal types
export type Side = "bid" | "ask"

export interface Level {
  px: number
  sz: number
  n: number
  cumulative: number
  cumulativeNotional: number
  isNewLevel?: boolean
  isPopLevel?: boolean
}

export interface Trade {
  px: number
  sz: number
  side: "buy" | "sell"
  time: number
  tid: number
}

export type MarketSymbol = "BTC" | "ETH"
export type NSigFigs = 2 | 3 | 4 | 5 | null
export type Mantissa = 1 | 2 | 5 | null // only valid when nSigFigs=5
export type DisplayUnit = "USD" | "BASE"
export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "error"
export type MidDirection = "up" | "down" | "flat"

export const SYMBOLS: readonly MarketSymbol[] = ["BTC", "ETH"] as const
