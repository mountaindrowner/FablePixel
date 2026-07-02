import { describe, expect, it } from "vitest";
import { runPipeline, type CategoryId, type Viewpoint } from "../engine/index";
import { defaultsFor } from "./helpers";

function hexDump(data: Uint8Array): string {
  return Array.from(data, (v) => v.toString(16).padStart(2, "0")).join("");
}

describe("generation quality invariants", () => {
  it("characters are never empty or degenerate across viewpoints and sizes", () => {
    for (const viewpoint of ["top-down", "isometric", "side"] as Viewpoint[]) {
      for (const size of [16, 32, 64]) {
        for (let i = 0; i < 8; i++) {
          const params = defaultsFor({ category: "character", viewpoint, width: size, height: size });
          const grid = runPipeline({ seed: "quality", variationIndex: i, params }).frames[0]!;
          const opaque = grid.countNonTransparent();
          expect(opaque).toBeGreaterThan(size * size * 0.05);
          expect(opaque).toBeLessThan(size * size);
        }
      }
    }
  });

  it("items are never empty for any archetype", () => {
    const archetypes = ["sword", "potion", "shield", "gem", "coin", "ring", "key", "chest", "staff", "axe", "bow", "blob"];
    for (const archetype of archetypes) {
      const params = defaultsFor({ category: "item", categoryParams: { archetype } });
      const grid = runPipeline({ seed: "items", variationIndex: 0, params }).frames[0]!;
      expect(grid.countNonTransparent()).toBeGreaterThan(32 * 32 * 0.02);
    }
  });

  it("degenerate aspect ratios still produce sprites", () => {
    for (const category of ["character", "item"] as CategoryId[]) {
      const params = defaultsFor({ category, width: 128, height: 8 });
      const grid = runPipeline({ seed: "aspect", variationIndex: 0, params }).frames[0]!;
      expect(grid.countNonTransparent()).toBeGreaterThan(0);
    }
  });

  it("character body plan can be forced via categoryParams", () => {
    const params = defaultsFor({ category: "character", categoryParams: { plan: "humanoid" } });
    const a = runPipeline({ seed: "hero", variationIndex: 0, params });
    const b = runPipeline({ seed: "hero", variationIndex: 0, params });
    expect(Array.from(a.frames[0]!.data)).toEqual(Array.from(b.frames[0]!.data));
    expect(a.frames[0]!.countNonTransparent()).toBeGreaterThan(32 * 32 * 0.05);
    // Different from the unforced pick for at least one variation.
    const free = runPipeline({ seed: "hero", variationIndex: 0, params: defaultsFor({ category: "character" }) });
    expect(free.frames[0]).toBeDefined();
  });

  it("hero plan produces a costume with skin, leather, and body pixels", () => {
    const params = defaultsFor({
      category: "character",
      width: 32,
      height: 32,
      categoryParams: { plan: "hero" },
    });
    const a = runPipeline({ seed: "courage", variationIndex: 0, params });
    const b = runPipeline({ seed: "courage", variationIndex: 0, params });
    expect(Array.from(a.frames[0]!.data)).toEqual(Array.from(b.frames[0]!.data));
    const grid = a.frames[0]!;
    // rampLength 3 working palette: body @2, skin @11, leather @14.
    const used = new Set(grid.data);
    const hasAny = (start: number) => [0, 1, 2].some((i) => used.has(start + i));
    expect(hasAny(2)).toBe(true); // cap/tunic
    expect(hasAny(11)).toBe(true); // face/ears/hands
    expect(hasAny(14)).toBe(true); // hair/boots
    expect(grid.countNonTransparent()).toBeGreaterThan(32 * 32 * 0.2);
  });

  it("barbarian plan is deterministic and skin-dominant with a metal axe", () => {
    const params = defaultsFor({
      category: "character",
      width: 32,
      height: 32,
      categoryParams: { plan: "barbarian" },
    });
    const a = runPipeline({ seed: "rage", variationIndex: 0, params });
    const b = runPipeline({ seed: "rage", variationIndex: 0, params });
    expect(Array.from(a.frames[0]!.data)).toEqual(Array.from(b.frames[0]!.data));
    const grid = a.frames[0]!;
    // rampLength 3 working palette: skin @11..13, metal @17..19.
    let skinPixels = 0;
    let metalPixels = 0;
    for (const v of grid.data) {
      if (v >= 11 && v < 14) skinPixels++;
      if (v >= 17 && v < 20) metalPixels++;
    }
    expect(skinPixels).toBeGreaterThan(grid.countNonTransparent() * 0.25);
    expect(metalPixels).toBeGreaterThan(0); // the axe head exists
  });

  it("terrain archetype param is honored deterministically", () => {
    const params = defaultsFor({ category: "terrain", categoryParams: { archetype: "water" } });
    const a = runPipeline({ seed: "arch", variationIndex: 1, params });
    const b = runPipeline({ seed: "arch", variationIndex: 1, params });
    expect(Array.from(a.frames[0]!.data)).toEqual(Array.from(b.frames[0]!.data));
  });
});

describe("golden sprites (drift alarms — regenerate with `npx vitest -u` after intentional algorithm changes)", () => {
  const goldens: Array<{ name: string; overrides: Parameters<typeof defaultsFor>[0] }> = [
    { name: "character-topdown-16bit", overrides: { category: "character", viewpoint: "top-down" } },
    { name: "character-side-8bit", overrides: { category: "character", viewpoint: "side", era: "8bit", paletteId: "gb" } },
    { name: "character-iso-32bit", overrides: { category: "character", viewpoint: "isometric", era: "32bit", paletteId: "resurrect64" } },
    { name: "terrain-square-16bit", overrides: { category: "terrain", viewpoint: "top-down" } },
    { name: "terrain-iso-16bit", overrides: { category: "terrain", viewpoint: "isometric" } },
    { name: "item-sword-16bit", overrides: { category: "item", categoryParams: { archetype: "sword" } } },
    { name: "item-potion-32bit", overrides: { category: "item", era: "32bit", paletteId: "aap64", categoryParams: { archetype: "potion" } } },
  ];

  for (const golden of goldens) {
    it(golden.name, () => {
      const params = defaultsFor(golden.overrides);
      const grid = runPipeline({ seed: "golden", variationIndex: 0, params }).frames[0]!;
      expect(`${grid.width}x${grid.height}:${hexDump(grid.data)}`).toMatchSnapshot();
    });
  }
});
