import { describe, expect, it } from "vitest";
import { ALL_PALETTES, PALETTES } from "../engine/index";

describe("palettes", () => {
  it("has all 8 built-ins with unique ids", () => {
    const ids = ALL_PALETTES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ["nes", "gb", "c64", "cga", "pico8", "endesga32", "aap64", "resurrect64"]) {
      expect(PALETTES[id]).toBeDefined();
    }
  });

  it("has correct color counts", () => {
    expect(PALETTES["gb"]?.colors.length).toBe(4);
    expect(PALETTES["c64"]?.colors.length).toBe(16);
    expect(PALETTES["cga"]?.colors.length).toBe(16);
    expect(PALETTES["pico8"]?.colors.length).toBe(16);
    expect(PALETTES["endesga32"]?.colors.length).toBe(32);
    expect(PALETTES["aap64"]?.colors.length).toBe(64);
    expect(PALETTES["resurrect64"]?.colors.length).toBe(64);
    expect(PALETTES["nes"]?.colors.length).toBe(55);
  });

  it("contains no transparent entries and all are fully opaque", () => {
    for (const p of ALL_PALETTES) {
      for (const c of p.colors) {
        expect(c & 0xff).toBe(0xff);
      }
    }
  });
});
