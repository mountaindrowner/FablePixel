/**
 * "Barbarian" — skeleton-built action figure (the round-3 anatomy lessons):
 * heroic proportions (head ≈ 1/6 height), one action line from the raised
 * fist through the leaning torso to the planted far foot, articulated limbs
 * (shoulder→elbow→fist, hip→knee→foot) in a lunge, hair drawn as a backdrop
 * mass BEHIND the head, and interior outlines only where a limb crosses
 * open space or other parts (a 1px rim everywhere just reads as noise).
 */

import type { PixelGrid } from "../../core/pixelGrid";
import { PixelGrid as Grid } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import type { Rng } from "../../core/rng";
import { drawBone, undercoatBone, type Bone } from "./figure";

export function drawBarbarian(width: number, height: number, rng: Rng): PixelGrid {
  const g = new Grid(width, height, REGION_PALETTE);
  const s = rng.chance(0.5) ? 1 : -1; // raised-arm side
  const X = (f: number) => Math.round(f * (width - 2)) + 1;
  const Y = (f: number) => Math.round(f * (height - 2)) + 1;
  const W = (f: number) => Math.max(1, f * width);
  const H = (f: number) => Math.max(1, f * height);
  const j = (a: number) => rng.range(-a, a);

  // ---- skeleton (action line: raised fist → torso lean → far foot) ----
  const headR = Math.max(2, H(0.08));
  const headC = { x: X(0.5 + 0.02 * s + j(0.01)), y: Y(0.22) };
  const chest = { x: X(0.5 + 0.025 * s), y: Y(0.37) };
  const pelvis = { x: X(0.5 - 0.015 * s), y: Y(0.56) };
  const shoulderUp = { x: chest.x + Math.round(W(0.11)) * s, y: chest.y - Math.round(H(0.025)) };
  const shoulderDn = { x: chest.x - Math.round(W(0.115)) * s, y: chest.y - Math.round(H(0.01)) };
  const elbowUp = { x: shoulderUp.x + Math.round(W(0.09 + j(0.015))) * s, y: shoulderUp.y - Math.round(H(0.08)) };
  const fistUp = { x: elbowUp.x, y: elbowUp.y - Math.round(H(0.11 + j(0.015))) };
  const elbowDn = { x: shoulderDn.x - Math.round(W(0.04)) * s, y: shoulderDn.y + Math.round(H(0.1)) };
  const fistDn = { x: elbowDn.x - Math.round(W(0.015)) * s, y: elbowDn.y + Math.round(H(0.08)) };
  const hipBent = { x: pelvis.x + Math.round(W(0.05)) * s, y: pelvis.y };
  const hipExt = { x: pelvis.x - Math.round(W(0.05)) * s, y: pelvis.y };
  const kneeBent = { x: X(0.5 + (0.15 + j(0.015)) * s), y: Y(0.73) };
  const footBent = { x: X(0.5 + (0.19 + j(0.02)) * s), y: Y(0.9) };
  const kneeExt = { x: X(0.5 - (0.16 + j(0.015)) * s), y: Y(0.71) };
  const footExt = { x: X(0.5 - (0.25 + j(0.02)) * s), y: Y(0.88) };

  const SKIN: number = REGION.SKIN;
  const bone = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    w0: number,
    w1: number,
    region: number = SKIN,
  ): Bone => ({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, w0, w1, region });

  // ---- legs (far first), torso, loincloth, boots ----
  drawBone(g, bone(hipExt, kneeExt, W(0.1), W(0.085)));
  drawBone(g, bone(kneeExt, footExt, W(0.085), W(0.075)));
  drawBone(g, bone(hipBent, kneeBent, W(0.1), W(0.085)));
  drawBone(g, bone(kneeBent, footBent, W(0.085), W(0.075)));

  drawBone(g, bone(shoulderDn, shoulderUp, H(0.07), H(0.07)));
  drawBone(g, bone(chest, pelvis, W(0.24), W(0.15)));

  const clothTop = pelvis.y - Math.round(H(0.035));
  const clothBottom = pelvis.y + Math.round(H(0.06));
  for (let y = clothTop; y <= clothBottom; y++) {
    for (let x = 0; x < width; x++) {
      if (g.get(x, y) === SKIN && Math.abs(x - pelvis.x) <= W(0.13)) g.set(x, y, REGION.LEATHER_BASE);
    }
  }
  for (let x = pelvis.x - Math.round(W(0.11)); x <= pelvis.x + Math.round(W(0.11)); x++) {
    if (g.get(x, clothBottom) === REGION.LEATHER_BASE && rng.chance(0.5)) {
      const below = g.get(x, clothBottom + 1);
      if (below === SKIN || below === REGION.EMPTY) g.set(x, clothBottom + 1, REGION.LEATHER_BASE);
    }
  }

  for (const [knee, foot] of [
    [kneeBent, footBent],
    [kneeExt, footExt],
  ] as const) {
    const mid = { x: Math.round((knee.x + foot.x) / 2), y: Math.round((knee.y + foot.y) / 2) };
    drawBone(g, bone(mid, foot, W(0.095), W(0.085), REGION.LEATHER_BASE));
    // Fur cuff.
    for (let dx = -Math.ceil(W(0.05)); dx <= Math.ceil(W(0.05)); dx++) {
      if (g.get(mid.x + dx, mid.y - 1) !== REGION.EMPTY) g.set(mid.x + dx, mid.y - 1, REGION.SKIN_SHADOW);
    }
  }

  // ---- down arm (hugs the torso — no rim) + bracer ----
  drawBone(g, bone(shoulderDn, elbowDn, W(0.075), W(0.065)));
  drawBone(g, bone(elbowDn, fistDn, W(0.065), W(0.055)));
  const braceMid = { x: Math.round((elbowDn.x + fistDn.x) / 2), y: Math.round((elbowDn.y + fistDn.y) / 2) };
  drawBone(g, bone(braceMid, { x: fistDn.x, y: fistDn.y - 1 }, W(0.065), W(0.06), REGION.LEATHER_BASE));

  // ---- head: hair backdrop disc BEHIND, then the face on top ----
  const hairC = { x: headC.x - Math.round(headR * 0.25) * s, y: headC.y - Math.round(headR * 0.3) };
  drawBone(g, bone(hairC, { x: hairC.x, y: hairC.y + 1 }, headR * 2 + 2, headR * 2 + 2, REGION.DARK));
  // Side fall on the non-raised side, down toward the shoulder.
  const fallX = headC.x - Math.round(headR + 1) * s;
  drawBone(g, bone({ x: fallX, y: headC.y }, { x: fallX - s, y: chest.y - 1 }, W(0.07), W(0.05), REGION.DARK));
  // Face disc (slightly smaller, shifted down-forward so the fringe shows).
  const faceC = { x: headC.x + Math.round(headR * 0.2) * s, y: headC.y + Math.round(headR * 0.35) };
  drawBone(g, bone(faceC, { x: faceC.x, y: faceC.y + 1 }, headR * 2 - 1, headR * 2 - 1));
  // Hair glint.
  g.set(hairC.x + Math.round(headR * 0.5), hairC.y - Math.round(headR * 0.7), REGION.METAL_SHADOW);

  // ---- eyes ----
  const eyeY = faceC.y;
  const eyeOff = Math.max(1, Math.round(headR * 0.5));
  g.set(faceC.x - eyeOff, eyeY, REGION.DARK);
  g.set(faceC.x + eyeOff, eyeY, REGION.DARK);

  // ---- musculature ----
  if (width >= 28) {
    const pecY = chest.y + Math.round(H(0.03));
    for (let dx = 1; dx <= Math.round(W(0.055)); dx++) {
      if (g.get(chest.x - dx, pecY) === SKIN) g.set(chest.x - dx, pecY, REGION.SKIN_SHADOW);
      if (g.get(chest.x + dx, pecY) === SKIN) g.set(chest.x + dx, pecY, REGION.SKIN_SHADOW);
    }
    for (let y = pecY + 2; y < clothTop - 1; y += 2) {
      const t = (y - chest.y) / Math.max(1, pelvis.y - chest.y);
      const mx = Math.round(chest.x + (pelvis.x - chest.x) * t);
      if (g.get(mx, y) === SKIN) g.set(mx, y, REGION.SKIN_SHADOW);
    }
  }

  // ---- raised arm over everything, with separation where it crosses ----
  const armUp1 = bone(shoulderUp, elbowUp, W(0.075), W(0.065));
  const armUp2 = bone(elbowUp, fistUp, W(0.065), W(0.055));
  undercoatBone(g, armUp1);
  undercoatBone(g, armUp2);
  drawBone(g, armUp1);
  drawBone(g, armUp2);

  // ---- axe: handle angled outward-up from the fist, blade in open space ----
  const gripA = { x: fistUp.x - Math.round(W(0.05)) * s, y: fistUp.y + Math.round(H(0.08)) };
  const gripB = { x: fistUp.x + Math.round(W(0.06)) * s, y: fistUp.y - Math.round(H(0.1)) };
  const handle = bone(gripA, gripB, Math.max(1.5, W(0.04)), Math.max(1.5, W(0.04)), REGION.LEATHER_BASE);
  undercoatBone(g, handle);
  drawBone(g, handle);
  const bladeC = { x: gripB.x + Math.round(W(0.04)) * s, y: gripB.y + Math.round(H(0.01)) };
  const bladeH = Math.max(5, Math.round(H(0.18)));
  const bladeW = Math.max(4, Math.round(W(0.14)));
  for (let dy = 0; dy < bladeH; dy++) {
    const t = dy / Math.max(1, bladeH - 1);
    const wpx = Math.max(1, Math.round(bladeW * (1 - Math.abs(t - 0.5) * 1.1)));
    for (let dx = 0; dx < wpx; dx++) {
      const x = bladeC.x + dx * s;
      const y = bladeC.y - Math.floor(bladeH / 2) + dy;
      const v = g.get(x, y);
      // The blade may claim the handle tip and its dark rim, never the body.
      if (v === REGION.EMPTY || v === REGION.LEATHER_BASE || v === REGION.DARK) g.set(x, y, REGION.METAL_BASE);
    }
  }
  // Back spike toward the head, edge glint on the outer rim.
  for (let dx = 1; dx <= 2; dx++) {
    if (g.get(gripB.x - dx * s, bladeC.y) === REGION.EMPTY) g.set(gripB.x - dx * s, bladeC.y, REGION.METAL_SHADOW);
  }
  g.set(bladeC.x + (bladeW - 1) * s, bladeC.y, REGION.METAL_LIGHT);

  // ---- fists last ----
  drawBone(g, bone(fistUp, fistUp, W(0.08), W(0.08)));
  drawBone(g, bone(fistDn, fistDn, W(0.08), W(0.08)));

  return g;
}
