/**
 * "Knight" body plan: steel plate armor read as a stack of metal bands plus
 * held props — red plume, helmet dome with dark visor slit (no face),
 * pauldrons, cuirass with belt, armored skirt and sabatons, a gold-bordered
 * crested shield covering one arm and a down-pointing sword in the other.
 *
 * Ramp usage: metal = helmet/pauldrons/cuirass/blade, body (hue, red by
 * default) = plume + shield field, skin-light = gold trim/emblem,
 * leather = belt, dark = visor/grips.
 */

import { PixelGrid } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import type { Rng } from "../../core/rng";

export const KNIGHT_DEFAULT_HUE = 0; // heraldic red for plume + shield field

export function drawKnight(width: number, height: number, rng: Rng): PixelGrid {
  const g = new PixelGrid(width, height, REGION_PALETTE);
  const m = 1;
  const innerH = height - m * 2;
  const Y = (f: number) => m + Math.round(f * innerH);
  const W = (f: number) => Math.max(1, Math.round(f * width));

  const fillCentered = (y0: number, y1: number, wpx: number, region: number, cxOff = 0) => {
    const x0 = Math.floor((width - wpx) / 2) + cxOff;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x0 + wpx; x++) g.set(x, y, region);
    }
  };

  // ---- vertical layout ----
  const plumeTop = Y(0.02);
  const domeTop = Y(rng.range(0.09, 0.12));
  const domeBottom = Y(0.4);
  const shoulderTop = domeBottom;
  const shoulderBottom = Y(0.54);
  const torsoBottom = Y(0.66);
  const skirtBottom = Y(rng.range(0.76, 0.8));
  const bootsBottom = Y(0.95);

  const domeW = W(0.46);
  const torsoW = W(0.42);
  const skirtW = W(0.38);

  // ---- plume: small red tuft leaning off the helmet top ----
  // Flat red (BODY_BASE) — a tuft this small gets eaten by auto-shading.
  const plumeLean = (rng.chance(0.7) ? -1 : 1) * W(0.08);
  const plumeW = Math.max(2, W(0.16));
  fillCentered(plumeTop, domeTop + 1, plumeW, REGION.BODY_BASE, plumeLean);
  fillCentered(plumeTop, plumeTop + Math.max(1, Math.round(innerH * 0.04)), Math.max(1, plumeW - 2), REGION.BODY_BASE, plumeLean - 1);

  // ---- helmet dome: rounded steel, auto-shading gives the top-left shine ----
  for (let y = domeTop; y < domeBottom; y++) {
    const t = (y - domeTop) / Math.max(1, domeBottom - domeTop);
    const wpx = Math.max(2, Math.round(domeW * Math.min(1, Math.sqrt(t * 2.0))));
    fillCentered(y, y + 1, wpx, REGION.METAL);
  }

  // ---- visor slit: wide dark band, the knight's "face" ----
  const visorY = Y(0.27);
  const visorH = Math.max(1, Math.round(innerH * 0.07));
  fillCentered(visorY, visorY + visorH, W(0.34), REGION.DARK);

  // ---- chin plate ----
  fillCentered(domeBottom - Math.max(1, Math.round(innerH * 0.04)), domeBottom, W(0.26), REGION.METAL_SHADOW);

  // ---- pauldrons: rounded shoulder blocks past the torso edge ----
  const pauldronW = Math.max(2, W(0.16));
  const torsoX0 = Math.floor((width - torsoW) / 2);
  for (let y = shoulderTop; y < shoulderBottom; y++) {
    for (let e = 0; e < pauldronW; e++) {
      g.set(torsoX0 - 1 - e, y, REGION.METAL);
      g.set(torsoX0 + torsoW + e, y, REGION.METAL);
    }
  }

  // ---- cuirass + belt + skirt ----
  fillCentered(shoulderTop, torsoBottom, torsoW, REGION.METAL);
  fillCentered(torsoBottom - Math.max(1, Math.round(innerH * 0.05)), torsoBottom, torsoW, REGION.LEATHER);
  fillCentered(torsoBottom, skirtBottom, skirtW, REGION.METAL_SHADOW);

  // ---- sabatons: two dark steel feet ----
  const bootW = Math.max(2, W(0.16));
  const gap = Math.max(1, W(0.08));
  const lX0 = Math.floor(width / 2 - gap / 2) - bootW;
  const rX0 = Math.ceil(width / 2 + gap / 2);
  for (let y = skirtBottom; y < bootsBottom; y++) {
    for (let x = 0; x < bootW; x++) {
      g.set(lX0 + x, y, REGION.METAL_SHADOW);
      g.set(rX0 + x, y, REGION.METAL_SHADOW);
    }
  }
  // Light rim on the sabaton tops for readability against the skirt.
  for (let x = 0; x < bootW; x++) {
    g.set(lX0 + x, skirtBottom, REGION.METAL_BASE);
    g.set(rX0 + x, skirtBottom, REGION.METAL_BASE);
  }

  // ---- shield: gold-bordered kite with a crest, covering the right arm ----
  const shieldW = Math.max(4, W(rng.range(0.26, 0.32)));
  const shieldTop = Y(0.46);
  const shieldBottom = Y(0.8);
  const shieldCx = Math.floor((width - torsoW) / 2) + torsoW + Math.floor(pauldronW / 2) - Math.floor(shieldW / 2) + W(0.04);
  const drawKiteRow = (y: number, wpx: number, region: number) => {
    const x0 = shieldCx + Math.floor((shieldW - wpx) / 2);
    for (let x = x0; x < x0 + wpx; x++) g.set(x, y, region);
  };
  for (let y = shieldTop; y < shieldBottom; y++) {
    const t = (y - shieldTop) / Math.max(1, shieldBottom - shieldTop);
    const wpx = t < 0.55 ? shieldW : Math.max(1, Math.round(shieldW * (1 - (t - 0.55) / 0.45)));
    drawKiteRow(y, wpx, REGION.SKIN_LIGHT); // gold border pass
  }
  for (let y = shieldTop + 1; y < shieldBottom - 1; y++) {
    const t = (y - shieldTop) / Math.max(1, shieldBottom - shieldTop);
    const wpx = t < 0.55 ? shieldW : Math.max(1, Math.round(shieldW * (1 - (t - 0.55) / 0.45)));
    const inner = Math.max(0, wpx - 2);
    if (inner > 0) drawKiteRow(y, inner, REGION.BODY); // red field
  }
  if (width >= 24) {
    // Cross emblem.
    const crossX = shieldCx + Math.floor(shieldW / 2);
    const crossTop = shieldTop + Math.max(1, Math.round((shieldBottom - shieldTop) * 0.2));
    const crossBottom = shieldTop + Math.round((shieldBottom - shieldTop) * 0.6);
    for (let y = crossTop; y < crossBottom; y++) g.set(crossX, y, REGION.SKIN_LIGHT);
    const armY = crossTop + Math.max(1, Math.round((crossBottom - crossTop) * 0.3));
    for (let dx = -1; dx <= 1; dx++) g.set(crossX + dx, armY, REGION.SKIN_LIGHT);
  }

  // ---- sword: gauntlet grip high, blade pointing down, on the left ----
  const swordX = Math.max(m + 1, Math.floor((width - torsoW) / 2) - pauldronW - 1);
  const gripY = Y(0.5);
  const bladeBottom = Y(rng.range(0.86, 0.92));
  g.set(swordX, gripY, REGION.DARK);
  g.set(swordX + 1, gripY, REGION.DARK); // gauntlet fist
  const guardY = gripY + 1;
  for (let dx = -1; dx <= 1; dx++) g.set(swordX + dx, guardY, REGION.LEATHER);
  const bladeW = width >= 28 ? 2 : 1;
  for (let y = guardY + 1; y < bladeBottom; y++) {
    for (let dx = 0; dx < bladeW; dx++) g.set(swordX + dx, y, REGION.METAL_BASE);
  }
  g.set(swordX, bladeBottom - 1, REGION.METAL_LIGHT); // tip glint

  return g;
}
