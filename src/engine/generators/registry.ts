import type { PixelGrid } from "../core/pixelGrid";
import type { Rng } from "../core/rng";
import type { ColorRamps } from "../core/ramps";
import type { CategoryId, GenerationParams, SpriteSpec } from "../core/types";

export interface StageContext {
  spec: SpriteSpec;
  params: GenerationParams;
  /** Root rng for this variation. Stages must fork labeled sub-streams. */
  rng: Rng;
  ramps: ColorRamps;
}

export interface SpriteGenerator {
  id: CategoryId;
  /**
   * Optional hue hint consulted when params.baseHue === "auto" — lets
   * category logic (e.g. terrain archetype) steer ramp color. Must derive
   * all randomness from the given rng fork so the choice is reproducible.
   */
  hueHint?(spec: SpriteSpec, rng: Rng): number | undefined;
  /** Produce a grid of REGION ids (see core/regions.ts). */
  buildRegions(ctx: StageContext): PixelGrid;
}

const generators = new Map<CategoryId, SpriteGenerator>();

export function registerGenerator(gen: SpriteGenerator): void {
  generators.set(gen.id, gen);
}

export function getGenerator(id: CategoryId): SpriteGenerator {
  const g = generators.get(id);
  if (!g) throw new Error(`no generator registered for category: ${id}`);
  return g;
}
