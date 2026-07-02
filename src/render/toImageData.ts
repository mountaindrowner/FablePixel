import type { PixelGrid } from "../engine/index";

/** Palette lookup into an RGBA buffer. Pure math — usable for export too. */
export function toRgba(grid: PixelGrid): Uint8ClampedArray {
  const out = new Uint8ClampedArray(grid.width * grid.height * 4);
  for (let i = 0; i < grid.data.length; i++) {
    const c = grid.palette[grid.data[i] as number] as number;
    out[i * 4] = (c >>> 24) & 0xff;
    out[i * 4 + 1] = (c >>> 16) & 0xff;
    out[i * 4 + 2] = (c >>> 8) & 0xff;
    out[i * 4 + 3] = c & 0xff;
  }
  return out;
}

export function toImageData(grid: PixelGrid): ImageData {
  // Copy into a fresh ArrayBuffer-backed array to satisfy ImageData's typing.
  return new ImageData(new Uint8ClampedArray(toRgba(grid)), grid.width, grid.height);
}
