import { cyrb128 } from "./core/rng";
import type { GenerationParams, SpriteSpec } from "./core/types";

const ADJECTIVES = [
  "amber", "brave", "coral", "dusky", "ember", "frost", "golden", "hazel",
  "ivory", "jade", "keen", "lunar", "misty", "noble", "opal", "pale",
  "quiet", "rusty", "silver", "twilight", "umber", "velvet", "wild", "zesty",
];
const NOUNS = [
  "lynx", "raven", "wolf", "fox", "owl", "drake", "sprite", "golem",
  "wisp", "knight", "troll", "moth", "newt", "boar", "crow", "hare",
  "imp", "kelpie", "moss", "pine", "quartz", "reed", "stone", "tide",
];

export function randomSeed(): string {
  const buf = new Uint32Array(3);
  crypto.getRandomValues(buf);
  const a = ADJECTIVES[(buf[0] as number) % ADJECTIVES.length];
  const n = NOUNS[(buf[1] as number) % NOUNS.length];
  const num = ((buf[2] as number) % 9000) + 1000;
  return `${a}-${n}-${num}`;
}

export function normalizeSeed(input: string): string {
  const s = input.trim();
  return s.length > 0 ? s : randomSeed();
}

export function variationSeed(seed: string, index: number): string {
  return `${seed}#${index}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "undefined";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const entries = Object.keys(obj)
    .sort()
    .filter((k) => obj[k] !== undefined)
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${entries.join(",")}}`;
}

export function paramsHash(params: GenerationParams): string {
  const [a, b] = cyrb128(stableStringify(params));
  return ((a as number).toString(16) + (b as number).toString(16)).padStart(16, "0");
}

/** Share strings: "fp1." + base64url(JSON{seed, variationIndex, params}). */

const SHARE_PREFIX = "fp1.";

function toBase64Url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeShare(spec: SpriteSpec): string {
  return (
    SHARE_PREFIX +
    toBase64Url(
      JSON.stringify({ seed: spec.seed, variationIndex: spec.variationIndex, params: spec.params }),
    )
  );
}

export function decodeShare(share: string, defaults: GenerationParams): SpriteSpec | null {
  if (!share.startsWith(SHARE_PREFIX)) return null;
  try {
    const raw = JSON.parse(fromBase64Url(share.slice(SHARE_PREFIX.length))) as {
      seed?: unknown;
      variationIndex?: unknown;
      params?: Record<string, unknown>;
    };
    if (typeof raw.seed !== "string") return null;
    // Unknown keys ignored, missing keys defaulted — forward/backward compatible.
    const params: GenerationParams = { ...defaults };
    if (raw.params && typeof raw.params === "object") {
      for (const key of Object.keys(defaults) as Array<keyof GenerationParams>) {
        if (key in raw.params) {
          (params as unknown as Record<string, unknown>)[key] = raw.params[key];
        }
      }
    }
    return {
      seed: raw.seed,
      variationIndex: typeof raw.variationIndex === "number" ? raw.variationIndex : 0,
      params,
    };
  } catch {
    return null;
  }
}
