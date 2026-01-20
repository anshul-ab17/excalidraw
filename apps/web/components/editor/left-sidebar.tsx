"use client"

export function LeftSidebar() {
  return (
    <aside className="h-full w-64 border-r bg-background p-4">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
        Tools
      </h2>

      <ul className="space-y-2 text-sm">
        <li className="cursor-pointer hover:text-primary">Select</li>
        <li className="cursor-pointer hover:text-primary">Rectangle</li>
        <li className="cursor-pointer hover:text-primary">Text</li>
        <li className="cursor-pointer hover:text-primary">Image</li>
      </ul>
    </aside>
  )
}
