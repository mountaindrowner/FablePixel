/**
 * Readability features: eyes (the single highest-leverage detail) and
 * complexity-gated accents like a belt line.
 */

import type { PixelGrid } from "../../core/pixelGrid";
import { REGION } from "../../core/regions";
import type { Rng } from "../../core/rng";
import type { BodyPlan } from "./bodyPlans";

export function placeFeatures(
  grid: PixelGrid,
  plan: BodyPlan,
  complexity: number,
  rng: Rng,
): void {
  const { width, height } = grid;
  const eyeSize = width >= 40 ? 2 : 1;

  for (const eye of plan.eyes) {
    const ex = Math.round(eye.x * (width - 1));
    const ey = Math.round(eye.y * (height - 1));
    // Snap onto the sprite if jitter/noise moved the head slightly.
    const target = findOpaqueNear(grid, ex, ey, 2);
    if (!target) continue;
    for (let dy = 0; dy < eyeSize; dy++) {
      for (let dx = 0; dx < eyeSize; dx++) {
        if (grid.get(target.x + dx, target.y + dy) !== REGION.EMPTY) {
          grid.set(target.x + dx, target.y + dy, REGION.DARK);
        }
      }
    }
  }

  // Belt/trim accent across the torso on bigger, busier sprites.
  if (complexity > 0.5 && height >= 24) {
    const beltY = Math.round(height * rng.range(0.6, 0.7));
    for (let x = 0; x < width; x++) {
      if (grid.get(x, beltY) === REGION.SECONDARY) {
        grid.set(x, beltY, REGION.ACCENT);
      }
    }
  }

  // Sparse highlight glints at high complexity (32-bit look detail).
  if (complexity > 0.75 && width >= 32) {
    const glints = rng.int(1, 3);
    for (let i = 0; i < glints; i++) {
      const gx = rng.int(1, width - 1);
      const gy = rng.int(1, Math.floor(height / 2));
      if (grid.get(gx, gy) === REGION.BODY) grid.set(gx, gy, REGION.LIGHT);
    }
  }
}

function findOpaqueNear(
  grid: PixelGrid,
  x: number,
  y: number,
  radius: number,
): { x: number; y: number } | null {
  if (grid.get(x, y) !== REGION.EMPTY) return { x, y };
  for (let r = 1; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (grid.get(x + dx, y + dy) !== REGION.EMPTY) return { x: x + dx, y: y + dy };
      }
    }
  }
  return null;
}
