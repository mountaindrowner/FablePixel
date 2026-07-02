/**
 * Outline passes.
 *
 * - "black": every transparent pixel 4-adjacent to an opaque pixel becomes
 *   the outline color (grows the sprite by 1px — generators reserve margin).
 * - "selective": opaque edge pixels are darkened one ramp step in place
 *   ("selout"); optionally interior boundaries between different ramps get a
 *   1-step darkening on the lower/right side too (32-bit look).
 */

import { PixelGrid, TRANSPARENT } from "../core/pixelGrid";
import type { ColorRamps, Ramp } from "../core/ramps";
import type { OutlineMode } from "../core/types";

function darkerMap(ramps: ColorRamps, paletteSize: number): Uint8Array {
  const map = new Uint8Array(paletteSize);
  for (let i = 0; i < paletteSize; i++) map[i] = i;
  for (const ramp of [ramps.body, ramps.secondary, ramps.accent]) {
    for (let p = 1; p < ramp.length; p++) {
      map[ramp.start + p] = ramp.start + p - 1;
    }
    // Darkest ramp entry darkens to the outline color.
    map[ramp.start] = ramps.outlineIdx;
  }
  return map;
}

function rampOf(ramps: ColorRamps, idx: number): Ramp | null {
  for (const ramp of [ramps.body, ramps.secondary, ramps.accent]) {
    if (idx >= ramp.start && idx < ramp.start + ramp.length) return ramp;
  }
  return null;
}

export function applyOutline(
  grid: PixelGrid,
  ramps: ColorRamps,
  mode: OutlineMode,
  innerEdges: boolean,
): void {
  if (mode === "none") return;

  if (mode === "black") {
    const src = grid.clone();
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (src.get(x, y) !== TRANSPARENT) continue;
        if (
          src.get(x - 1, y) !== TRANSPARENT ||
          src.get(x + 1, y) !== TRANSPARENT ||
          src.get(x, y - 1) !== TRANSPARENT ||
          src.get(x, y + 1) !== TRANSPARENT
        ) {
          grid.set(x, y, ramps.outlineIdx);
        }
      }
    }
    return;
  }

  // selective
  const map = darkerMap(ramps, grid.palette.length);
  const src = grid.clone();
  src.forEachEdgePixel((x, y, idx) => {
    grid.set(x, y, map[idx] as number);
  });

  if (innerEdges) {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const here = src.get(x, y);
        if (here === TRANSPARENT) continue;
        const hereRamp = rampOf(ramps, here);
        if (!hereRamp) continue;
        const up = src.get(x, y - 1);
        const left = src.get(x - 1, y);
        const upRamp = up === TRANSPARENT ? null : rampOf(ramps, up);
        const leftRamp = left === TRANSPARENT ? null : rampOf(ramps, left);
        // Lower/right side of a boundary between two different ramps.
        if ((upRamp && upRamp !== hereRamp) || (leftRamp && leftRamp !== hereRamp)) {
          grid.set(x, y, map[here] as number);
        }
      }
    }
  }
}
