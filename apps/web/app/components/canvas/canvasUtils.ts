import { ExcaliElement, HandlePos } from "./types";

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function genSeed(): number {
  return Math.floor(Math.random() * 100000);
}

export function getSvgPathFromStroke(stroke: number[][]): string {
  if (stroke.length < 2) return "";
  const parts: string[] = [];
  const f = stroke[0]!;
  parts.push(`M ${f[0]!} ${f[1]!} Q`);
  for (let i = 0; i < stroke.length; i++) {
    const a = stroke[i]!;
    const b = stroke[(i + 1) % stroke.length]!;
    const ax = a[0]!, ay = a[1]!, bx = b[0]!, by = b[1]!;
    parts.push(`${ax} ${ay} ${(ax + bx) / 2} ${(ay + by) / 2}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

export function hitTest(el: ExcaliElement, cx: number, cy: number, zoom: number): boolean {
  const tol = 8 / zoom;
  switch (el.type) {
    case "rectangle":
    case "image":
    case "text": {
      const minX = Math.min(el.x, el.x + el.width) - tol;
      const maxX = Math.max(el.x, el.x + el.width) + tol;
      const minY = Math.min(el.y, el.y + el.height) - tol;
      const maxY = Math.max(el.y, el.y + el.height) + el.height + tol;
      return cx >= minX && cx <= maxX && cy >= minY && cy <= maxY;
    }
    case "diamond": {
      const dcx = el.x + el.width / 2, dcy = el.y + el.height / 2;
      const hw = Math.abs(el.width) / 2 + tol, hh = Math.abs(el.height) / 2 + tol;
      return Math.abs(cx - dcx) / hw + Math.abs(cy - dcy) / hh <= 1;
    }
    case "ellipse": {
      const ecx = el.x + el.width / 2, ecy = el.y + el.height / 2;
      const rx = Math.abs(el.width) / 2 + tol, ry = Math.abs(el.height) / 2 + tol;
      return (cx - ecx) ** 2 / rx ** 2 + (cy - ecy) ** 2 / ry ** 2 <= 1;
    }
    case "line":
    case "arrow": {
      const x1 = el.x, y1 = el.y, x2 = el.x + el.width, y2 = el.y + el.height;
      const dx = x2 - x1, dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return Math.hypot(cx - x1, cy - y1) <= tol + 5;
      const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / len2));
      return Math.hypot(cx - (x1 + t * dx), cy - (y1 + t * dy)) <= tol + 5;
    }
    case "pencil": {
      if (!el.points || el.points.length < 2) return false;
      for (let i = 0; i < el.points.length - 1; i++) {
        const [x1, y1] = el.points[i]!, [x2, y2] = el.points[i + 1]!;
        const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
        if (len2 === 0) continue;
        const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / len2));
        if (Math.hypot(cx - (x1 + t * dx), cy - (y1 + t * dy)) <= tol + el.strokeWidth) return true;
      }
      return false;
    }
  }
  return false;
}

export function getHandleAt(
  el: ExcaliElement,
  sx: number,
  sy: number,
  pan: { x: number; y: number },
  zoom: number
): HandlePos | null {
  const R = 7;
  const toS = (cx: number, cy: number) => ({ x: cx * zoom + pan.x, y: cy * zoom + pan.y });
  const hit = (hx: number, hy: number) => Math.abs(sx - hx) <= R && Math.abs(sy - hy) <= R;

  if (el.type === "line" || el.type === "arrow") {
    const { x: s1x, y: s1y } = toS(el.x, el.y);
    const { x: s2x, y: s2y } = toS(el.x + el.width, el.y + el.height);
    if (hit(s1x, s1y)) return "p1";
    if (hit(s2x, s2y)) return "p2";
    return null;
  }

  const minX = Math.min(el.x, el.x + el.width), maxX = Math.max(el.x, el.x + el.width);
  const minY = Math.min(el.y, el.y + el.height), maxY = Math.max(el.y, el.y + el.height);
  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
  const { x: l, y: t } = toS(minX, minY);
  const { x: r, y: b } = toS(maxX, maxY);
  const { x: mx } = toS(midX, midY);
  const { y: my } = toS(midX, midY);

  if (hit(l, t)) return "nw";
  if (hit(mx, t)) return "n";
  if (hit(r, t)) return "ne";
  if (hit(l, my)) return "w";
  if (hit(r, my)) return "e";
  if (hit(l, b)) return "sw";
  if (hit(mx, b)) return "s";
  if (hit(r, b)) return "se";
  return null;
}

export function applyResize(orig: ExcaliElement, handle: HandlePos, dx: number, dy: number): ExcaliElement {
  if (handle === "p1") {
    return { ...orig, x: orig.x + dx, y: orig.y + dy, width: orig.width - dx, height: orig.height - dy };
  }
  if (handle === "p2") {
    return { ...orig, width: orig.width + dx, height: orig.height + dy };
  }
  let minX = Math.min(orig.x, orig.x + orig.width);
  let minY = Math.min(orig.y, orig.y + orig.height);
  let maxX = Math.max(orig.x, orig.x + orig.width);
  let maxY = Math.max(orig.y, orig.y + orig.height);

  if (handle === "nw" || handle === "w" || handle === "sw") minX += dx;
  if (handle === "ne" || handle === "e" || handle === "se") maxX += dx;
  if (handle === "nw" || handle === "n" || handle === "ne") minY += dy;
  if (handle === "sw" || handle === "s" || handle === "se") maxY += dy;

  return { ...orig, x: minX, y: minY, width: Math.max(4, maxX - minX), height: Math.max(4, maxY - minY) };
}

export function drawSelectionOverlay(
  ctx: CanvasRenderingContext2D,
  el: ExcaliElement,
  pan: { x: number; y: number },
  zoom: number
) {
  const HS = 8;
  const toS = (cx: number, cy: number) => ({ x: cx * zoom + pan.x, y: cy * zoom + pan.y });

  ctx.save();
  ctx.strokeStyle = "#1971c2";
  ctx.fillStyle = "white";
  ctx.lineWidth = 1.5;

  function drawHandle(hx: number, hy: number) {
    ctx.beginPath();
    ctx.rect(hx - HS / 2, hy - HS / 2, HS, HS);
    ctx.fill();
    ctx.stroke();
  }

  if (el.type === "line" || el.type === "arrow") {
    const { x: s1x, y: s1y } = toS(el.x, el.y);
    const { x: s2x, y: s2y } = toS(el.x + el.width, el.y + el.height);
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(s1x, s1y);
    ctx.lineTo(s2x, s2y);
    ctx.stroke();
    ctx.setLineDash([]);
    drawHandle(s1x, s1y);
    drawHandle(s2x, s2y);
  } else {
    const minX = Math.min(el.x, el.x + el.width), maxX = Math.max(el.x, el.x + el.width);
    const minY = Math.min(el.y, el.y + el.height), maxY = Math.max(el.y, el.y + el.height);
    const { x: sl, y: st } = toS(minX, minY);
    const { x: sr, y: sb } = toS(maxX, maxY);
    const smx = (sl + sr) / 2, smy = (st + sb) / 2;

    ctx.setLineDash([4, 3]);
    ctx.strokeRect(sl - 4, st - 4, sr - sl + 8, sb - st + 8);
    ctx.setLineDash([]);

    for (const [hx, hy] of [[sl, st], [smx, st], [sr, st], [sl, smy], [sr, smy], [sl, sb], [smx, sb], [sr, sb]]) {
      drawHandle(hx!, hy!);
    }
  }
  ctx.restore();
}
