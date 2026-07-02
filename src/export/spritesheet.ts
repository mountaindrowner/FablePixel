/** Pure spritesheet packing: uniform-cell grid layout on raw RGBA buffers. */

import type { PixelGrid } from "../engine/index";
import { toRgba } from "../render/toImageData";
import { scaleNearest, type RgbaImage } from "./scale";

export interface SheetLayout {
  columns: number;
  rows: number;
  cellW: number;
  cellH: number;
  padding: number;
}

export interface SheetResult extends RgbaImage {
  layout: SheetLayout;
}

export function packSheet(
  frames: PixelGrid[],
  opts: { columns?: number; padding?: number; scale?: number } = {},
): SheetResult {
  if (frames.length === 0) throw new Error("packSheet: no frames");
  const scale = Math.max(1, Math.floor(opts.scale ?? 1));
  const padding = Math.max(0, Math.floor(opts.padding ?? 0));
  const columns = Math.max(1, Math.floor(opts.columns ?? Math.min(4, frames.length)));
  const rows = Math.ceil(frames.length / columns);

  let cellW = 0;
  let cellH = 0;
  for (const f of frames) {
    cellW = Math.max(cellW, f.width * scale);
    cellH = Math.max(cellH, f.height * scale);
  }

  const width = columns * cellW + padding * (columns + 1);
  const height = rows * cellH + padding * (rows + 1);
  const data = new Uint8ClampedArray(width * height * 4);

  frames.forEach((frame, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const img = scaleNearest({ data: toRgba(frame), width: frame.width, height: frame.height }, scale);
    const ox = padding + col * (cellW + padding);
    const oy = padding + row * (cellH + padding);
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const si = (y * img.width + x) * 4;
        const di = ((oy + y) * width + (ox + x)) * 4;
        data[di] = img.data[si] as number;
        data[di + 1] = img.data[si + 1] as number;
        data[di + 2] = img.data[si + 2] as number;
        data[di + 3] = img.data[si + 3] as number;
      }
    }
  });

  return { data, width, height, layout: { columns, rows, cellW, cellH, padding } };
}
