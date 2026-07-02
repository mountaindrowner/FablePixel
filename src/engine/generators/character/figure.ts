/**
 * Parametric chibi figure — the anatomy layer under character templates.
 *
 * How pixel artists translate the body, encoded: the head dominates but sits
 * on a SHOULDER LINE wider than the waist (V-taper); arms are LIMBS attached
 * at the shoulder corners with a pose (down at the side with a slight elbow
 * bend, raised overhead, held out), ending in fists that props attach to;
 * hips carry two SEPARATE legs whose stance width and splay set the
 * character's weight. Templates draw costume/hair/props over this body and
 * place weapons at the returned hand positions.
 */

import { PixelGrid } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import { fillRoundedRect } from "../../core/draw";

/**
 * Bone: a tapered limb segment between two joints — the skeleton-first way
 * artists build figures. Drawn as discs swept along the segment.
 */
export interface Bone {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Stroke widths (px) at each end — limbs taper toward the extremity. */
  w0: number;
  w1: number;
  region: number;
}

function sweep(b: Bone, cb: (x: number, y: number, radius: number) => void): void {
  const steps = Math.max(1, Math.round(Math.hypot(b.x1 - b.x0, b.y1 - b.y0) * 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    cb(b.x0 + (b.x1 - b.x0) * t, b.y0 + (b.y1 - b.y0) * t, (b.w0 + (b.w1 - b.w0) * t) / 2);
  }
}

export function drawBone(g: PixelGrid, b: Bone): void {
  sweep(b, (cx, cy, r) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= (r + 0.4) * (r + 0.4)) g.set(x, y, b.region);
      }
    }
  });
}

/**
 * Interior outline: before drawing a bone over already-drawn body mass, rim
 * its footprint with DARK — but only where pixels exist. This is the artist's
 * separation line that keeps an overlapping limb from merging into the torso.
 */
export function undercoatBone(g: PixelGrid, b: Bone): void {
  sweep(b, (cx, cy, r) => {
    const rr = r + 1;
    for (let y = Math.floor(cy - rr); y <= Math.ceil(cy + rr); y++) {
      for (let x = Math.floor(cx - rr); x <= Math.ceil(cx + rr); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= (rr + 0.4) * (rr + 0.4) && g.get(x, y) !== REGION.EMPTY) {
          g.set(x, y, REGION.DARK);
        }
      }
    }
  });
}

export type ArmPose = "down" | "raised" | "out";

export interface FigureSpec {
  width: number;
  height: number;
  /** Fraction of height taken by the head (chibi ≈ 0.34–0.42). */
  headF: number;
  /** Shoulder span as a fraction of width — wider than waist for a V-taper. */
  shoulderF: number;
  waistF: number;
  hipF: number;
  /** Horizontal gap between the legs, as a fraction of width. */
  stanceF: number;
  /** Poses for the viewer-left and viewer-right arms. */
  leftArm: ArmPose;
  rightArm: ArmPose;
  /** Region for bare body pixels (usually REGION.SKIN). */
  bodyRegion: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Figure {
  grid: PixelGrid;
  /** Face box (inside the head) for eyes/beard/hair framing. */
  head: { x0: number; y0: number; x1: number; y1: number };
  /** Fist centers — put held props here. */
  hands: { left: Point; right: Point };
  shoulderY: number;
  waistY: number;
  hipsY: number;
  legsTopY: number;
  feetY: number;
}

export function drawFigure(spec: FigureSpec): Figure {
  const { width, height, bodyRegion } = spec;
  const g = new PixelGrid(width, height, REGION_PALETTE);
  const m = 1;
  const innerH = height - m * 2;
  const Y = (f: number) => m + Math.round(f * innerH);
  const W = (f: number) => Math.max(1, Math.round(f * width));

  const headTop = Y(0.05);
  const headBottom = Y(0.05 + spec.headF);
  const shoulderY = headBottom + 1;
  const waistY = Y(0.66);
  const hipsY = Y(0.72);
  const feetY = Y(0.97);

  const headW = W(0.42);
  const shoulderW = W(spec.shoulderF);
  const waistW = W(spec.waistF);
  const hipW = W(spec.hipF);

  const centered = (wpx: number) => Math.floor((width - wpx) / 2);

  // ---- head + 1px neck ----
  fillRoundedRect(g, centered(headW), headTop, headW, headBottom - headTop, bodyRegion);
  g.fillRect(centered(W(0.14)), headBottom, W(0.14), Math.max(1, shoulderY - headBottom), bodyRegion);

  // ---- torso: V-taper from shoulder line to waist, then hips ----
  for (let y = shoulderY; y < waistY; y++) {
    const t = (y - shoulderY) / Math.max(1, waistY - shoulderY);
    const wpx = Math.round(shoulderW + (waistW - shoulderW) * t);
    g.fillRect(centered(wpx), y, wpx, 1, bodyRegion);
  }
  for (let y = waistY; y < hipsY; y++) {
    g.fillRect(centered(hipW), y, hipW, 1, bodyRegion);
  }

  // ---- legs: two separate columns with stance gap and splay ----
  const legW = Math.max(1, W(0.14));
  const gap = Math.max(1, W(spec.stanceF));
  const legsTopY = hipsY;
  const splay = spec.stanceF > 0.14 ? 1 : 0;
  for (let y = legsTopY; y < feetY; y++) {
    const t = (y - legsTopY) / Math.max(1, feetY - legsTopY);
    const shift = Math.round(splay * t);
    g.fillRect(Math.floor(width / 2) - Math.ceil(gap / 2) - legW - shift, y, legW, 1, bodyRegion);
    g.fillRect(Math.ceil(width / 2) + Math.ceil(gap / 2) + shift, y, legW, 1, bodyRegion);
  }

  // ---- arms: posed limbs from the shoulder corners ----
  const armW = width >= 24 ? 2 : 1;
  const drawArm = (side: -1 | 1, pose: ArmPose): Point => {
    const attachX = side === -1 ? centered(shoulderW) : centered(shoulderW) + shoulderW - 1;
    const attachY = shoulderY + 1;
    if (pose === "raised") {
      // Up and outward past the head; fist above shoulder height.
      const fistY = Math.max(m, headTop + Math.round((headBottom - headTop) * 0.15));
      const outX = attachX + side * Math.max(2, W(0.08));
      for (let y = fistY; y <= attachY; y++) {
        const t = (y - fistY) / Math.max(1, attachY - fistY);
        const x = Math.round(outX + (attachX - outX) * t);
        for (let dx = 0; dx < armW; dx++) g.set(x + side * dx, y, bodyRegion);
      }
      const fist: Point = { x: outX, y: fistY };
      g.fillRect(fist.x - (side === -1 ? 1 : 0), fist.y - 1, 2, 2, bodyRegion);
      return fist;
    }
    if (pose === "out") {
      const y = attachY + 1;
      const len = Math.max(2, W(0.14));
      for (let i = 0; i < len; i++) {
        for (let dy = 0; dy < armW; dy++) g.set(attachX + side * (1 + i), y + dy, bodyRegion);
      }
      return { x: attachX + side * len, y: y };
    }
    // "down": hangs along the torso with a 1px elbow bend outward.
    const handY = Y(0.62);
    const elbowY = Math.round((attachY + handY) / 2);
    for (let y = attachY; y <= handY; y++) {
      const bend = y >= elbowY ? 1 : 0;
      const x = attachX + side * bend;
      for (let dx = 0; dx < armW; dx++) g.set(x + side * dx, y, bodyRegion);
    }
    const fist: Point = { x: attachX + side * 1, y: handY + 1 };
    g.fillRect(fist.x - (side === -1 ? 1 : 0), fist.y, 2, 2, bodyRegion);
    return fist;
  };

  const leftHand = drawArm(-1, spec.leftArm);
  const rightHand = drawArm(1, spec.rightArm);

  const faceX0 = centered(headW) + Math.max(1, Math.round(headW * 0.18));
  const faceX1 = centered(headW) + headW - Math.max(1, Math.round(headW * 0.18));
  return {
    grid: g,
    head: { x0: faceX0, y0: headTop + Math.round((headBottom - headTop) * 0.3), x1: faceX1, y1: headBottom },
    hands: { left: leftHand, right: rightHand },
    shoulderY,
    waistY,
    hipsY,
    legsTopY,
    feetY,
  };
}
