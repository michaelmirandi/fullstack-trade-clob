"use client"

import type { ConnectionStatus } from "@/lib/types"
import { useBookStore } from "@/lib/stores/book-store"


const DOT_COLOR: Record<ConnectionStatus, string> = {
  idle: "var(--status-idle)",
  connecting: "var(--status-connecting)",
  open: "var(--status-open)",
  reconnecting: "var(--status-connecting)",
  error: "var(--status-error)",
}

export function StatusPill() {
  const status = useBookStore((s) => s.status)
  const pulse = status === "connecting" || status === "reconnecting"

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={`inline-block h-2 w-2 rounded-full ${pulse ? "animate-pulse" : ""}`}
        style={{ backgroundColor: DOT_COLOR[status] }}
      />
    </div>
  )
}
