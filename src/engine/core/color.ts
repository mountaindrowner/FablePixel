/** RGBA colors packed as 0xRRGGBBAA in unsigned 32-bit ints. */

export function rgba(r: number, g: number, b: number, a = 255): number {
  return (((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (a & 0xff)) >>> 0;
}

export function hex(color: string): number {
  const s = color.replace("#", "");
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  return rgba(r, g, b, 255);
}

export function red(c: number): number {
  return (c >>> 24) & 0xff;
}
export function green(c: number): number {
  return (c >>> 16) & 0xff;
}
export function blue(c: number): number {
  return (c >>> 8) & 0xff;
}
export function alpha(c: number): number {
  return c & 0xff;
}

/** Perceptual luminance 0..255. */
export function luminance(c: number): number {
  return 0.2126 * red(c) + 0.7152 * green(c) + 0.0722 * blue(c);
}

export interface Hsl {
  h: number; // 0..360
  s: number; // 0..1
  l: number; // 0..1
}

export function toHsl(c: number): Hsl {
  const r = red(c) / 255;
  const g = green(c) / 255;
  const b = blue(c) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

/** Shortest angular distance between two hues, 0..180. */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function toCss(c: number): string {
  return `rgba(${red(c)}, ${green(c)}, ${blue(c)}, ${alpha(c) / 255})`;
}
