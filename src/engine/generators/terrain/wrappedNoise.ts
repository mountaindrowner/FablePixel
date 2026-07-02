/**
 * Tileable value noise: lattice lookups are taken modulo the lattice size,
 * so the field at u=1 equals the field at u=0 by construction — tiles are
 * seamless without any edge blending.
 */

import type { Rng } from "../../core/rng";

export type FieldSampler = (u: number, v: number) => number;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Single-octave wrapped value noise over [0,1)². */
export function makeWrappedNoiseSampler(cells: number, rng: Rng): FieldSampler {
  const lattice = new Float32Array(cells * cells);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rng.next();

  return (u, v) => {
    const x = ((u % 1) + 1) % 1;
    const y = ((v % 1) + 1) % 1;
    const gx = x * cells;
    const gy = y * cells;
    const x0 = Math.floor(gx) % cells;
    const y0 = Math.floor(gy) % cells;
    const x1 = (x0 + 1) % cells;
    const y1 = (y0 + 1) % cells;
    const tx = smoothstep(gx - Math.floor(gx));
    const ty = smoothstep(gy - Math.floor(gy));
    const v00 = lattice[y0 * cells + x0] as number;
    const v10 = lattice[y0 * cells + x1] as number;
    const v01 = lattice[y1 * cells + x0] as number;
    const v11 = lattice[y1 * cells + x1] as number;
    const a = v00 + (v10 - v00) * tx;
    const b = v01 + (v11 - v01) * tx;
    return a + (b - a) * ty;
  };
}

/** Fractal (multi-octave) wrapped noise, normalized to [0,1]. */
export function makeWrappedFbmSampler(baseCells: number, octaves: number, rng: Rng): FieldSampler {
  const samplers: FieldSampler[] = [];
  const amplitudes: number[] = [];
  let cells = baseCells;
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    samplers.push(makeWrappedNoiseSampler(cells, rng));
    amplitudes.push(amp);
    total += amp;
    cells *= 2;
    amp *= 0.5;
  }
  return (u, v) => {
    let sum = 0;
    for (let o = 0; o < samplers.length; o++) {
      // Each octave's sampler already has its own (denser) lattice.
      sum += (samplers[o] as FieldSampler)(u, v) * (amplitudes[o] as number);
    }
    return sum / total;
  };
}
