/**
 * Deterministic seeded randomness.
 *
 * sfc32 PRNG seeded from a cyrb128 string hash. All integer math — identical
 * output on every JS engine. `fork(label)` derives an independent stream by
 * re-hashing, so pipeline stages can't perturb each other's draws.
 */

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [minIncl, maxExcl). */
  int(minIncl: number, maxExcl: number): number;
  /** Uniform float in [min, max). */
  range(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  chance(p: number): boolean;
  /** Independent labeled sub-stream. Same label → same stream, always. */
  fork(label: string): Rng;
}

export function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

export function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function createRng(seedString: string): Rng {
  const [a, b, c, d] = cyrb128(seedString);
  const raw = sfc32(a, b, c, d);
  // Discard a few initial outputs — sfc32 needs warm-up for weak seeds.
  raw();
  raw();
  raw();

  const rng: Rng = {
    next: raw,
    int(minIncl, maxExcl) {
      return minIncl + Math.floor(raw() * (maxExcl - minIncl));
    },
    range(min, max) {
      return min + raw() * (max - min);
    },
    pick(arr) {
      const v = arr[Math.floor(raw() * arr.length)];
      if (v === undefined && arr.length === 0) throw new Error("pick from empty array");
      return v as (typeof arr)[number];
    },
    chance(p) {
      return raw() < p;
    },
    fork(label) {
      return createRng(`${seedString}/${label}`);
    },
  };
  return rng;
}
