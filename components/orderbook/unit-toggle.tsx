"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { DisplayUnit } from "@/lib/types"
import { useMarketStore } from "@/lib/stores/market-store"

export function UnitToggle() {
  const symbol = useMarketStore((s) => s.symbol)
  const displayUnit = useMarketStore((s) => s.displayUnit)
  const setDisplayUnit = useMarketStore((s) => s.setDisplayUnit)

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={displayUnit}
      onValueChange={(v) => v && setDisplayUnit(v as DisplayUnit)}
    >
      <ToggleGroupItem value="USD">USD</ToggleGroupItem>
      <ToggleGroupItem value="BASE">{symbol}</ToggleGroupItem>
    </ToggleGroup>
  )
}
