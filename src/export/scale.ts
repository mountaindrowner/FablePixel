/** Pure nearest-neighbor integer upscaling on raw RGBA buffers. */

export interface RgbaImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function scaleNearest(img: RgbaImage, factor: number): RgbaImage {
  const f = Math.max(1, Math.floor(factor));
  if (f === 1) return { data: new Uint8ClampedArray(img.data), width: img.width, height: img.height };
  const width = img.width * f;
  const height = img.height * f;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const sy = Math.floor(y / f);
    for (let x = 0; x < width; x++) {
      const sx = Math.floor(x / f);
      const si = (sy * img.width + sx) * 4;
      const di = (y * width + x) * 4;
      data[di] = img.data[si] as number;
      data[di + 1] = img.data[si + 1] as number;
      data[di + 2] = img.data[si + 2] as number;
      data[di + 3] = img.data[si + 3] as number;
    }
  }
  return { data, width, height };
}
