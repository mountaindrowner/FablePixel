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
    const requested = params.categoryParams?.["plan"];
    const eligible = plansFor(params.viewpoint, params.complexity);
    const forced = typeof requested === "string" ? eligible.find((p) => p.id === requested) : undefined;
    const plan = forced ?? planRng.pick(eligible);

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
