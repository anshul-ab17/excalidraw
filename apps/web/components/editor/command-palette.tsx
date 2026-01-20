"use client"

export function CommandPalette() {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24">
      <div className="w-full max-w-md rounded-lg border bg-background shadow">
        <input
          placeholder="Type a command…"
          className="w-full border-b px-3 py-2 text-sm outline-none"
        />

        <ul className="max-h-60 overflow-auto p-2 text-sm">
          <li className="cursor-pointer rounded px-2 py-1 hover:bg-muted">
            Add Rectangle
          </li>
          <li className="cursor-pointer rounded px-2 py-1 hover:bg-muted">
            Add Text
          </li>
        </ul>
      </div>
    </div>
  )
}
