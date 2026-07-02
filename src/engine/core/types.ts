import type { PixelGrid } from "./pixelGrid";

export type CategoryId = "character" | "terrain" | "item";
export type Viewpoint = "top-down" | "isometric" | "side";
export type Era = "8bit" | "16bit" | "32bit";
export type OutlineMode = "none" | "black" | "selective";
export type SymmetryMode = "none" | "horizontal";

export const MIN_SIZE = 8;
export const MAX_SIZE = 128;

export interface GenerationParams {
  category: CategoryId;
  viewpoint: Viewpoint;
  era: Era;
  paletteId: string;
  width: number;
  height: number;
  outline: OutlineMode;
  symmetry: SymmetryMode;
  /** 0..1 — fill probability of noise stages. */
  density: number;
  /** 0..1 — feature/segment count scaling. */
  complexity: number;
  /** Hue bias 0..360 for ramp selection, or "auto" for seeded random. */
  baseHue: number | "auto";
  rampLength: 2 | 3 | 4;
  dither: boolean;
  categoryParams?: Record<string, unknown>;
}

export interface SpriteSpec {
  seed: string;
  variationIndex: number;
  params: GenerationParams;
}

export interface GenerationResult {
  frames: PixelGrid[];
  meta: {
    seed: string;
    variationIndex: number;
    paramsHash: string;
  };
}

export function clampSize(n: number): number {
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(n) || MIN_SIZE));
}
