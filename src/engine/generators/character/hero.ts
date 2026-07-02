/**
 * Dedicated "hero" body plan: the classic top-down RPG protagonist read as a
 * vertical stack of costume bands — pointed cap, brim, hair fringe, face
 * with eyes and ears, tunic with collar and buckle, hands, boots. Drawn as a
 * structured template (not noise) so the costume grammar always reads;
 * seeded jitter varies cap lean, proportions, and trim.
 *
 * Ramp usage: cap/tunic = body (user hue, green by default), hair/boots =
 * leather, face/ears/hands = skin, buckle = accent.
 */

import { PixelGrid } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import type { Rng } from "../../core/rng";

export const HERO_DEFAULT_HUE = 110;

export function drawHero(width: number, height: number, rng: Rng): PixelGrid {
  const g = new PixelGrid(width, height, REGION_PALETTE);
  const m = 1; // outline margin
  const innerH = height - m * 2;
  const Y = (f: number) => m + Math.round(f * innerH);
  const W = (f: number) => Math.max(1, Math.round(f * width));

  const fillCentered = (y0: number, y1: number, wpx: number, region: number) => {
    const x0 = Math.floor((width - wpx) / 2);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x0 + wpx; x++) g.set(x, y, region);
    }
  };

  // ---- vertical layout ----
  const capTipY = Y(0.02);
  const capBrimY = Y(rng.range(0.26, 0.31));
  const brimBottomY = capBrimY + Math.max(1, Math.round(innerH * 0.07));
  const hairBottomY = Y(0.56); // hair side-frames run down beside the face
  const faceTopY = brimBottomY + Math.max(1, Math.round(innerH * 0.045));
  const faceBottomY = Y(0.63);
  const tunicTopY = faceBottomY;
  const tunicBottomY = Y(rng.range(0.82, 0.86));
  const bootsBottomY = Y(0.97);

  const capW = W(0.6);
  const brimW = W(rng.range(0.66, 0.72));
  const hairW = W(0.6);
  const faceW = W(0.44);
  const tunicTopW = W(0.5);
  const tunicBottomW = W(rng.range(0.6, 0.68));

  // ---- cap: triangle from a leaning tip down to the brim ----
  const lean = rng.chance(0.75) ? (rng.chance(0.5) ? 1 : -1) * rng.range(0.06, 0.14) : 0;
  const tipX = Math.round((width - 1) / 2 + lean * width);
  for (let y = capTipY; y < capBrimY; y++) {
    const t = (y - capTipY) / Math.max(1, capBrimY - capTipY);
    const wpx = Math.max(2, Math.round(2 + (capW - 2) * Math.pow(t, 0.85)));
    const cxAt = tipX + (Math.round((width - 1) / 2) - tipX) * t;
    const x0 = Math.round(cxAt - wpx / 2);
    for (let x = x0; x < x0 + wpx; x++) g.set(x, y, REGION.BODY);
  }
  // Brim: widest cap band, its bottom row darker for depth.
  fillCentered(capBrimY, brimBottomY, brimW, REGION.BODY);
  fillCentered(brimBottomY - 1, brimBottomY, brimW, REGION.BODY_SHADOW);

  // ---- hair fringe + side frames (drawn first; face carves into it) ----
  fillCentered(brimBottomY, hairBottomY, hairW, REGION.LEATHER);

  // ---- face ----
  fillCentered(faceTopY, faceBottomY, faceW, REGION.SKIN);

  // ---- ears: skin nubs sticking out past the hair frame ----
  if (width >= 20) {
    const earTop = faceTopY + Math.max(0, Math.round(innerH * 0.02));
    const earH = Math.max(2, Math.round(innerH * 0.12));
    const earW = Math.max(1, Math.round(width * 0.08));
    const hairX0 = Math.floor((width - hairW) / 2);
    for (let y = earTop; y < Math.min(earTop + earH, faceBottomY); y++) {
      for (let e = 0; e < earW; e++) {
        g.set(hairX0 - 1 - e, y, REGION.SKIN_BASE);
        g.set(hairX0 + hairW + e, y, REGION.SKIN_BASE);
      }
    }
  }

  // ---- eyes: big dark verticals, symmetric about the center ----
  const eyeW = width >= 28 ? 2 : 1;
  const eyeH = Math.max(2, Math.round(innerH * (width >= 28 ? 0.11 : 0.08)));
  const eyeTop = faceTopY + Math.max(1, Math.round((faceBottomY - faceTopY) * 0.3));
  const eyeOff = Math.max(1, Math.round(width * 0.1));
  const cL = Math.ceil(width / 2 - 1);
  const cR = Math.floor(width / 2);
  for (let y = eyeTop; y < Math.min(eyeTop + eyeH, faceBottomY); y++) {
    for (let e = 0; e < eyeW; e++) {
      g.set(cL - eyeOff - e, y, REGION.DARK);
      g.set(cR + eyeOff + e, y, REGION.DARK);
    }
  }

  // ---- tunic: trapezoid with a darker collar row ----
  for (let y = tunicTopY; y < tunicBottomY; y++) {
    const t = (y - tunicTopY) / Math.max(1, tunicBottomY - tunicTopY);
    const wpx = Math.round(tunicTopW + (tunicBottomW - tunicTopW) * t);
    fillCentered(y, y + 1, wpx, REGION.BODY);
  }
  fillCentered(tunicTopY, tunicTopY + 1, tunicTopW, REGION.BODY_SHADOW);
  fillCentered(tunicBottomY - 1, tunicBottomY, tunicBottomW, REGION.BODY_SHADOW);

  // ---- buckle ----
  if (rng.chance(0.8)) {
    const buckleSize = Math.max(1, Math.round(width * 0.08));
    const buckleY = tunicTopY + Math.round((tunicBottomY - tunicTopY) * 0.55);
    // Gold-ish buckle: the light end of the warm skin ramp reads as gold.
    fillCentered(buckleY, Math.min(buckleY + buckleSize, tunicBottomY), buckleSize + (width >= 24 ? 1 : 0), REGION.SKIN_LIGHT);
  }

  // ---- hands: skin nubs at the tunic sides ----
  const handH = Math.max(2, Math.round(innerH * 0.1));
  const handW = Math.max(1, Math.round(width * 0.08));
  const handTop = tunicTopY + Math.max(1, Math.round((tunicBottomY - tunicTopY) * 0.25));
  const shoulderW = Math.round(tunicTopW + (tunicBottomW - tunicTopW) * 0.3);
  const shoulderX0 = Math.floor((width - shoulderW) / 2);
  for (let y = handTop; y < Math.min(handTop + handH, tunicBottomY); y++) {
    for (let e = 0; e < handW; e++) {
      g.set(shoulderX0 - 1 - e, y, REGION.SKIN_BASE);
      g.set(shoulderX0 + shoulderW + e, y, REGION.SKIN_BASE);
    }
  }

  // ---- boots: two splayed feet with a gap ----
  const bootW = Math.max(2, Math.round(width * 0.17));
  const gap = Math.max(1, Math.round(width * 0.08));
  const splay = rng.chance(0.6) ? 1 : 0;
  const lX0 = Math.floor(width / 2) - gap / 2 - bootW - splay;
  const rX0 = Math.ceil(width / 2) + gap / 2 + splay;
  for (let y = tunicBottomY; y < bootsBottomY; y++) {
    for (let x = 0; x < bootW; x++) {
      g.set(Math.round(lX0) + x, y, REGION.LEATHER);
      g.set(Math.round(rX0) + x, y, REGION.LEATHER);
    }
  }

  return g;
}
