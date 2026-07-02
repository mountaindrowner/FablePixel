/**
 * Turn a body plan into a region grid: scale normalized parts into pixels
 * (with seeded jitter), solid-fill or noise-fill each, mirror if symmetric,
 * then drop floating islands that don't touch an anchored part.
 */

import { PixelGrid, keepLargestComponent } from "../../core/pixelGrid";
import { REGION, REGION_PALETTE } from "../../core/regions";
import { drawLine, fillRoundedRect } from "../../core/draw";
import type { Rng } from "../../core/rng";
import { noiseFill } from "../noiseFill";
import type { BodyPlan } from "./bodyPlans";

const OUTLINE_MARGIN = 1;

export function buildSilhouette(
  plan: BodyPlan,
  width: number,
  height: number,
  density: number,
  mirrorOverride: boolean | null,
  rng: Rng,
): PixelGrid {
  const grid = new PixelGrid(width, height, REGION_PALETTE);
  const innerW = width - OUTLINE_MARGIN * 2;
  const innerH = height - OUTLINE_MARGIN * 2;
  const mirror = mirrorOverride ?? plan.mirror;
  const anchors: Array<{ x: number; y: number; region: number }> = [];

  for (const part of plan.parts) {
    const jitterFrac = part.jitter ?? 0.03;
    const jx = Math.round(rng.range(-1, 1) * jitterFrac * innerW);
    const jy = Math.round(rng.range(-1, 1) * jitterFrac * innerH);
    let px = OUTLINE_MARGIN + Math.round(part.rect.x * innerW) + jx;
    let py = OUTLINE_MARGIN + Math.round(part.rect.y * innerH) + jy;
    let pw = Math.max(1, Math.round(part.rect.w * innerW));
    let ph = Math.max(1, Math.round(part.rect.h * innerH));
    // Clamp into the margin box.
    px = Math.max(OUTLINE_MARGIN, Math.min(px, width - OUTLINE_MARGIN - 1));
    py = Math.max(OUTLINE_MARGIN, Math.min(py, height - OUTLINE_MARGIN - 1));
    pw = Math.min(pw, width - OUTLINE_MARGIN - px);
    ph = Math.min(ph, height - OUTLINE_MARGIN - py);

    if (part.fill === "solid") {
      if (pw >= 4 && ph >= 4) fillRoundedRect(grid, px, py, pw, ph, part.region);
      else grid.fillRect(px, py, pw, ph, part.region);
    } else {
      noiseFill(grid, { x: px, y: py, w: pw, h: ph }, density, rng, part.region);
      // Guarantee a core so noise can't erase a required part entirely.
      if (part.anchor) {
        const cw = Math.max(1, Math.floor(pw / 2));
        const ch = Math.max(1, Math.floor(ph / 2));
        grid.fillRect(px + Math.floor((pw - cw) / 2), py + Math.floor((ph - ch) / 2), cw, ch, part.region);
      }
    }
    if (part.anchor) {
      anchors.push({ x: px + Math.floor(pw / 2), y: py + Math.floor(ph / 2), region: part.region });
    }
  }

  // Spine: connect consecutive anchor parts so head and body never float
  // apart. Drawn into empty pixels only (never over existing parts), centered
  // so the mirror pass can't erase it.
  const spineW = Math.max(2, Math.round(Math.min(width, height) / 8));
  const scratch = new PixelGrid(width, height, REGION_PALETTE);
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1]!;
    const b = anchors[i]!;
    for (let o = 0; o < spineW; o++) {
      const off = o - Math.floor(spineW / 2);
      drawLine(scratch, a.x + off, a.y, b.x + off, b.y, b.region);
    }
  }
  for (let i = 0; i < grid.data.length; i++) {
    if (grid.data[i] === REGION.EMPTY) grid.data[i] = scratch.data[i] as number;
  }

  if (mirror) grid.mirrorX();
  keepLargestComponent(grid, anchors);

  // Degenerate output → guaranteed fallback blob.
  if (grid.countNonTransparent() < width * height * 0.06) {
    grid.fill(REGION.EMPTY);
    noiseFill(
      grid,
      {
        x: OUTLINE_MARGIN + Math.floor(innerW * 0.15),
        y: OUTLINE_MARGIN + Math.floor(innerH * 0.2),
        w: Math.floor(innerW * 0.7),
        h: Math.floor(innerH * 0.6),
      },
      Math.max(density, 0.6),
      rng,
      REGION.BODY,
    );
    grid.fillRect(
      OUTLINE_MARGIN + Math.floor(innerW * 0.3),
      OUTLINE_MARGIN + Math.floor(innerH * 0.35),
      Math.max(2, Math.floor(innerW * 0.4)),
      Math.max(2, Math.floor(innerH * 0.3)),
      REGION.BODY,
    );
    if (mirror) grid.mirrorX();
    keepLargestComponent(grid);
  }

  return grid;
}
