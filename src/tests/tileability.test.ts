import { describe, expect, it } from "vitest";
import { createRng } from "../engine/core/rng";
import { makeWrappedFbmSampler, makeWrappedNoiseSampler } from "../engine/generators/terrain/wrappedNoise";
import { isoLayout } from "../engine/generators/terrain/isoTile";
import { runPipeline, TRANSPARENT } from "../engine/index";
import { defaultsFor } from "./helpers";

describe("tileability", () => {
  it("wrapped noise: field(0,v) === field(1,v) and field(u,0) === field(u,1)", () => {
    const noise = makeWrappedNoiseSampler(4, createRng("tile"));
    for (let i = 0; i < 32; i++) {
      const t = i / 32;
      expect(noise(0, t)).toBeCloseTo(noise(1, t), 10);
      expect(noise(t, 0)).toBeCloseTo(noise(t, 1), 10);
    }
  });

  it("wrapped fbm keeps the wrap property across octaves", () => {
    const fbm = makeWrappedFbmSampler(3, 3, createRng("fbm"));
    for (let i = 0; i < 32; i++) {
      const t = i / 32;
      expect(fbm(0, t)).toBeCloseTo(fbm(1, t), 10);
      expect(fbm(t, 0)).toBeCloseTo(fbm(t, 1), 10);
    }
  });

  it("square terrain tiles are fully opaque", () => {
    const params = defaultsFor({ category: "terrain", viewpoint: "top-down" });
    const grid = runPipeline({ seed: "tile-opaque", variationIndex: 0, params }).frames[0]!;
    expect(grid.countNonTransparent()).toBe(grid.width * grid.height);
  });

  it("iso diamond: left-right symmetric mask, nothing outside the diamond+faces", () => {
    const params = defaultsFor({ category: "terrain", viewpoint: "isometric", outline: "none" });
    const grid = runPipeline({ seed: "iso-tile", variationIndex: 0, params }).frames[0]!;
    const { diamondH, depth } = isoLayout(grid.width, grid.height);

    // Opacity mask is mirror-symmetric within the diamond rows.
    for (let y = 0; y < diamondH; y++) {
      for (let x = 0; x < grid.width; x++) {
        const a = grid.get(x, y) === TRANSPARENT;
        const b = grid.get(grid.width - 1 - x, y) === TRANSPARENT;
        expect(a).toBe(b);
      }
    }
    // Nothing below the extruded faces.
    for (let y = diamondH + depth; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        expect(grid.get(x, y)).toBe(TRANSPARENT);
      }
    }
    // The diamond has content.
    expect(grid.countNonTransparent()).toBeGreaterThan((grid.width * diamondH) / 4);
  });
});
