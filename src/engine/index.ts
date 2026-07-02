/** Public engine API. Registers all generators on import. */

import { registerGenerator } from "./generators/registry";
import { characterGenerator } from "./generators/character/character";
import { terrainGenerator } from "./generators/terrain/terrain";
import { itemGenerator } from "./generators/item/item";

registerGenerator(characterGenerator);
registerGenerator(terrainGenerator);
registerGenerator(itemGenerator);

export { runPipeline } from "./pipeline/pipeline";
export { PixelGrid, TRANSPARENT } from "./core/pixelGrid";
export { createRng } from "./core/rng";
export type { Rng } from "./core/rng";
export {
  clampSize,
  MIN_SIZE,
  MAX_SIZE,
  type CategoryId,
  type Viewpoint,
  type Era,
  type OutlineMode,
  type GenerationParams,
  type GenerationResult,
  type SpriteSpec,
} from "./core/types";
export { ALL_PALETTES, PALETTES, getPalette, type Palette } from "./palettes/index";
export { ERA_PRESETS, ERA_DEFAULT_PALETTE, eraDefaults } from "./presets/eras";
export {
  randomSeed,
  normalizeSeed,
  variationSeed,
  paramsHash,
  encodeShare,
  decodeShare,
} from "./seed";
export { ITEM_ARCHETYPES } from "./generators/item/skeletons";
export { CHARACTER_PLAN_IDS } from "./generators/character/bodyPlans";
export { archetypeFor, TERRAIN_ARCHETYPES } from "./generators/terrain/terrain";
