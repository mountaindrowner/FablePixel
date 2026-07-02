import { describe, expect, it } from "vitest";
import { createRng } from "../engine/core/rng";

describe("rng", () => {
  it("is deterministic for the same seed", () => {
    const a = createRng("hello");
    const b = createRng("hello");
    for (let i = 0; i < 100; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it("differs across seeds", () => {
    const a = createRng("hello");
    const b = createRng("world");
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it("stays in [0, 1)", () => {
    const rng = createRng("bounds");
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("int() respects bounds", () => {
    const rng = createRng("ints");
    for (let i = 0; i < 1000; i++) {
      const v = rng.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThan(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("forks are independent labeled streams", () => {
    const root = createRng("root");
    const a1 = root.fork("a");
    const b1 = root.fork("b");
    const seqA = Array.from({ length: 10 }, () => a1.next());
    const seqB = Array.from({ length: 10 }, () => b1.next());
    expect(seqA).not.toEqual(seqB);

    // Same label → identical stream, regardless of parent consumption.
    const root2 = createRng("root");
    root2.next();
    root2.next();
    const a2 = root2.fork("a");
    const seqA2 = Array.from({ length: 10 }, () => a2.next());
    expect(seqA2).toEqual(seqA);
  });

  it("fork order is irrelevant", () => {
    const r1 = createRng("x");
    const first = r1.fork("alpha").next();
    const r2 = createRng("x");
    r2.fork("beta");
    r2.fork("gamma");
    expect(r2.fork("alpha").next()).toBe(first);
  });
});
