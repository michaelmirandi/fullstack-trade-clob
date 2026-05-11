"use client"

export function OrderBookRowSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 px-3 h-6 items-center">
      <span className="h-2 w-12 rounded-sm bg-muted-foreground/15 animate-pulse" />
      <span className="h-2 w-10 justify-self-end rounded-sm bg-muted-foreground/15 animate-pulse" />
      <span className="h-2 w-14 justify-self-end rounded-sm bg-muted-foreground/15 animate-pulse" />
    </div>
  )
}
