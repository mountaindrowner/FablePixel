import { describe, expect, it } from "vitest";
import { PixelGrid, TRANSPARENT, keepLargestComponent } from "../engine/core/pixelGrid";

const palette = Uint32Array.from([0, 0xff0000ff, 0x00ff00ff, 0x0000ffff]);

describe("PixelGrid", () => {
  it("requires transparent palette slot 0", () => {
    expect(() => new PixelGrid(4, 4, Uint32Array.from([0xff0000ff]))).toThrow();
  });

  it("out-of-bounds get is transparent, set is a no-op", () => {
    const g = new PixelGrid(4, 4, palette);
    expect(g.get(-1, 0)).toBe(TRANSPARENT);
    expect(g.get(0, 99)).toBe(TRANSPARENT);
    g.set(-1, -1, 2);
    expect(g.countNonTransparent()).toBe(0);
  });

  it("blit skips transparent pixels", () => {
    const dst = new PixelGrid(4, 4, palette);
    dst.fillRect(0, 0, 4, 4, 1);
    const src = new PixelGrid(2, 2, palette);
    src.set(0, 0, 2);
    dst.blit(src, 1, 1);
    expect(dst.get(1, 1)).toBe(2);
    expect(dst.get(2, 1)).toBe(1); // transparent src pixel didn't overwrite
  });

  it("mirrorX produces exact symmetry", () => {
    const g = new PixelGrid(8, 4, palette);
    g.set(1, 2, 3);
    g.set(0, 0, 2);
    g.mirrorX();
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        expect(g.get(x, y)).toBe(g.get(7 - x, y));
      }
    }
  });

  it("keepLargestComponent drops islands but keeps anchors", () => {
    const g = new PixelGrid(8, 8, palette);
    g.fillRect(0, 0, 4, 4, 1); // big
    g.set(7, 7, 2); // island
    g.set(6, 0, 3); // anchored island
    keepLargestComponent(g, [{ x: 6, y: 0 }]);
    expect(g.get(1, 1)).toBe(1);
    expect(g.get(7, 7)).toBe(TRANSPARENT);
    expect(g.get(6, 0)).toBe(3);
  });
});
