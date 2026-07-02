import { describe, expect, it } from "vitest";
import { PixelGrid, TRANSPARENT } from "../engine/core/pixelGrid";
import { applyOutline } from "../engine/pipeline/outline";
import { extractRamps } from "../engine/core/ramps";
import { getPalette } from "../engine/index";
import { createRng } from "../engine/core/rng";
import { luminance } from "../engine/core/color";

function makeSprite() {
  const ramps = extractRamps(getPalette("pico8"), 200, 3, createRng("outline-test"));
  const grid = new PixelGrid(16, 16, ramps.working);
  grid.fillRect(4, 4, 8, 8, ramps.body.start + 1);
  grid.fillRect(6, 6, 4, 4, ramps.secondary.start + 1);
  return { grid, ramps };
}

describe("outline", () => {
  it("none: leaves the grid untouched", () => {
    const { grid, ramps } = makeSprite();
    const before = Array.from(grid.data);
    applyOutline(grid, ramps, "none", false);
    expect(Array.from(grid.data)).toEqual(before);
  });

  it("black: every opaque pixel is enclosed (no naked edges)", () => {
    const { grid, ramps } = makeSprite();
    applyOutline(grid, ramps, "black", false);
    // Every non-outline opaque pixel's 4-neighbors are all non-transparent.
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const v = grid.get(x, y);
        if (v === TRANSPARENT || v === ramps.outlineIdx) continue;
        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as const) {
          expect(grid.get(nx, ny)).not.toBe(TRANSPARENT);
        }
      }
    }
  });

  it("selective: opacity mask unchanged and edges darker-or-equal", () => {
    const { grid, ramps } = makeSprite();
    const before = grid.clone();
    applyOutline(grid, ramps, "selective", false);
    for (let i = 0; i < grid.data.length; i++) {
      const wasOpaque = (before.data[i] as number) !== TRANSPARENT;
      const isOpaque = (grid.data[i] as number) !== TRANSPARENT;
      expect(isOpaque).toBe(wasOpaque);
      if (wasOpaque) {
        const lumBefore = luminance(grid.palette[before.data[i] as number] as number);
        const lumAfter = luminance(grid.palette[grid.data[i] as number] as number);
        expect(lumAfter).toBeLessThanOrEqual(lumBefore + 1e-9);
      }
    }
  });
});
