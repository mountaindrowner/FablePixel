import { describe, expect, it } from "vitest";
import { decodeShare, encodeShare, normalizeSeed, paramsHash, variationSeed } from "../engine/index";
import { defaultsFor } from "./helpers";

describe("seed & sharing", () => {
  it("normalizeSeed trims and preserves non-empty input", () => {
    expect(normalizeSeed("  amber-lynx-1 ")).toBe("amber-lynx-1");
    expect(normalizeSeed("").length).toBeGreaterThan(0); // random fallback
  });

  it("variationSeed is stable", () => {
    expect(variationSeed("abc", 3)).toBe("abc#3");
  });

  it("share string round-trips", () => {
    const params = defaultsFor({ category: "item", width: 64, height: 64, baseHue: 120 });
    const spec = { seed: "opal-drake-77", variationIndex: 5, params };
    const decoded = decodeShare(encodeShare(spec), defaultsFor({}));
    expect(decoded).not.toBeNull();
    expect(decoded!.seed).toBe("opal-drake-77");
    expect(decoded!.variationIndex).toBe(5);
    expect(decoded!.params).toEqual(params);
  });

  it("tolerates unknown keys and defaults missing ones", () => {
    const payload = { seed: "x", params: { width: 16, futureKnob: "??" } };
    const b64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const decoded = decodeShare(`fp1.${b64}`, defaultsFor({}));
    expect(decoded).not.toBeNull();
    expect(decoded!.params.width).toBe(16);
    expect(decoded!.params.category).toBe("character");
    expect("futureKnob" in decoded!.params).toBe(false);
  });

  it("returns null on malformed input without throwing", () => {
    expect(decodeShare("nonsense", defaultsFor({}))).toBeNull();
    expect(decodeShare("fp1.!!!not-base64!!!", defaultsFor({}))).toBeNull();
    expect(decodeShare("fp1.aGVsbG8", defaultsFor({}))).toBeNull(); // valid b64, not JSON
  });

  it("paramsHash distinguishes nested categoryParams", () => {
    const a = paramsHash(defaultsFor({ categoryParams: { archetype: "sword" } }));
    const b = paramsHash(defaultsFor({ categoryParams: { archetype: "gem" } }));
    const c = paramsHash(defaultsFor({}));
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});
