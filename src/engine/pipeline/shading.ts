/**
 * Colorize + geometric shading in one pass.
 *
 * Light comes from the top-left. Plain-region pixels on the light rim get a
 * highlight (ramps of 3+), pixels on the dark rim or in the bottom third of
 * their region's bounding box get a shadow. Explicit _SHADOW/_LIGHT/_DEEP
 * region variants pass through untouched. Isometric sprites additionally
 * darken the right third one step (the "far face" cue).
 */

import { PixelGrid, TRANSPARENT } from "../core/pixelGrid";
import { REGION, REGION_STYLE } from "../core/regions";
import { rampIndex, type ColorRamps, type Ramp } from "../core/ramps";
import type { GenerationParams } from "../core/types";

function rampFor(ramps: ColorRamps, name: "body" | "secondary" | "accent"): Ramp {
  return ramps[name];
}

export function colorizeAndShade(
  regions: PixelGrid,
  ramps: ColorRamps,
  params: GenerationParams,
): PixelGrid {
  const { width, height } = regions;
  const out = new PixelGrid(width, height, ramps.working);
  const allowHighlight = params.rampLength >= 3;
  const iso = params.viewpoint === "isometric";
  const isoFarX = Math.floor((width * 2) / 3);

  // Bounding boxes per plain region id, for the bottom-third shadow rule.
  const bboxes = new Map<number, { y0: number; y1: number }>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = regions.get(x, y);
      const style = REGION_STYLE[r];
      if (!style || !style.autoShade) continue;
      const b = bboxes.get(r);
      if (!b) bboxes.set(r, { y0: y, y1: y });
      else {
        if (y < b.y0) b.y0 = y;
        if (y > b.y1) b.y1 = y;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = regions.get(x, y);
      if (r === REGION.EMPTY) continue;
      const style = REGION_STYLE[r];
      if (!style) continue;

      if (style.ramp === "dark") {
        out.set(x, y, ramps.outlineIdx);
        continue;
      }
      if (style.ramp === "light") {
        out.set(x, y, rampIndex(ramps.body, 9)); // clamps to lightest body tone
        continue;
      }

      const ramp = rampFor(ramps, style.ramp);
      let shift = style.shift;

      if (style.autoShade) {
        const upEmpty = regions.get(x, y - 1) === REGION.EMPTY;
        const leftEmpty = regions.get(x - 1, y) === REGION.EMPTY;
        const downEmpty = regions.get(x, y + 1) === REGION.EMPTY;
        const rightEmpty = regions.get(x + 1, y) === REGION.EMPTY;
        const b = bboxes.get(r);
        const inBottomThird = b ? y > b.y0 + ((b.y1 - b.y0) * 2) / 3 : false;

        if (downEmpty || rightEmpty || inBottomThird) shift = -1;
        else if (allowHighlight && (upEmpty || leftEmpty)) shift = 1;
      }

      if (iso && x >= isoFarX && style.autoShade) shift -= 1;

      out.set(x, y, rampIndex(ramp, shift));
    }
  }

  // Safety: no transparent output where a region existed.
  for (let i = 0; i < out.data.length; i++) {
    if (regions.data[i] !== REGION.EMPTY && out.data[i] === TRANSPARENT) {
      out.data[i] = rampIndex(ramps.body, 0);
    }
  }

  return out;
}
