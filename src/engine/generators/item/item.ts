import type { SpriteGenerator, StageContext } from "../registry";
import type { PixelGrid } from "../../core/pixelGrid";
import { drawItem, ITEM_ARCHETYPES, type ItemArchetype } from "./skeletons";
import { buildBlob } from "./blob";

const MIN_OPAQUE_FRACTION = 0.04;

export const itemGenerator: SpriteGenerator = {
  id: "item",

  buildRegions(ctx: StageContext): PixelGrid {
    const { params } = ctx;
    const requested = params.categoryParams?.["archetype"];
    let archetype: ItemArchetype | "blob";
    if (requested === "blob") {
      archetype = "blob";
    } else if (typeof requested === "string" && (ITEM_ARCHETYPES as string[]).includes(requested)) {
      archetype = requested as ItemArchetype;
    } else {
      archetype = ctx.rng.fork("archetype").pick(ITEM_ARCHETYPES);
    }

    const silhouetteRng = ctx.rng.fork("silhouette");
    let grid: PixelGrid;
    if (archetype === "blob") {
      grid = buildBlob(params.width, params.height, params.density, silhouetteRng);
    } else {
      grid = drawItem(archetype, params.width, params.height, silhouetteRng);
      if (grid.countNonTransparent() < params.width * params.height * MIN_OPAQUE_FRACTION) {
        // Degenerate jitter outcome — guaranteed fallback.
        grid = buildBlob(params.width, params.height, params.density, ctx.rng.fork("fallback"));
      }
    }
    return grid;
  },
};
