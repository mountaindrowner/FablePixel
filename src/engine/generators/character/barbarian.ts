/**
 * "Barbarian" template — the first character built on the parametric figure
 * layer: bare V-tapered torso with pec/ab hints, long dark hair mass, one
 * arm raised gripping an axe (placed at the figure's hand attach point),
 * fur loincloth with a ragged hem, and boots over a wide stance.
 */

import type { PixelGrid } from "../../core/pixelGrid";
import { REGION } from "../../core/regions";
import type { Rng } from "../../core/rng";
import { drawFigure } from "./figure";

export function drawBarbarian(width: number, height: number, rng: Rng): PixelGrid {
  const raisedSide = rng.chance(0.5) ? "right" : "left";
  const figure = drawFigure({
    width,
    height,
    headF: rng.range(0.32, 0.36),
    shoulderF: rng.range(0.56, 0.62),
    waistF: 0.36,
    hipF: 0.42,
    stanceF: rng.range(0.16, 0.2),
    leftArm: raisedSide === "left" ? "raised" : "down",
    rightArm: raisedSide === "right" ? "raised" : "down",
    bodyRegion: REGION.SKIN,
  });
  const g = figure.grid;
  const { head, hands } = figure;

  // ---- hair: crown over the head plus falls down the head sides ----
  const hairTop = Math.max(1, head.y0 - Math.round(height * 0.14));
  const headW = head.x1 - head.x0;
  const hairX0 = head.x0 - Math.max(1, Math.round(width * 0.06));
  const hairX1 = head.x1 + Math.max(1, Math.round(width * 0.06));
  for (let y = hairTop; y < head.y0; y++) {
    // Rounded crown: inset the top two rows.
    const inset = Math.max(0, 2 - (y - hairTop));
    for (let x = hairX0 + inset; x <= hairX1 - inset; x++) {
      if (g.get(x, y) === REGION.EMPTY || g.get(x, y) === REGION.SKIN) g.set(x, y, REGION.LEATHER_BASE);
    }
  }
  // Side falls down to the shoulder line.
  for (let y = head.y0; y < figure.shoulderY + 1; y++) {
    for (let e = 0; e < Math.max(1, Math.round(width * 0.05)); e++) {
      g.set(hairX0 + e, y, REGION.LEATHER_BASE);
      g.set(hairX1 - e, y, REGION.LEATHER_BASE);
    }
  }

  // ---- face: eyes, optional beard ----
  const eyeY = head.y0 + Math.max(1, Math.round((head.y1 - head.y0) * 0.25));
  const eyeOff = Math.max(1, Math.round(headW * 0.22));
  const cx = Math.floor((head.x0 + head.x1) / 2);
  g.set(cx - eyeOff, eyeY, REGION.DARK);
  g.set(cx + eyeOff, eyeY, REGION.DARK);
  if (width >= 28) {
    g.set(cx - eyeOff, eyeY + 1, REGION.DARK);
    g.set(cx + eyeOff, eyeY + 1, REGION.DARK);
  }
  if (rng.chance(0.5) && width >= 24) {
    for (let x = cx - eyeOff; x <= cx + eyeOff; x++) {
      if (g.get(x, head.y1 - 1) === REGION.SKIN) g.set(x, head.y1 - 1, REGION.LEATHER_BASE);
    }
  }

  // ---- muscle hints: pec shadow line + ab line (readable at 28px+) ----
  if (width >= 28) {
    const pecY = figure.shoulderY + Math.max(2, Math.round((figure.waistY - figure.shoulderY) * 0.35));
    const pecHalf = Math.max(1, Math.round(width * 0.08));
    for (let dx = 1; dx <= pecHalf; dx++) {
      if (g.get(Math.floor(width / 2) - dx, pecY) === REGION.SKIN) g.set(Math.floor(width / 2) - dx, pecY, REGION.SKIN_SHADOW);
      if (g.get(Math.ceil(width / 2) + dx - 1, pecY) === REGION.SKIN) g.set(Math.ceil(width / 2) + dx - 1, pecY, REGION.SKIN_SHADOW);
    }
    for (let y = pecY + 1; y < figure.waistY; y += 2) {
      if (g.get(Math.floor(width / 2), y) === REGION.SKIN) g.set(Math.floor(width / 2), y, REGION.SKIN_SHADOW);
    }
  }

  // ---- fur loincloth: waist-to-hips band with a ragged hem ----
  const clothTop = figure.waistY - 1;
  const clothBottom = figure.hipsY + Math.max(1, Math.round(height * 0.04));
  for (let y = clothTop; y < clothBottom; y++) {
    for (let x = 0; x < width; x++) {
      const v = g.get(x, y);
      if (v === REGION.SKIN || v === REGION.SKIN_SHADOW) g.set(x, y, REGION.LEATHER_BASE);
    }
  }
  for (let x = 0; x < width; x++) {
    if (g.get(x, clothBottom - 1) === REGION.LEATHER_BASE && x % 2 === 0) {
      g.set(x, clothBottom, g.get(x, clothBottom) === REGION.SKIN ? REGION.LEATHER_BASE : g.get(x, clothBottom));
    }
  }

  // ---- boots over the lower legs ----
  const bootTop = figure.feetY - Math.max(2, Math.round(height * 0.1));
  for (let y = bootTop; y < figure.feetY; y++) {
    for (let x = 0; x < width; x++) {
      if (g.get(x, y) === REGION.SKIN) g.set(x, y, REGION.LEATHER_BASE);
    }
  }

  // ---- axe in the raised fist: dark handle, steel half-moon blade ----
  const fist = raisedSide === "right" ? hands.right : hands.left;
  const side = raisedSide === "right" ? 1 : -1;
  const handleBottom = fist.y + Math.max(2, Math.round(height * 0.06));
  const handleTop = Math.max(1, fist.y - Math.max(3, Math.round(height * 0.12)));
  const handleW = width >= 28 ? 2 : 1;
  for (let y = handleTop; y <= handleBottom; y++) {
    for (let dx = 0; dx < handleW; dx++) {
      if (g.get(fist.x + dx, y) === REGION.EMPTY) g.set(fist.x + dx, y, REGION.LEATHER_BASE);
    }
  }
  const bladeH = Math.max(4, Math.round(height * 0.2));
  const bladeW = Math.max(3, Math.round(width * 0.14));
  const bladeY0 = handleTop;
  for (let dy = 0; dy < bladeH; dy++) {
    // Half-moon: widest in the middle rows.
    const t = dy / Math.max(1, bladeH - 1);
    const wpx = Math.max(1, Math.round(bladeW * (1 - Math.abs(t - 0.5) * 1.2)));
    for (let dx = 1; dx <= wpx; dx++) {
      const x = fist.x + side * dx;
      if (g.get(x, bladeY0 + dy) === REGION.EMPTY) g.set(x, bladeY0 + dy, REGION.METAL_BASE);
    }
  }
  // Blade edge glint.
  g.set(fist.x + side * bladeW, bladeY0 + Math.floor(bladeH / 2), REGION.METAL_LIGHT);

  return g;
}
