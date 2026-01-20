"use client"

export function ContextMenu() {
  return (
    <div className="absolute z-50 w-40 rounded border bg-background p-1 shadow">
      <button className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-muted">
        Copy
      </button>
      <button className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-muted">
        Paste
      </button>
      <button className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-muted">
        Delete
      </button>
    </div>
  )
}

