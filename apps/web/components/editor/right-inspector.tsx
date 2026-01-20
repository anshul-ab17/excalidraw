"use client"

export function RightInspector() {
  return (
    <aside className="h-full w-72 border-l bg-background p-4">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
        Inspector
      </h2>

      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-muted-foreground">Width</label>
          <input className="mt-1 w-full rounded border px-2 py-1" />
        </div>

        <div>
          <label className="block text-muted-foreground">Height</label>
          <input className="mt-1 w-full rounded border px-2 py-1" />
        </div>
      </div>
    </aside>
  )
}
