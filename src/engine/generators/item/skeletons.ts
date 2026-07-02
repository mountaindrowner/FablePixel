/**
 * Item archetype skeletons: each is a tiny procedural drawing program with
 * seeded jitter. Templates own the topology (a sword IS a blade + guard +
 * hilt), jitter owns the variety.
 *
 * Region conventions: BODY = main material, SECONDARY = second material
 * (wood, liquid, leather), ACCENT = metal fittings / trim, LIGHT = glints.
 */

import { PixelGrid } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import { drawLine, fillEllipse } from "../../core/draw";
import type { Rng } from "../../core/rng";

export type ItemArchetype =
  | "sword"
  | "potion"
  | "shield"
  | "gem"
  | "coin"
  | "ring"
  | "key"
  | "chest"
  | "staff"
  | "axe"
  | "bow";

export const ITEM_ARCHETYPES: ItemArchetype[] = [
  "sword", "potion", "shield", "gem", "coin", "ring", "key", "chest", "staff", "axe", "bow",
];

type DrawFn = (g: PixelGrid, rng: Rng) => void;

const B = REGION.BODY;
const S = REGION.SECONDARY;
const A = REGION.ACCENT;

function sword(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = Math.floor(w / 2);
  const bladeTop = 1 + Math.round(rng.range(0, 0.06) * h);
  const bladeLen = Math.round(h * rng.range(0.55, 0.72));
  const bladeW = w >= 24 ? 2 : 1;
  for (let y = bladeTop; y < bladeTop + bladeLen; y++) {
    for (let dx = 0; dx < bladeW; dx++) g.set(cx - Math.floor(bladeW / 2) + dx, y, B);
  }
  g.set(cx, bladeTop, REGION.BODY_LIGHT); // tip catch-light
  const guardY = bladeTop + bladeLen;
  const guardHalf = Math.max(1, Math.round(w * rng.range(0.12, 0.2)));
  g.fillRect(cx - guardHalf, guardY, guardHalf * 2 + 1, Math.max(1, Math.floor(h / 24)) , A);
  const hiltLen = Math.max(2, Math.round(h * rng.range(0.12, 0.18)));
  g.fillRect(cx, guardY + 1, 1, hiltLen, S);
  if (w >= 24) g.fillRect(cx - Math.floor(bladeW / 2), guardY + 1, bladeW, hiltLen, S);
  g.set(cx, guardY + hiltLen + 1, REGION.ACCENT_LIGHT); // pommel
}

function potion(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = (w - 1) / 2;
  const bulbRx = w * rng.range(0.24, 0.34);
  const bulbRy = h * rng.range(0.22, 0.3);
  const bulbCy = h * 0.62;
  fillEllipse(g, cx, bulbCy, bulbRx, bulbRy, B);
  // Liquid fills the lower part of the bulb.
  const fillLine = bulbCy - bulbRy * rng.range(0.1, 0.5);
  for (let y = Math.ceil(fillLine); y <= Math.floor(bulbCy + bulbRy); y++) {
    for (let x = 0; x < w; x++) {
      if (g.get(x, y) === B) g.set(x, y, S);
    }
  }
  const neckW = Math.max(1, Math.round(w * 0.14));
  const neckTop = Math.round(h * 0.22);
  g.fillRect(Math.round(cx - neckW / 2), neckTop, neckW, Math.ceil(bulbCy - bulbRy) - neckTop + 1, B);
  g.fillRect(Math.round(cx - neckW / 2), neckTop - Math.max(1, Math.floor(h / 20)), neckW, Math.max(1, Math.floor(h / 20)), A);
  g.set(Math.round(cx - bulbRx * 0.5), Math.round(bulbCy - bulbRy * 0.4), REGION.LIGHT); // glass glint
}

function shield(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = (w - 1) / 2;
  const topY = Math.round(h * 0.12);
  const bottomY = Math.round(h * 0.9);
  const halfW = w * rng.range(0.3, 0.38);
  for (let y = topY; y <= bottomY; y++) {
    const t = (y - topY) / (bottomY - topY);
    // Straight sides tapering to a point in the lower third.
    const run = t < 0.55 ? halfW : halfW * (1 - (t - 0.55) / 0.45);
    for (let x = Math.round(cx - run); x <= Math.round(cx + run); x++) g.set(x, y, B);
  }
  // Rim.
  const src = g.clone();
  src.forEachEdgePixel((x, y) => g.set(x, y, A));
  // Emblem: boss dot or vertical stripe.
  if (rng.chance(0.5)) {
    fillEllipse(g, cx, h * 0.42, Math.max(1, w * 0.08), Math.max(1, h * 0.08), S);
  } else {
    g.fillRect(Math.round(cx), topY + 1, 1, bottomY - topY - 2, S);
  }
}

function gem(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const rx = w * rng.range(0.28, 0.36);
  const ry = h * rng.range(0.3, 0.38);
  // Diamond mask.
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (Math.abs(x - cx) / rx + Math.abs(y - cy) / ry <= 1) g.set(x, y, B);
    }
  }
  // Lower facets darker, girdle line, glint.
  for (let y = Math.round(cy); y <= Math.ceil(cy + ry); y++) {
    for (let x = 0; x < w; x++) {
      if (g.get(x, y) === B) g.set(x, y, REGION.BODY_SHADOW);
    }
  }
  drawLine(g, cx - rx + 1, cy, cx + rx - 1, cy, REGION.BODY_LIGHT);
  g.set(Math.round(cx - rx * 0.35), Math.round(cy - ry * 0.4), REGION.LIGHT);
}

function coin(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const r = Math.min(w, h) * rng.range(0.3, 0.38);
  fillEllipse(g, cx, cy, r, r, B);
  const src = g.clone();
  src.forEachEdgePixel((x, y) => g.set(x, y, REGION.BODY_SHADOW));
  if (Math.min(w, h) >= 16) {
    fillEllipse(g, cx, cy, r * 0.45, r * 0.45, REGION.BODY_SHADOW);
    fillEllipse(g, cx, cy, r * 0.3, r * 0.3, B);
  }
  g.set(Math.round(cx - r * 0.4), Math.round(cy - r * 0.4), REGION.LIGHT);
}

function ring(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = (w - 1) / 2;
  const cy = h * 0.58;
  const outer = Math.min(w, h) * rng.range(0.26, 0.32);
  const inner = outer * 0.55;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / outer;
      const dy = (y - cy) / outer;
      const d = dx * dx + dy * dy;
      if (d <= 1 && d >= (inner / outer) * (inner / outer)) g.set(x, y, B);
    }
  }
  // Gem on top.
  const gemR = Math.max(1, outer * 0.35);
  fillEllipse(g, cx, cy - outer, gemR, gemR, A);
  g.set(Math.round(cx), Math.round(cy - outer - gemR * 0.4), REGION.ACCENT_LIGHT);
}

function key(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = Math.floor(w / 2);
  const bowR = Math.min(w, h) * rng.range(0.14, 0.2);
  const bowCy = h * 0.24;
  // Bow (the ring you hold).
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / bowR;
      const dy = (y - bowCy) / bowR;
      const d = dx * dx + dy * dy;
      if (d <= 1 && d >= 0.25) g.set(x, y, B);
    }
  }
  const shaftTop = Math.round(bowCy + bowR);
  const shaftBottom = Math.round(h * rng.range(0.78, 0.88));
  g.fillRect(cx, shaftTop, 1, shaftBottom - shaftTop, B);
  if (w >= 24) g.fillRect(cx - 1, shaftTop, 2, shaftBottom - shaftTop, B);
  // Teeth.
  const teeth = rng.int(1, 3);
  for (let t = 0; t < teeth; t++) {
    const ty = shaftBottom - 1 - t * 2;
    g.fillRect(cx + 1, ty, Math.max(1, Math.round(w * 0.12)), 1, B);
  }
}

function chest(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const boxX = Math.round(w * 0.14);
  const boxW = w - boxX * 2;
  const lidY = Math.round(h * rng.range(0.28, 0.36));
  const boxY = Math.round(h * 0.2);
  const boxBottom = Math.round(h * 0.85);
  // Wood body with rounded lid top.
  g.fillRect(boxX, boxY, boxW, boxBottom - boxY, S);
  g.set(boxX, boxY, REGION.EMPTY);
  g.set(boxX + boxW - 1, boxY, REGION.EMPTY);
  // Lid seam.
  for (let x = boxX; x < boxX + boxW; x++) g.set(x, lidY, REGION.DARK);
  // Metal bands + lock.
  g.fillRect(boxX, boxY, 1, boxBottom - boxY, A);
  g.fillRect(boxX + boxW - 1, boxY, 1, boxBottom - boxY, A);
  const lockW = Math.max(1, Math.round(w * 0.1));
  g.fillRect(Math.round(w / 2 - lockW / 2), lidY, lockW, Math.max(2, Math.round(h * 0.1)), REGION.ACCENT_LIGHT);
  // Wood grain.
  if (h >= 24) {
    for (const t of [0.55, 0.72]) {
      const y = Math.round(h * t);
      for (let x = boxX + 1; x < boxX + boxW - 1; x += 2) g.set(x, y, REGION.SECONDARY_SHADOW);
    }
  }
}

function staff(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  // Diagonal shaft bottom-left → top-right.
  const x0 = Math.round(w * 0.2);
  const y0 = Math.round(h * 0.9);
  const x1 = Math.round(w * rng.range(0.62, 0.74));
  const y1 = Math.round(h * 0.18);
  drawLine(g, x0, y0, x1, y1, S);
  if (w >= 24) drawLine(g, x0 + 1, y0, x1 + 1, y1, S);
  // Orb.
  const orbR = Math.max(1, Math.min(w, h) * rng.range(0.09, 0.14));
  fillEllipse(g, x1, y1 - orbR, orbR, orbR, A);
  g.set(Math.round(x1 - orbR * 0.4), Math.round(y1 - orbR * 1.3), REGION.ACCENT_LIGHT);
}

function axe(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const x0 = Math.round(w * 0.26);
  const y0 = Math.round(h * 0.9);
  const x1 = Math.round(w * 0.66);
  const y1 = Math.round(h * 0.16);
  drawLine(g, x0, y0, x1, y1, S);
  if (w >= 24) drawLine(g, x0 + 1, y0, x1 + 1, y1, S);
  // Blade: half-moon on the left of the shaft head.
  const bladeR = Math.min(w, h) * rng.range(0.18, 0.26);
  const bcx = x1 - bladeR * 0.6;
  const bcy = y1 + bladeR * 0.4;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - bcx) / bladeR;
      const dy = (y - bcy) / bladeR;
      const d = dx * dx + dy * dy;
      if (d <= 1 && x <= bcx + bladeR * 0.2) g.set(x, y, B);
    }
  }
  g.set(Math.round(bcx - bladeR * 0.5), Math.round(bcy - bladeR * 0.3), REGION.BODY_LIGHT);
}

function bow(g: PixelGrid, rng: Rng): void {
  const w = g.width;
  const h = g.height;
  const cx = w * rng.range(0.38, 0.46);
  const cy = (h - 1) / 2;
  const r = Math.min(w, h) * 0.38;
  // Right-facing arc.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / r;
      const dy = (y - cy) / r;
      const d = dx * dx + dy * dy;
      if (d <= 1 && d >= 0.62 && x >= cx) g.set(x, y, S);
    }
  }
  // String connecting the arc tips.
  drawLine(g, cx, cy - r, cx, cy + r, REGION.DARK);
  // Grip.
  g.fillRect(Math.round(cx + r) - 1, Math.round(cy) - 1, 1, 3, A);
}

export const ITEM_DRAWERS: Record<ItemArchetype, DrawFn> = {
  sword, potion, shield, gem, coin, ring, key, chest, staff, axe, bow,
};

export function drawItem(archetype: ItemArchetype, width: number, height: number, rng: Rng): PixelGrid {
  const grid = new PixelGrid(width, height, REGION_PALETTE);
  ITEM_DRAWERS[archetype](grid, rng);
  return grid;
}
