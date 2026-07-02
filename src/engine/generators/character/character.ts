import type { SpriteGenerator, StageContext } from "../registry";
import type { PixelGrid } from "../../core/pixelGrid";
import { plansFor } from "./bodyPlans";
import { buildSilhouette } from "./silhouette";
import { placeFeatures } from "./features";

export const characterGenerator: SpriteGenerator = {
  id: "character",

  buildRegions(ctx: StageContext): PixelGrid {
    const { params } = ctx;
    const planRng = ctx.rng.fork("plan");
    const plan = planRng.pick(plansFor(params.viewpoint, params.complexity));

    const mirrorOverride = params.symmetry === "none" ? false : null;
    const grid = buildSilhouette(
      plan,
      params.width,
      params.height,
      params.density,
      mirrorOverride,
      ctx.rng.fork("silhouette"),
    );
    placeFeatures(grid, plan, params.complexity, ctx.rng.fork("detail"));
    return grid;
  },
};
