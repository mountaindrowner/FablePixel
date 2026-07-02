import { describe, expect, it } from "vitest";
import { scaleNearest } from "../export/scale";
import { packSheet } from "../export/spritesheet";
import { PixelGrid } from "../engine/index";

const palette = Uint32Array.from([0, 0xff0000ff, 0x00ff00ff]);

function tinyGrid(fillIdx: number): PixelGrid {
  const g = new PixelGrid(4, 4, palette);
  g.fillRect(1, 1, 2, 2, fillIdx);
  return g;
}

describe("scaleNearest", () => {
  it("produces exact dimensions and pixel blocks", () => {
    const img = { data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]), width: 2, height: 1 };
    const scaled = scaleNearest(img, 4);
    expect(scaled.width).toBe(8);
    expect(scaled.height).toBe(4);
    // Every pixel in the left 4x4 block equals source pixel 0.
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const i = (y * 8 + x) * 4;
        expect([scaled.data[i], scaled.data[i + 1], scaled.data[i + 2], scaled.data[i + 3]]).toEqual([
          255, 0, 0, 255,
        ]);
      }
    }
  });

  it("factor 1 copies the buffer", () => {
    const img = { data: new Uint8ClampedArray([1, 2, 3, 4]), width: 1, height: 1 };
    const out = scaleNearest(img, 1);
    expect(Array.from(out.data)).toEqual([1, 2, 3, 4]);
    expect(out.data).not.toBe(img.data);
  });
});

describe("packSheet", () => {
  it("lays out a 4-column grid with recoverable cells", () => {
    const frames = Array.from({ length: 16 }, (_, i) => tinyGrid((i % 2) + 1));
    const sheet = packSheet(frames, { columns: 4, scale: 1 });
    expect(sheet.layout).toEqual({ columns: 4, rows: 4, cellW: 4, cellH: 4, padding: 0 });
    expect(sheet.width).toBe(16);
    expect(sheet.height).toBe(16);

    // Frame 5 (row 1, col 1) recoverable byte-equal from its cell.
    const frame = frames[5]!;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const cellPx = ((4 + y) * 16 + (4 + x)) * 4;
        const c = frame.palette[frame.get(x, y)] as number;
        expect(sheet.data[cellPx]).toBe((c >>> 24) & 0xff);
        expect(sheet.data[cellPx + 3]).toBe(c & 0xff);
      }
    }
  });

  it("applies scale and padding to the layout", () => {
    const frames = [tinyGrid(1), tinyGrid(2)];
    const sheet = packSheet(frames, { columns: 2, scale: 2, padding: 1 });
    expect(sheet.layout.cellW).toBe(8);
    expect(sheet.width).toBe(2 * 8 + 3);
    expect(sheet.height).toBe(8 + 2);
  });

  it("throws on empty input", () => {
    expect(() => packSheet([])).toThrow();
  });
});
