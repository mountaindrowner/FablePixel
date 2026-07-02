/** Symmetric organic blob — the guaranteed-output fallback and "misc" archetype. */

import { PixelGrid, keepLargestComponent } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import type { Rng } from "../../core/rng";
import { noiseFill } from "../noiseFill";

export function buildBlob(width: number, height: number, density: number, rng: Rng): PixelGrid {
  const grid = new PixelGrid(width, height, REGION_PALETTE);
  noiseFill(
    grid,
    {
      x: 1 + Math.floor(width * 0.12),
      y: 1 + Math.floor(height * 0.15),
      w: Math.max(2, Math.floor(width * 0.72)),
      h: Math.max(2, Math.floor(height * 0.68)),
    },
    Math.max(0.5, density),
    rng,
    REGION.BODY,
  );
  // Solid core so the blob always exists.
  grid.fillRect(
    Math.floor(width * 0.35),
    Math.floor(height * 0.38),
    Math.max(2, Math.floor(width * 0.3)),
    Math.max(2, Math.floor(height * 0.26)),
    REGION.BODY,
  );
  grid.mirrorX();
  keepLargestComponent(grid);

  // A few accent speckles for interest.
  const speckles = rng.int(1, 4);
  for (let i = 0; i < speckles; i++) {
    const x = rng.int(1, width - 1);
    const y = rng.int(1, height - 1);
    if (grid.get(x, y) === REGION.BODY) grid.set(x, y, REGION.ACCENT);
  }
  return grid;
}
