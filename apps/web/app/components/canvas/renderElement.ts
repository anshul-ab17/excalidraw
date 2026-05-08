import { getStroke } from "perfect-freehand";
import rough from "roughjs";
import type { Drawable } from "roughjs/bin/core";
import { ExcaliElement } from "./types";
import { getSvgPathFromStroke } from "./canvasUtils";

export type RoughCache = Map<string, { d: Drawable; hash: string }>;
export type PencilCache = Map<string, { path: Path2D; len: number }>;

/** String key encoding all visual properties that affect the rough shape */
function roughHash(el: ExcaliElement): string {
  return `${el.x},${el.y},${el.width},${el.height},${el.strokeColor},${el.strokeWidth},${el.roughness},${el.seed},${el.backgroundColor}`;
}

/** Return a cached Drawable, regenerating only when hash changes */
function getDrawable(
  rc: ReturnType<typeof rough.canvas>,
  cache: RoughCache | undefined,
  id: string,
  hash: string,
  build: (gen: ReturnType<typeof rough.canvas>["generator"]) => Drawable
): Drawable {
  if (!cache) return build(rc.generator);
  const cached = cache.get(id);
  if (cached?.hash === hash) return cached.d;
  const d = build(rc.generator);
  cache.set(id, { d, hash });
  return d;
}

export function renderElement(
  rc: ReturnType<typeof rough.canvas>,
  ctx: CanvasRenderingContext2D,
  el: ExcaliElement,
  imageCache?: Map<string, HTMLImageElement>,
  onImageLoad?: () => void,
  roughCache?: RoughCache,
  pencilCache?: PencilCache,
) {
  ctx.save();
  ctx.globalAlpha = el.opacity / 100;

  if (el.type === "image") {
    if (!el.imageData || !imageCache) { ctx.restore(); return; }
    let img = imageCache.get(el.id);
    if (!img) {
      img = new Image();
      img.onload = () => onImageLoad?.();
      img.src = el.imageData;
      imageCache.set(el.id, img);
    }
    if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, el.x, el.y, el.width, el.height);
    ctx.restore();
    return;
  }

  const opts = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    seed: el.seed,
    fill: el.backgroundColor !== "transparent" ? el.backgroundColor : undefined,
    fillStyle: "solid" as const,
  };
  const hash = roughHash(el);

  switch (el.type) {
    case "rectangle":
      rc.draw(getDrawable(rc, roughCache, el.id, hash,
        g => g.rectangle(el.x, el.y, el.width, el.height, opts)));
      break;

    case "diamond": {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
      rc.draw(getDrawable(rc, roughCache, el.id, hash,
        g => g.polygon([[cx, el.y], [el.x + el.width, cy], [cx, el.y + el.height], [el.x, cy]], opts)));
      break;
    }

    case "ellipse":
      rc.draw(getDrawable(rc, roughCache, el.id, hash,
        g => g.ellipse(el.x + el.width / 2, el.y + el.height / 2, Math.abs(el.width), Math.abs(el.height), opts)));
      break;

    case "line":
      rc.draw(getDrawable(rc, roughCache, el.id, hash,
        g => g.line(el.x, el.y, el.x + el.width, el.y + el.height, opts)));
      break;

    case "arrow": {
      const angle = Math.atan2(el.height, el.width);
      const hl = 15, x2 = el.x + el.width, y2 = el.y + el.height;
      rc.draw(getDrawable(rc, roughCache, el.id, hash,
        g => g.line(el.x, el.y, x2, y2, opts)));
      // Arrow heads are small — skip caching
      const hOpts = { ...opts, roughness: 0 };
      rc.line(x2, y2, x2 - hl * Math.cos(angle - Math.PI / 6), y2 - hl * Math.sin(angle - Math.PI / 6), hOpts);
      rc.line(x2, y2, x2 - hl * Math.cos(angle + Math.PI / 6), y2 - hl * Math.sin(angle + Math.PI / 6), hOpts);
      break;
    }

    case "pencil": {
      if (!el.points || el.points.length < 2) break;
      const len = el.points.length;
      let path: Path2D;
      if (pencilCache) {
        const cached = pencilCache.get(el.id);
        if (cached && cached.len === len) {
          path = cached.path;
        } else {
          // size should be responsive to strokeWidth
          const size = Math.max(1, el.strokeWidth * 1.5);
          const stroke = getStroke(el.points, { 
            size, 
            thinning: 0.5, 
            smoothing: 0.5, 
            streamline: 0.5,
            simulatePressure: true,
          });
          path = new Path2D(getSvgPathFromStroke(stroke));
          pencilCache.set(el.id, { path, len });
        }
      } else {
        const size = Math.max(1, el.strokeWidth * 1.5);
        const stroke = getStroke(el.points, { size, thinning: 0.5, smoothing: 0.5, streamline: 0.5, simulatePressure: true });
        path = new Path2D(getSvgPathFromStroke(stroke));
      }
      ctx.fillStyle = el.strokeColor;
      ctx.fill(path);
      break;
    }

    case "text": {
      const family = el.fontFamily || '"Segoe UI", sans-serif';
      const size = el.fontSize || (16 + el.strokeWidth * 2);
      ctx.font = `${size}px ${family}`;
      ctx.fillStyle = el.strokeColor;
      ctx.textBaseline = "top";
      ctx.fillText(el.text || "", el.x, el.y);
      break;
    }
  }
  ctx.restore();
}
