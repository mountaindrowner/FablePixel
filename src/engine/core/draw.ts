/** Small drawing helpers used by generator modules. All operate on region grids. */

import type { PixelGrid } from "./pixelGrid";

export function drawLine(g: PixelGrid, x0: number, y0: number, x1: number, y1: number, idx: number): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    g.set(x0, y0, idx);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

export function fillEllipse(g: PixelGrid, cx: number, cy: number, rx: number, ry: number, idx: number): void {
  const x0 = Math.floor(cx - rx);
  const x1 = Math.ceil(cx + rx);
  const y0 = Math.floor(cy - ry);
  const y1 = Math.ceil(cy + ry);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const nx = (x - cx) / (rx + 0.5);
      const ny = (y - cy) / (ry + 0.5);
      if (nx * nx + ny * ny <= 1) g.set(x, y, idx);
    }
  }
}

/** Rect with corners clipped for a rounded silhouette at pixel scale. */
export function fillRoundedRect(g: PixelGrid, x: number, y: number, w: number, h: number, idx: number): void {
  g.fillRect(x, y, w, h, idx);
  const clip = Math.min(3, Math.max(0, Math.floor(Math.min(w, h) / 5)));
  for (let c = 0; c < clip; c++) {
    const run = clip - c;
    for (let i = 0; i < run; i++) {
      g.set(x + i, y + c, 0);
      g.set(x + w - 1 - i, y + c, 0);
      g.set(x + i, y + h - 1 - c, 0);
      g.set(x + w - 1 - i, y + h - 1 - c, 0);
    }
  }
}
