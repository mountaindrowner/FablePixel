/**
 * Density-controlled noise fill with cellular smoothing — the texture engine
 * for organic silhouettes. Shared by character bodies and blob items.
 */

import type { PixelGrid } from "../core/pixelGrid";
import type { Rng } from "../core/rng";

export interface PxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Fill `rect` with `region` pixels at probability `density`, then run
 * cellular smoothing (on if ≥3 of 4 neighbors on, off if ≤1) so speckle
 * congeals into readable masses. Outside-rect counts as off.
 */
export function noiseFill(
  grid: PixelGrid,
  rect: PxRect,
  density: number,
  rng: Rng,
  region: number,
  smoothIterations = 2,
): void {
  const { x: rx, y: ry, w, h } = rect;
  if (w <= 0 || h <= 0) return;

  // Elliptical falloff: full density at the part's center, fading toward the
  // rect edges — noise congeals into one organic mass instead of scattering.
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  let mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / (w / 2 + 0.5);
      const ny = (y - cy) / (h / 2 + 0.5);
      const falloff = Math.max(0, Math.min(1, 2.0 * (1 - (nx * nx + ny * ny))));
      mask[y * w + x] = rng.chance(density * falloff) ? 1 : 0;
    }
  }

  for (let iter = 0; iter < smoothIterations; iter++) {
    const next = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let n = 0;
        if (x > 0 && mask[y * w + x - 1]) n++;
        if (x < w - 1 && mask[y * w + x + 1]) n++;
        if (y > 0 && mask[(y - 1) * w + x]) n++;
        if (y < h - 1 && mask[(y + 1) * w + x]) n++;
        const on = mask[y * w + x] === 1;
        next[y * w + x] = n >= 3 || (on && n >= 2) ? 1 : 0;
      }
    }
    mask = next;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x]) grid.set(rx + x, ry + y, region);
    }
  }
}
