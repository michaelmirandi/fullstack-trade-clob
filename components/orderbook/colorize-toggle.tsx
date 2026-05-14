"use client"

import { Switch } from "@/components/ui/switch"
import { useTradesStore } from "@/lib/stores/trades-store"

export function ColorizeToggle() {
  const colorize = useTradesStore((s) => s.colorize)
  const setColorize = useTradesStore((s) => s.setColorize)

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
      <span>Colorize</span>
      <Switch
        checked={colorize}
        onCheckedChange={setColorize}
        aria-label="Colorize"
      />
    </label>
  )
}
