/**
 * Isometric diamond tiles: integer-exact 2:1 stepped diamond mask, with an
 * optional "block" mode that extrudes shaded left/right faces below the top
 * face. Top-face texture is sampled in diamond-local UV space with wrapping
 * so adjacent tiles continue the pattern.
 */

import { PixelGrid } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import type { FieldSampler } from "./wrappedNoise";

export interface IsoLayout {
  /** Diamond (top face) height in px. */
  diamondH: number;
  /** Extruded face depth in px (0 = flat diamond). */
  depth: number;
}

export function isoLayout(width: number, height: number): IsoLayout {
  const diamondH = Math.min(height, Math.max(2, Math.floor(width / 2)));
  const depth = Math.min(Math.max(0, height - diamondH), Math.floor(width / 4));
  return { diamondH, depth };
}

/** Half-width run of the diamond at row y (0-based), integer-exact 2:1 steps. */
function rowRun(y: number, width: number, diamondH: number): number {
  const half = diamondH / 2;
  const dy = y < half ? y : diamondH - 1 - y;
  return Math.min(width, 4 * (dy + 1));
}

export function buildIsoTile(
  width: number,
  height: number,
  bands: number[],
  field: FieldSampler,
): PixelGrid {
  const grid = new PixelGrid(width, height, REGION_PALETTE);
  const { diamondH, depth } = isoLayout(width, height);

  const bottomOf = new Int16Array(width).fill(-1);

  for (let y = 0; y < diamondH; y++) {
    const run = rowRun(y, width, diamondH);
    const x0 = Math.floor((width - run) / 2);
    for (let x = x0; x < x0 + run; x++) {
      // Diamond-local UV (rotated 45°), wrapped for cross-tile continuity.
      const u = (((x / width + y / diamondH) % 1) + 1) % 1;
      const v = (((x / width - y / diamondH) % 1) + 1) % 1;
      const raw = field(u, v);
      // Same contrast stretch as square tiles — fbm clusters around 0.5.
      const value = Math.max(0, Math.min(0.999, (raw - 0.5) * 1.7 + 0.5));
      const band = Math.min(bands.length - 1, Math.floor(value * bands.length));
      grid.set(x, y, bands[band] as number);
      if (y > (bottomOf[x] as number)) bottomOf[x] = y;
    }
  }

  if (depth > 0) {
    for (let x = 0; x < width; x++) {
      const bottom = bottomOf[x] as number;
      if (bottom < 0) continue;
      const face = x < width / 2 ? REGION.BODY_SHADOW : REGION.BODY_DEEP;
      for (let d = 1; d <= depth; d++) {
        grid.set(x, bottom + d, face);
      }
    }
  }

  return grid;
}
