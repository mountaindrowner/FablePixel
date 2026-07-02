/**
 * Terrain tiles: wrapped-noise fields thresholded into shade bands, plus a
 * per-archetype decoration pass (grass blades, stone cracks, water streaks).
 * Square tiles are seamless by construction; isometric mode produces diamond
 * tiles (flat or extruded block).
 */

import { PixelGrid } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import { createRng, type Rng } from "../../core/rng";
import type { SpriteSpec } from "../../core/types";
import { variationSeed } from "../../seed";
import type { SpriteGenerator, StageContext } from "../registry";
import { makeWrappedFbmSampler } from "./wrappedNoise";
import { buildIsoTile } from "./isoTile";

export type TerrainArchetype = "grass" | "dirt" | "stone" | "water" | "sand" | "lava";

export const TERRAIN_ARCHETYPES: TerrainArchetype[] = ["grass", "dirt", "stone", "water", "sand", "lava"];
const ARCHETYPES = TERRAIN_ARCHETYPES;

const ARCHETYPE_HUE: Record<TerrainArchetype, number> = {
  grass: 110,
  dirt: 30,
  stone: 225,
  water: 210,
  sand: 45,
  lava: 15,
};

/**
 * Archetype must be identical in hueHint and buildRegions, so it is derived
 * straight from the variation seed rather than from either stage's rng.
 */
export function archetypeFor(spec: SpriteSpec): TerrainArchetype {
  const requested = spec.params.categoryParams?.["archetype"];
  if (typeof requested === "string" && (ARCHETYPES as string[]).includes(requested)) {
    return requested as TerrainArchetype;
  }
  const rng = createRng(`${variationSeed(spec.seed, spec.variationIndex)}/archetype`);
  return rng.pick(ARCHETYPES);
}

/**
 * Shade bands (dark → light region variants) sized to the ramp length.
 * All bands are fixed variants — terrain must not be geometrically shaded.
 */
function bandsFor(rampLength: number): number[] {
  if (rampLength >= 4) {
    return [REGION.BODY_DEEP, REGION.BODY_SHADOW, REGION.BODY_BASE, REGION.BODY_LIGHT];
  }
  if (rampLength === 3) return [REGION.BODY_SHADOW, REGION.BODY_BASE, REGION.BODY_LIGHT];
  return [REGION.BODY_SHADOW, REGION.BODY_BASE];
}

function decorate(grid: PixelGrid, archetype: TerrainArchetype, complexity: number, rng: Rng): void {
  const { width, height } = grid;
  const count = Math.max(1, Math.round(width * complexity * 0.5));

  const setIfOpaque = (x: number, y: number, region: number) => {
    if (grid.get(x, y) !== REGION.EMPTY) grid.set(x, y, region);
  };

  switch (archetype) {
    case "grass": {
      for (let i = 0; i < count; i++) {
        const x = rng.int(0, width);
        const y = rng.int(0, height);
        setIfOpaque(x, y, REGION.BODY_DEEP);
        if (rng.chance(0.5)) setIfOpaque(x, y - 1, REGION.BODY_SHADOW);
      }
      break;
    }
    case "dirt":
    case "sand": {
      for (let i = 0; i < count; i++) {
        setIfOpaque(rng.int(0, width), rng.int(0, height), rng.chance(0.5) ? REGION.BODY_SHADOW : REGION.BODY_LIGHT);
      }
      break;
    }
    case "stone": {
      const cracks = Math.max(1, Math.round(complexity * 3));
      for (let c = 0; c < cracks; c++) {
        let x = rng.int(0, width);
        let y = rng.int(0, height);
        const steps = rng.int(3, Math.max(4, Math.floor(width / 2)));
        for (let s = 0; s < steps; s++) {
          setIfOpaque(x, y, REGION.BODY_DEEP);
          x += rng.int(-1, 2);
          y += rng.chance(0.7) ? 1 : 0;
        }
      }
      break;
    }
    case "water": {
      const streaks = Math.max(1, Math.round(complexity * 4));
      for (let s = 0; s < streaks; s++) {
        const y = rng.int(0, height);
        const x = rng.int(0, width);
        const len = rng.int(2, Math.max(3, Math.floor(width / 3)));
        for (let i = 0; i < len; i++) setIfOpaque(x + i, y, REGION.BODY_LIGHT);
      }
      break;
    }
    case "lava": {
      for (let i = 0; i < count; i++) {
        const x = rng.int(0, width);
        const y = rng.int(0, height);
        setIfOpaque(x, y, REGION.ACCENT_LIGHT);
      }
      break;
    }
  }
}

export const terrainGenerator: SpriteGenerator = {
  id: "terrain",

  hueHint(spec) {
    return ARCHETYPE_HUE[archetypeFor(spec)];
  },

  buildRegions(ctx: StageContext): PixelGrid {
    const { params, spec } = ctx;
    const archetype = archetypeFor(spec);
    const noiseRng = ctx.rng.fork("silhouette");
    const detailRng = ctx.rng.fork("detail");
    const bands = bandsFor(params.rampLength);

    const baseCells = Math.max(2, Math.round(2 + params.complexity * 3));
    const octaves = params.width >= 32 ? 3 : 2;
    const field = makeWrappedFbmSampler(baseCells, octaves, noiseRng);

    let grid: PixelGrid;
    if (params.viewpoint === "isometric") {
      grid = buildIsoTile(params.width, params.height, bands, field);
    } else {
      grid = new PixelGrid(params.width, params.height, REGION_PALETTE);
      for (let y = 0; y < params.height; y++) {
        for (let x = 0; x < params.width; x++) {
          const raw = field(x / params.width, y / params.height);
          // fbm clusters around 0.5 — stretch so outer bands actually appear.
          const value = Math.max(0, Math.min(0.999, (raw - 0.5) * 1.7 + 0.5));
          const band = Math.min(bands.length - 1, Math.floor(value * bands.length));
          grid.set(x, y, bands[band] as number);
        }
      }
    }

    decorate(grid, archetype, params.complexity, detailRng);
    return grid;
  },
};
