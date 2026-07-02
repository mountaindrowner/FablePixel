/**
 * Stage orchestration. Every stage draws randomness from its own labeled
 * fork of the variation's root rng, so a change in one stage's consumption
 * can never scramble another stage's output.
 */

import { createRng } from "../core/rng";
import { extractRamps } from "../core/ramps";
import { getPalette } from "../palettes/index";
import { getGenerator } from "../generators/registry";
import { colorizeAndShade } from "./shading";
import { ditherBands } from "./dither";
import { applyOutline } from "./outline";
import { cleanup } from "./cleanup";
import { clampSize, type GenerationResult, type SpriteSpec } from "../core/types";
import { paramsHash, variationSeed } from "../seed";

export function runPipeline(spec: SpriteSpec): GenerationResult {
  const params = {
    ...spec.params,
    width: clampSize(spec.params.width),
    height: clampSize(spec.params.height),
  };
  const root = createRng(variationSeed(spec.seed, spec.variationIndex));
  const generator = getGenerator(params.category);

  let hue = params.baseHue;
  if (hue === "auto" && generator.hueHint) {
    const hint = generator.hueHint(spec, root.fork("hue-hint"));
    if (hint !== undefined) hue = hint;
  }

  const palette = getPalette(params.paletteId);
  const ramps = extractRamps(palette, hue, params.rampLength, root.fork("color"));

  const regions = generator.buildRegions({ spec, params, rng: root, ramps });
  const grid = colorizeAndShade(regions, ramps, params);

  if (params.dither) ditherBands(grid, ramps);
  applyOutline(grid, ramps, params.outline, params.era === "32bit");
  cleanup(grid);

  return {
    frames: [grid],
    meta: {
      seed: spec.seed,
      variationIndex: spec.variationIndex,
      paramsHash: paramsHash(params),
    },
  };
}
