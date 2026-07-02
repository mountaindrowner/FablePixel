import { eraDefaults, type GenerationParams } from "../engine/index";

/** Concrete params for tests: era preset defaults + overrides. */
export function defaultsFor(overrides: Partial<GenerationParams>): GenerationParams {
  const era = overrides.era ?? "16bit";
  const category = overrides.category ?? "character";
  const preset = eraDefaults(era, category);
  return {
    category,
    viewpoint: "top-down",
    era,
    paletteId: "pico8",
    width: 32,
    height: 32,
    outline: preset.outline,
    symmetry: "horizontal",
    density: preset.density,
    complexity: preset.complexity,
    baseHue: "auto",
    rampLength: preset.rampLength,
    dither: preset.dither,
    ...overrides,
  };
}
