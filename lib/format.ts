import type { DisplayUnit } from "@/lib/types"

const usdInt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const usdCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})
const base = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 5,
})
const pct = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})
const time = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

const priceFormatters = new Map<number, Intl.NumberFormat>()
function priceFormatter(decimals: number) {
  let f = priceFormatters.get(decimals)
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    priceFormatters.set(decimals, f)
  }
  return f
}

export const formatPrice = (px: number, decimals = 0) =>
  priceFormatter(decimals).format(px)

export const formatPct = (p: number) => `${pct.format(p)}%`

export const formatTime = (t: number) => time.format(t)

export const formatBase = (n: number) => base.format(n)

export const formatUsdCurrency = (n: number) => usdCurrency.format(n)

export const formatSize = (sz: number, px: number, unit: DisplayUnit) =>
  unit === "USD" ? usdInt.format(sz * px) : base.format(sz)

export const formatTotal = (
  cumBase: number,
  cumNotional: number,
  unit: DisplayUnit,
) => (unit === "USD" ? usdInt.format(cumNotional) : base.format(cumBase))
