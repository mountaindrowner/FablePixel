import type { CategoryId, Era, GenerationParams } from "../core/types";

export interface EraPreset {
  rampLength: 2 | 3 | 4;
  dither: boolean;
  outline: GenerationParams["outline"];
  density: number;
  complexity: number;
}

export const ERA_PRESETS: Record<Era, EraPreset> = {
  "8bit": { rampLength: 2, dither: false, outline: "black", density: 0.55, complexity: 0.35 },
  "16bit": { rampLength: 3, dither: true, outline: "selective", density: 0.6, complexity: 0.6 },
  "32bit": { rampLength: 4, dither: true, outline: "selective", density: 0.65, complexity: 0.85 },
};

export const ERA_DEFAULT_PALETTE: Record<Era, string> = {
  "8bit": "gb",
  "16bit": "pico8",
  "32bit": "resurrect64",
};

/** Era defaults, adjusted per category (tiles look wrong with black borders). */
export function eraDefaults(era: Era, category: CategoryId): EraPreset {
  const preset = { ...ERA_PRESETS[era] };
  if (category === "terrain") preset.outline = "none";
  return preset;
}
