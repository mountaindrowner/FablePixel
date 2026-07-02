import { HARDWARE_PALETTES } from "./hardware";
import { COMMUNITY_PALETTES } from "./community";

export interface Palette {
  id: string;
  name: string;
  /** Packed 0xRRGGBBAA. Never contains a transparent entry. */
  colors: Uint32Array;
  source: string;
}

export const ALL_PALETTES: Palette[] = [...COMMUNITY_PALETTES, ...HARDWARE_PALETTES];

export const PALETTES: Record<string, Palette> = Object.fromEntries(
  ALL_PALETTES.map((p) => [p.id, p]),
);

export function getPalette(id: string): Palette {
  const p = PALETTES[id];
  if (!p) throw new Error(`unknown palette: ${id}`);
  return p;
}
