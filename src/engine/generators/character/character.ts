import type { SpriteGenerator, StageContext } from "../registry";
import type { PixelGrid } from "../../core/pixelGrid";
import { plansFor } from "./bodyPlans";
import { buildSilhouette } from "./silhouette";
import { placeFeatures } from "./features";
import { drawHero, HERO_DEFAULT_HUE } from "./hero";
import { drawKnight, KNIGHT_DEFAULT_HUE } from "./knight";
import { drawBarbarian } from "./barbarian";

function requestedPlan(params: StageContext["params"]): string | undefined {
  const p = params.categoryParams?.["plan"];
  return typeof p === "string" ? p : undefined;
}

export const characterGenerator: SpriteGenerator = {
  id: "character",

  hueHint(spec) {
    // Costume templates default to their classic colors unless a hue is set:
    // hero → green tunic, knight → heraldic red plume/shield.
    const plan = spec.params.categoryParams?.["plan"];
    if (plan === "hero") return HERO_DEFAULT_HUE;
    if (plan === "knight") return KNIGHT_DEFAULT_HUE;
    return undefined;
  },

  buildRegions(ctx: StageContext): PixelGrid {
    const { params } = ctx;
    const requested = requestedPlan(params);

    if (requested === "hero") {
      return drawHero(params.width, params.height, ctx.rng.fork("silhouette"));
    }
    if (requested === "knight") {
      return drawKnight(params.width, params.height, ctx.rng.fork("silhouette"));
    }
    if (requested === "barbarian") {
      return drawBarbarian(params.width, params.height, ctx.rng.fork("silhouette"));
    }

    const planRng = ctx.rng.fork("plan");
    const eligible = plansFor(params.viewpoint, params.complexity);
    const forced = requested ? eligible.find((p) => p.id === requested) : undefined;
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
