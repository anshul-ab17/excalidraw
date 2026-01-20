"use client"

export function StatusBar() {
  return (
    <footer className="flex h-8 items-center justify-between border-t bg-background px-4 text-xs text-muted-foreground">
      <span>Zoom: 100%</span>
      <span>Saved</span>
    </footer>
  )
}
