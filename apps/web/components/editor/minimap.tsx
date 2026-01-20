"use client"

export function MiniMap() {
  return (
    <div className="absolute bottom-4 right-4 h-32 w-48 rounded border bg-background p-2 shadow">
      <p className="text-xs text-muted-foreground">MiniMap</p>

      <div className="mt-2 h-full w-full rounded bg-muted" />
    </div>
  )
}
