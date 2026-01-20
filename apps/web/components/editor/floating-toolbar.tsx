"use client"

export function FloatingToolbar() {
  return (
    <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 gap-2 rounded-lg border bg-background p-2 shadow">
      <button className="rounded px-2 py-1 text-sm hover:bg-muted">
        Bold
      </button>
      <button className="rounded px-2 py-1 text-sm hover:bg-muted">
        Align
      </button>
      <button className="rounded px-2 py-1 text-sm hover:bg-muted">
        Delete
      </button>
    </div>
  )
}
