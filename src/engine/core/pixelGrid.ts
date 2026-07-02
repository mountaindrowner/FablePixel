/**
 * The engine's data model: a grid of palette indices plus a working palette
 * of packed RGBA colors. Index 0 is always transparent.
 */

export const TRANSPARENT = 0;

export class PixelGrid {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
  palette: Uint32Array;

  constructor(width: number, height: number, palette: Uint32Array, data?: Uint8Array) {
    this.width = width;
    this.height = height;
    if (palette[0] !== 0) {
      throw new Error("palette[0] must be transparent (0x00000000)");
    }
    this.palette = palette;
    this.data = data ?? new Uint8Array(width * height);
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  get(x: number, y: number): number {
    if (!this.inBounds(x, y)) return TRANSPARENT;
    return this.data[y * this.width + x] as number;
  }

  set(x: number, y: number, idx: number): void {
    if (!this.inBounds(x, y)) return;
    this.data[y * this.width + x] = idx;
  }

  clone(): PixelGrid {
    return new PixelGrid(this.width, this.height, this.palette, new Uint8Array(this.data));
  }

  fill(idx: number): void {
    this.data.fill(idx);
  }

  fillRect(x: number, y: number, w: number, h: number, idx: number): void {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        this.set(xx, yy, idx);
      }
    }
  }

  /** Composite src onto this grid, skipping transparent pixels. */
  blit(src: PixelGrid, dx: number, dy: number): void {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const v = src.get(x, y);
        if (v !== TRANSPARENT) this.set(dx + x, dy + y, v);
      }
    }
  }

  /** Mirror the left half onto the right half (odd widths keep center column). */
  mirrorX(): void {
    const half = Math.floor(this.width / 2);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < half; x++) {
        this.set(this.width - 1 - x, y, this.get(x, y));
      }
    }
  }

  mirrorY(): void {
    const half = Math.floor(this.height / 2);
    for (let y = 0; y < half; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, this.height - 1 - y, this.get(x, y));
      }
    }
  }

  /** Substitute indices in place: data[i] = map[data[i]]. */
  remap(map: Uint8Array): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = map[this.data[i] as number] as number;
    }
  }

  countNonTransparent(): number {
    let n = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] !== TRANSPARENT) n++;
    }
    return n;
  }

  /** Visit every opaque pixel that has at least one transparent 4-neighbor. */
  forEachEdgePixel(cb: (x: number, y: number, idx: number) => void): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const v = this.get(x, y);
        if (v === TRANSPARENT) continue;
        if (
          this.get(x - 1, y) === TRANSPARENT ||
          this.get(x + 1, y) === TRANSPARENT ||
          this.get(x, y - 1) === TRANSPARENT ||
          this.get(x, y + 1) === TRANSPARENT
        ) {
          cb(x, y, v);
        }
      }
    }
  }
}

/**
 * Keep only the largest 4-connected opaque component; clear the rest.
 * `mustKeep` points force their components to be kept too.
 */
export function keepLargestComponent(grid: PixelGrid, mustKeep: Array<{ x: number; y: number }> = []): void {
  const { width, height, data } = grid;
  const labels = new Int32Array(width * height).fill(-1);
  const sizes: number[] = [];
  let nextLabel = 0;

  const stack: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i] === TRANSPARENT || labels[i] !== -1) continue;
    const label = nextLabel++;
    let size = 0;
    stack.push(i);
    labels[i] = label;
    while (stack.length) {
      const p = stack.pop() as number;
      size++;
      const x = p % width;
      const y = Math.floor(p / width);
      const neighbors = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1,
      ];
      for (const q of neighbors) {
        if (q >= 0 && data[q] !== TRANSPARENT && labels[q] === -1) {
          labels[q] = label;
          stack.push(q);
        }
      }
    }
    sizes.push(size);
  }

  if (sizes.length <= 1) return;

  let best = 0;
  for (let l = 1; l < sizes.length; l++) {
    if ((sizes[l] as number) > (sizes[best] as number)) best = l;
  }
  const keep = new Set<number>([best]);
  for (const pt of mustKeep) {
    if (grid.inBounds(pt.x, pt.y)) {
      const l = labels[pt.y * width + pt.x] as number;
      if (l >= 0) keep.add(l);
    }
  }
  for (let i = 0; i < data.length; i++) {
    if (data[i] !== TRANSPARENT && !keep.has(labels[i] as number)) {
      data[i] = TRANSPARENT;
    }
  }
}
