import { describe, expect, it } from "vitest";
import { runPipeline, type CategoryId, type Era, type GenerationParams, type Viewpoint } from "../engine/index";
import { defaultsFor } from "./helpers";

const CATEGORIES: CategoryId[] = ["character", "terrain", "item"];
const VIEWPOINTS: Viewpoint[] = ["top-down", "isometric", "side"];
const ERAS: Era[] = ["8bit", "16bit", "32bit"];
const PALETTES = ["pico8", "gb"];

describe("determinism", () => {
  it("same spec twice → byte-equal output, across the full matrix", () => {
    for (const category of CATEGORIES) {
      for (const viewpoint of VIEWPOINTS) {
        for (const era of ERAS) {
          for (const paletteId of PALETTES) {
            const params = defaultsFor({ category, viewpoint, era, paletteId });
            const a = runPipeline({ seed: "det-test", variationIndex: 3, params });
            const b = runPipeline({ seed: "det-test", variationIndex: 3, params });
            const gridA = a.frames[0];
            const gridB = b.frames[0];
            expect(gridA).toBeDefined();
            expect(gridB).toBeDefined();
            expect(Array.from(gridA!.data)).toEqual(Array.from(gridB!.data));
            expect(Array.from(gridA!.palette)).toEqual(Array.from(gridB!.palette));
          }
        }
      }
    }
  });

  it("different variation indices → different sprites", () => {
    const params = defaultsFor({ category: "character" });
    const a = runPipeline({ seed: "vary", variationIndex: 0, params });
    const b = runPipeline({ seed: "vary", variationIndex: 1, params });
    expect(Array.from(a.frames[0]!.data)).not.toEqual(Array.from(b.frames[0]!.data));
  });

  it("param isolation: palette change preserves the opacity mask", () => {
    for (const category of CATEGORIES) {
      const p1 = defaultsFor({ category, paletteId: "pico8" });
      const p2 = defaultsFor({ category, paletteId: "endesga32" });
      const a = runPipeline({ seed: "mask-test", variationIndex: 2, params: p1 });
      const b = runPipeline({ seed: "mask-test", variationIndex: 2, params: p2 });
      const maskA = Array.from(a.frames[0]!.data, (v) => (v === 0 ? 0 : 1));
      const maskB = Array.from(b.frames[0]!.data, (v) => (v === 0 ? 0 : 1));
      expect(maskA).toEqual(maskB);
    }
  });

  it("all output pixels index into the working palette", () => {
    for (const category of CATEGORIES) {
      for (const era of ERAS) {
        const params = defaultsFor({ category, era });
        const result = runPipeline({ seed: "range-test", variationIndex: 0, params });
        const grid = result.frames[0]!;
        for (const v of grid.data) {
          expect(v).toBeLessThan(grid.palette.length);
        }
      }
    }
  });

  it("output dimensions honor clamped params", () => {
    const params: GenerationParams = { ...defaultsFor({}), width: 999, height: 4 };
    const result = runPipeline({ seed: "clamp", variationIndex: 0, params });
    expect(result.frames[0]!.width).toBe(128);
    expect(result.frames[0]!.height).toBe(8);
  });
});
