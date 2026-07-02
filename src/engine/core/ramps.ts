/**
 * Ramp extraction: turn a source palette into a small working palette of
 * shading ramps (dark → light color runs) for the sprite being generated.
 *
 * Working palette layout: [transparent, outline, ...body, ...secondary, ...accent]
 */

import type { Palette } from "../palettes/index";
import { luminance, toHsl, hueDistance } from "./color";
import type { Rng } from "./rng";

export interface Ramp {
  /** Index of the darkest entry in the working palette. */
  start: number;
  /** Entries in the ramp, dark → light. */
  length: number;
}

export interface ColorRamps {
  working: Uint32Array;
  outlineIdx: number;
  body: Ramp;
  secondary: Ramp;
  accent: Ramp;
  /** Warm light tones (faces, hands) — hue ~30, upper lightness range. */
  skin: Ramp;
  /** Dark warm browns (boots, hair, wood) — hue ~30, lower lightness range. */
  leather: Ramp;
  /** Steel grays (armor, blades) — low saturation, wide lightness spread. */
  metal: Ramp;
}

/**
 * Index within a ramp: base is the middle (rounded up, so a 2-tone ramp is
 * light base + darker shadow), shifted toward dark/light and clamped.
 */
export function rampIndex(ramp: Ramp, shift: number): number {
  const base = Math.ceil((ramp.length - 1) / 2);
  const pos = Math.max(0, Math.min(ramp.length - 1, base + shift));
  return ramp.start + pos;
}

interface Candidate {
  color: number;
  h: number;
  s: number;
  l: number;
  lum: number;
}

function candidates(palette: Palette): Candidate[] {
  const out: Candidate[] = [];
  for (const c of palette.colors) {
    const { h, s, l } = toHsl(c);
    out.push({ color: c, h, s, l, lum: luminance(c) });
  }
  return out;
}

/** Pick `n` colors near a target hue, sorted dark → light, spread across luminance. */
function pickRamp(all: Candidate[], targetHue: number, n: number, lMin = 0.06, lMax = 0.96): number[] {
  // Colorful entries within a widening hue window; avoid near-black/near-white ends.
  let pool: Candidate[] = [];
  for (const windowDeg of [25, 45, 70, 100]) {
    pool = all.filter(
      (c) => c.s > 0.14 && c.l > lMin && c.l < lMax && hueDistance(c.h, targetHue) <= windowDeg,
    );
    if (pool.length >= n) break;
  }
  if (pool.length < n) {
    // Degenerate palette (GB, grayscale-ish): fall back to pure luminance ordering.
    pool = [...all].filter((c) => c.l > 0.02);
    if (pool.length === 0) pool = [...all];
  } else if (pool.length > n) {
    // Keep only the best hue matches before spreading by luminance — otherwise
    // a wide window lets off-hue colors (browns in a red ramp) become the base.
    pool.sort((a, b) => hueDistance(a.h, targetHue) - hueDistance(b.h, targetHue));
    pool = pool.slice(0, Math.max(n, Math.min(pool.length, n * 2)));
  }
  pool.sort((a, b) => a.lum - b.lum);
  if (pool.length <= n) {
    // Pad by repeating ends so ramp length is stable.
    const ramp = pool.map((c) => c.color);
    while (ramp.length < n) ramp.push(ramp[ramp.length - 1] as number);
    return ramp;
  }
  // Evenly spaced picks across the luminance-sorted pool.
  const ramp: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const idx = Math.round(t * (pool.length - 1));
    ramp.push((pool[idx] as Candidate).color);
  }
  // Deduplicate adjacent picks that collapsed to the same color.
  for (let i = 1; i < ramp.length; i++) {
    if (ramp[i] === ramp[i - 1]) {
      const pos = Math.min(pool.length - 1, Math.round((i / (n - 1)) * (pool.length - 1)) + 1);
      ramp[i] = (pool[pos] as Candidate).color;
    }
  }
  return ramp;
}

/**
 * Steel grays: prefer LOW saturation (which pickRamp filters out on purpose)
 * across a wide lightness spread, leaning cool. Falls back to a cool-hue
 * ramp, then pure luminance, for palettes with no grays.
 */
function pickMetalRamp(all: Candidate[], n: number): number[] {
  // Near-neutral grays OR cool desaturated blues — warm tans must not qualify.
  let pool = all.filter(
    (c) => c.l > 0.15 && c.l < 0.97 && (c.s < 0.12 || (c.s < 0.4 && c.h >= 170 && c.h <= 280)),
  );
  if (pool.length < n) pool = all.filter((c) => c.s < 0.55 && c.l > 0.15 && c.l < 0.97 && c.h > 175 && c.h < 265);
  if (pool.length < n) return pickRamp(all, 220, n, 0.15, 0.97);
  pool.sort((a, b) => a.lum - b.lum);
  // Steel reads bright: drop the darkest third when there's room to spare.
  if (pool.length > n + 1) pool = pool.slice(Math.floor(pool.length / 3));
  const ramp: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    ramp.push((pool[Math.round(t * (pool.length - 1))] as Candidate).color);
  }
  for (let i = 1; i < ramp.length; i++) {
    if (ramp[i] === ramp[i - 1]) {
      const pos = Math.min(pool.length - 1, Math.round((i / (n - 1)) * (pool.length - 1)) + 1);
      ramp[i] = (pool[pos] as Candidate).color;
    }
  }
  return ramp;
}

export function extractRamps(
  palette: Palette,
  baseHue: number | "auto",
  rampLength: 2 | 3 | 4,
  rng: Rng,
): ColorRamps {
  const all = candidates(palette);
  const colorful = all.filter((c) => c.s > 0.14 && c.l > 0.06 && c.l < 0.96);

  let hue: number;
  if (baseHue === "auto") {
    hue = colorful.length > 0 ? rng.pick(colorful).h : rng.range(0, 360);
  } else {
    hue = baseHue;
  }

  // Secondary offset ±(60..110)°, accent near-complementary.
  const secondaryHue = (hue + (rng.chance(0.5) ? 1 : -1) * rng.range(60, 110) + 360) % 360;
  const accentHue = (hue + rng.range(150, 210)) % 360;

  const body = pickRamp(all, hue, rampLength);
  const secondary = pickRamp(all, secondaryHue, rampLength);
  const accent = pickRamp(all, accentHue, rampLength);
  // Fixed-purpose costume ramps: same warm hue, split by lightness.
  const skin = pickRamp(all, 27, rampLength, 0.5, 0.88);
  const leather = pickRamp(all, 28, rampLength, 0.1, 0.5);
  const metal = pickMetalRamp(all, rampLength);

  // Outline: darkest palette entry.
  let outlineColor = palette.colors[0] as number;
  let bestLum = Infinity;
  for (const c of all) {
    if (c.lum < bestLum) {
      bestLum = c.lum;
      outlineColor = c.color;
    }
  }

  const working = new Uint32Array(2 + rampLength * 6);
  working[0] = 0; // transparent
  working[1] = outlineColor;
  body.forEach((c, i) => (working[2 + i] = c));
  secondary.forEach((c, i) => (working[2 + rampLength + i] = c));
  accent.forEach((c, i) => (working[2 + rampLength * 2 + i] = c));
  skin.forEach((c, i) => (working[2 + rampLength * 3 + i] = c));
  leather.forEach((c, i) => (working[2 + rampLength * 4 + i] = c));
  metal.forEach((c, i) => (working[2 + rampLength * 5 + i] = c));

  return {
    working,
    outlineIdx: 1,
    body: { start: 2, length: rampLength },
    secondary: { start: 2 + rampLength, length: rampLength },
    accent: { start: 2 + rampLength * 2, length: rampLength },
    skin: { start: 2 + rampLength * 3, length: rampLength },
    leather: { start: 2 + rampLength * 4, length: rampLength },
    metal: { start: 2 + rampLength * 5, length: rampLength },
  };
}
