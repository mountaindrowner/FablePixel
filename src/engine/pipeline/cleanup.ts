/**
 * Post-pass hygiene: remove fully isolated pixels (0 opaque 4-neighbors) and
 * fill 1px holes (transparent with 4 opaque neighbors) with the most common
 * neighboring index.
 */

import { PixelGrid, TRANSPARENT } from "../core/pixelGrid";

export function cleanup(grid: PixelGrid): void {
  const src = grid.clone();

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const v = src.get(x, y);
      const n = [src.get(x - 1, y), src.get(x + 1, y), src.get(x, y - 1), src.get(x, y + 1)];
      const opaque = n.filter((i) => i !== TRANSPARENT);

      if (v !== TRANSPARENT && opaque.length === 0) {
        grid.set(x, y, TRANSPARENT);
        continue;
      }
      if (v === TRANSPARENT && opaque.length === 4) {
        const counts = new Map<number, number>();
        for (const i of opaque) counts.set(i, (counts.get(i) ?? 0) + 1);
        let best = opaque[0] as number;
        let bestCount = 0;
        for (const [idx, count] of counts) {
          if (count > bestCount) {
            best = idx;
            bestCount = count;
          }
        }
        grid.set(x, y, best);
      }
    }
  }
}
