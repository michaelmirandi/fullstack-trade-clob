import type { ConnectionStatus, WsBook, WsTrade } from "@/lib/types"

const WS_URL = "wss://api.hyperliquid.xyz/ws"

export type Subscription =
  | {
      type: "l2Book"
      coin: string
      nSigFigs: number | null
      mantissa: number | null
    }
  | { type: "trades"; coin: string }

interface ChannelHandlers {
  l2Book: (book: WsBook) => void
  trades: (trades: WsTrade[]) => void
}

interface HlClient {
  subscribe: (sub: Subscription) => () => void
  on: <K extends keyof ChannelHandlers>(
    channel: K,
    handler: ChannelHandlers[K],
  ) => () => void
  onStatus: (handler: (s: ConnectionStatus) => void) => () => void
}

function keyOf(sub: Subscription): string {
  switch (sub.type) {
    case "l2Book":
      return `l2Book:${sub.coin}:${sub.nSigFigs}:${sub.mantissa}`
    case "trades":
      return `trades:${sub.coin}`
  }
}

function buildSubMessage(sub: Subscription) {
  switch (sub.type) {
    case "l2Book": {
      const m: {
        type: "l2Book"
        coin: string
        nSigFigs?: number
        mantissa?: number
      } = { type: "l2Book", coin: sub.coin }
      if (sub.nSigFigs !== null) m.nSigFigs = sub.nSigFigs
      // mantissa is only valid alongside nSigFigs=5 per HL docs
      if (sub.nSigFigs === 5 && sub.mantissa !== null) m.mantissa = sub.mantissa
      return m
    }
    case "trades":
      return { type: "trades", coin: sub.coin }
  }
}

function createHlClient(): HlClient {
  let ws: WebSocket | null = null
  let status: ConnectionStatus = "idle"

  const activeSubs = new Map<string, Subscription>()
  const pendingSubs = new Map<string, Subscription>()

  const listeners = {
    l2Book: new Set<ChannelHandlers["l2Book"]>(),
    trades: new Set<ChannelHandlers["trades"]>(),
  }
  const statusListeners = new Set<(s: ConnectionStatus) => void>()

  const pending: {
    l2Book: Map<string, WsBook> | null
    trades: WsTrade[] | null
  } = { l2Book: null, trades: null }
  let rafHandle: number | null = null

  let reconnectAttempt = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function scheduleReconnect() {
    if (reconnectTimer !== null) return
    const base = Math.min(500 * 2 ** reconnectAttempt, 30_000)
    const delay = base + base * 0.3 * Math.random()
    reconnectAttempt++
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      ensureSocket()
    }, delay)
  }

  function setStatus(s: ConnectionStatus) {
    if (status === s) return
    status = s
    for (const fn of statusListeners) fn(s)
  }

  function send(method: "subscribe" | "unsubscribe", sub: Subscription) {
    if (ws?.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ method, subscription: buildSubMessage(sub) }))
  }

  function ensureSocket() {
    if (ws) return
    setStatus("connecting")
    const socket = new WebSocket(WS_URL)
    ws = socket

    socket.onopen = () => {
      setStatus("open")
      reconnectAttempt = 0
      for (const sub of pendingSubs.values()) {
        send("subscribe", sub)
        activeSubs.set(keyOf(sub), sub)
      }
      pendingSubs.clear()
    }

    socket.onmessage = (e) => {
      let msg: { channel?: string; data?: unknown } | null = null
      try {
        msg = JSON.parse(typeof e.data === "string" ? e.data : "")
      } catch {
        return
      }
      if (!msg?.channel || msg.data === undefined) return

      switch (msg.channel) {
        case "l2Book": {
          const book = msg.data as WsBook
          if (pending.l2Book === null) pending.l2Book = new Map()
          pending.l2Book.set(book.coin, book)
          break
        }
        case "trades": {
          const next = msg.data as WsTrade[]
          pending.trades =
            pending.trades === null ? next : [...pending.trades, ...next]
          break
        }
        default:
          return
      }

      if (rafHandle !== null) return
      rafHandle = requestAnimationFrame(() => {
        rafHandle = null
        const l2 = pending.l2Book
        const tr = pending.trades
        pending.l2Book = null
        pending.trades = null

        if (l2) {
          for (const book of l2.values()) {
            for (const fn of listeners.l2Book) fn(book)
          }
        }
        if (tr) {
          for (const fn of listeners.trades) fn(tr)
        }
      })
    }

    socket.onerror = () => setStatus("error")
    socket.onclose = () => {
      ws = null
      for (const [key, sub] of activeSubs) pendingSubs.set(key, sub)
      activeSubs.clear()
      pending.l2Book = null
      pending.trades = null
      if (rafHandle !== null) {
        cancelAnimationFrame(rafHandle)
        rafHandle = null
      }
      if (pendingSubs.size > 0) {
        setStatus("reconnecting")
        scheduleReconnect()
      } else {
        setStatus("idle")
      }
    }
  }

  function subscribe(sub: Subscription): () => void {
    if (typeof WebSocket === "undefined") return () => {} // SSR safety
    ensureSocket()
    const key = keyOf(sub)

    if (ws?.readyState === WebSocket.OPEN) {
      if (!activeSubs.has(key)) {
        send("subscribe", sub)
        activeSubs.set(key, sub)
      }
    } else {
      pendingSubs.set(key, sub)
    }

    return () => {
      pendingSubs.delete(key)
      const active = activeSubs.get(key)
      if (active) {
        send("unsubscribe", active)
        activeSubs.delete(key)
      }
    }
  }

  function on<K extends keyof ChannelHandlers>(
    channel: K,
    handler: ChannelHandlers[K],
  ): () => void {
    const set = listeners[channel] as Set<ChannelHandlers[K]>
    set.add(handler)
    return () => {
      set.delete(handler)
    }
  }

  function onStatus(handler: (s: ConnectionStatus) => void): () => void {
    statusListeners.add(handler)
    handler(status)
    return () => {
      statusListeners.delete(handler)
    }
  }

  return { subscribe, on, onStatus }
}

export const hl = createHlClient()
