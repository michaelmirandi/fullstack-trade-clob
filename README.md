# Hyperliquid Orderbook Widget

A live orderbook + trades widget for BTC and ETH on Hyperliquid. Fullstack Trade take home project.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Zustand · Radix UI (shadcn/ui) · pnpm

## Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Features

- Live `l2Book` feed for BTC + ETH, sig-figs selector (6 tick options per coin).
- Book row flashes — side-locked tint (green-bid / red-ask) on size jumps ≥ $250k notional, both directions. Surfaces wall placements/pulls and iceberg reloads.
- Trades tab — last ~50 from the WS snapshot ack, then live updates with a side-colored entry flash.
- Spread row with directional ▲/▼ and spread %.
- Hover sweep glass + per-row tooltip on desktop (avg fill / size / notional).
- Mobile layout — bids/asks side-by-side, matching Hl's mobile UX.
- USD / base unit toggle, light/dark theme, preferences persisted across reloads.

## Notes

- **One WebSocket** for both `l2Book` and `trades`. The `hl` client in `lib/hl-socket.ts` multiplexes channels and tracks subs in a Map; symbol switch = unsubscribe + subscribe on the same ws.
- **Auto-reconnect** with exponential backoff + jitter (500ms → 30s cap). On disconnect, active subs are preserved and re-issued on the next successful open; status pill shows `reconnecting` in the interim.
- Updates are rAF-batched. `l2Book` is latest-wins per coin; `trades` accumulates within the frame so bursts aren't dropped.
- Spread comes directly from the `l2Book` payload (undocumented but present in the ws data).
- Mid is derived from the bucketed top of book and **only rendered at the finest tick**. At coarser aggregations the bucketed midpoint isn't accurate, so the value is hidden — spread and spread % still render.
- Stores split by lifecycle: `market-store` (persisted prefs), `book-store` (server data), `trades-store` (rolling 50-buffer). WS bridges race-protect on coin to drop late frames after symbol switches.
- Row flashes fire on `|Δsz × px| ≥ $250k` at a stable price (slot reshuffles don't flash). Notional-based rather than % — % is unstable across levels and absolute-size doesn't normalize across coins. 

## Trade-offs

- Leverage badge values are hardcoded (40× / 25×) — fine for 2 coins; would hit HL's `meta` endpoint if scope grew.

## Built with AI

Used Claude as a pair programmer. All code reviewed and shaped by hand.