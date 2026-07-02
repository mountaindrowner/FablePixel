import { create } from "zustand";
import {
  eraDefaults,
  ERA_DEFAULT_PALETTE,
  normalizeSeed,
  randomSeed,
  runPipeline,
  decodeShare,
  type CategoryId,
  type Era,
  type GenerationParams,
  type GenerationResult,
} from "../engine/index";

export const VARIATION_COUNT = 16;

export function defaultParams(): GenerationParams {
  const preset = eraDefaults("16bit", "character");
  return {
    category: "character",
    viewpoint: "top-down",
    era: "16bit",
    paletteId: ERA_DEFAULT_PALETTE["16bit"],
    width: 32,
    height: 32,
    outline: preset.outline,
    symmetry: "horizontal",
    density: preset.density,
    complexity: preset.complexity,
    baseHue: "auto",
    rampLength: preset.rampLength,
    dither: preset.dither,
  };
}

function generateAll(seed: string, params: GenerationParams): GenerationResult[] {
  const results: GenerationResult[] = [];
  for (let i = 0; i < VARIATION_COUNT; i++) {
    results.push(runPipeline({ seed, variationIndex: i, params }));
  }
  return results;
}

interface AppState {
  params: GenerationParams;
  seed: string;
  results: GenerationResult[];
  selectedIndex: number;
  exportSelection: ReadonlySet<number>;
  generate: () => void;
  regenerate: () => void;
  setSeed: (seed: string) => void;
  setParam: <K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) => void;
  setEra: (era: Era) => void;
  setCategory: (category: CategoryId) => void;
  select: (index: number) => void;
  toggleExport: (index: number) => void;
  loadShare: (hash: string) => boolean;
}

function initialState(): { params: GenerationParams; seed: string } {
  const params = defaultParams();
  const seed = randomSeed();
  if (typeof location !== "undefined" && location.hash.length > 1) {
    const spec = decodeShare(location.hash.slice(1), params);
    if (spec) return { params: spec.params, seed: spec.seed };
  }
  return { params, seed };
}

export const useStore = create<AppState>((set, get) => {
  const init = initialState();
  return {
    params: init.params,
    seed: init.seed,
    results: generateAll(init.seed, init.params),
    selectedIndex: 0,
    exportSelection: new Set<number>(),

    generate() {
      const seed = randomSeed();
      const { params } = get();
      set({ seed, results: generateAll(seed, params), exportSelection: new Set() });
    },

    regenerate() {
      const { seed, params } = get();
      set({ results: generateAll(seed, params) });
    },

    setSeed(input) {
      const seed = normalizeSeed(input);
      const { params } = get();
      set({ seed, results: generateAll(seed, params), exportSelection: new Set() });
    },

    setParam(key, value) {
      const params = { ...get().params, [key]: value };
      set({ params, results: generateAll(get().seed, params) });
    },

    setEra(era) {
      const current = get().params;
      const preset = eraDefaults(era, current.category);
      const params: GenerationParams = {
        ...current,
        era,
        paletteId: ERA_DEFAULT_PALETTE[era],
        outline: preset.outline,
        density: preset.density,
        complexity: preset.complexity,
        rampLength: preset.rampLength,
        dither: preset.dither,
      };
      set({ params, results: generateAll(get().seed, params) });
    },

    setCategory(category) {
      const current = get().params;
      const preset = eraDefaults(current.era, category);
      const params: GenerationParams = {
        ...current,
        category,
        outline: preset.outline,
        categoryParams: undefined,
      };
      set({ params, results: generateAll(get().seed, params) });
    },

    select(index) {
      set({ selectedIndex: index });
    },

    toggleExport(index) {
      const next = new Set(get().exportSelection);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      set({ exportSelection: next });
    },

    loadShare(hash) {
      const spec = decodeShare(hash, defaultParams());
      if (!spec) return false;
      set({
        params: spec.params,
        seed: spec.seed,
        results: generateAll(spec.seed, spec.params),
        selectedIndex: Math.max(0, Math.min(VARIATION_COUNT - 1, spec.variationIndex)),
        exportSelection: new Set(),
      });
      return true;
    },
  };
});
