/**
 * Ordered dithering at shade-band boundaries: where two adjacent pixels sit
 * one step apart on the same ramp, some boundary pixels (per a Bayer 2x2
 * pattern) take their neighbor's shade — the classic softened-band look.
 */

import type { PixelGrid } from "../core/pixelGrid";
import type { ColorRamps, Ramp } from "../core/ramps";

const BAYER2 = [
  [0, 2],
  [3, 1],
];

function rampPosition(ramps: ColorRamps, idx: number): { ramp: Ramp; pos: number } | null {
  for (const ramp of [ramps.body, ramps.secondary, ramps.accent, ramps.skin, ramps.leather, ramps.metal]) {
    if (idx >= ramp.start && idx < ramp.start + ramp.length) {
      return { ramp, pos: idx - ramp.start };
    }
  }
  return null;
}

export function ditherBands(grid: PixelGrid, ramps: ColorRamps): void {
  const src = grid.clone();
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const here = rampPosition(ramps, src.get(x, y));
      if (!here) continue;
      // Look right and down for a same-ramp neighbor one step darker.
      for (const [nx, ny] of [
        [x + 1, y],
        [x, y + 1],
      ] as const) {
        const there = rampPosition(ramps, src.get(nx, ny));
        if (!there || there.ramp.start !== here.ramp.start) continue;
        if (there.pos === here.pos - 1) {
          if ((BAYER2[y % 2] as number[])[x % 2] === 0) {
            grid.set(x, y, here.ramp.start + there.pos);
          }
        }
      }
    }
  }
}
