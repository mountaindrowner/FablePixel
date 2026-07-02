/**
 * Semantic region ids produced by generators. Plain BODY/SECONDARY/ACCENT
 * pixels get auto-shaded by the pipeline's geometric pass; the explicit
 * _SHADOW/_LIGHT/_DEEP variants are fixed by the generator (terrain bands,
 * gem facets, iso tile faces) and the shading pass leaves them alone.
 */

export const REGION = {
  EMPTY: 0,
  BODY: 1,
  BODY_SHADOW: 2,
  BODY_LIGHT: 3,
  BODY_DEEP: 4,
  SECONDARY: 5,
  SECONDARY_SHADOW: 6,
  SECONDARY_LIGHT: 7,
  SECONDARY_DEEP: 8,
  ACCENT: 9,
  ACCENT_SHADOW: 10,
  ACCENT_LIGHT: 11,
  ACCENT_DEEP: 12,
  /** Always the outline/darkest color (eyes, cracks). */
  DARK: 13,
  /** Always the lightest body tone (glints). */
  LIGHT: 14,
  /** Base tones exempt from geometric shading (terrain bands, flat fills). */
  BODY_BASE: 15,
  SECONDARY_BASE: 16,
  ACCENT_BASE: 17,
  /** Costume ramps: warm light skin and dark leather/hair browns. */
  SKIN: 18,
  SKIN_SHADOW: 19,
  SKIN_LIGHT: 20,
  LEATHER: 21,
  LEATHER_SHADOW: 22,
  LEATHER_LIGHT: 23,
  /** Fixed base tones (no geometric shading), matching *_BASE above. */
  SKIN_BASE: 24,
  LEATHER_BASE: 25,
} as const;

export type RegionId = (typeof REGION)[keyof typeof REGION];

export type RampName = "body" | "secondary" | "accent" | "skin" | "leather";

export interface RegionStyle {
  ramp: RampName | "dark" | "light";
  shift: number;
  /** True for plain ids the geometric shading pass may adjust. */
  autoShade: boolean;
}

export const REGION_STYLE: Record<number, RegionStyle> = {
  [REGION.BODY]: { ramp: "body", shift: 0, autoShade: true },
  [REGION.BODY_SHADOW]: { ramp: "body", shift: -1, autoShade: false },
  [REGION.BODY_LIGHT]: { ramp: "body", shift: 1, autoShade: false },
  [REGION.BODY_DEEP]: { ramp: "body", shift: -2, autoShade: false },
  [REGION.SECONDARY]: { ramp: "secondary", shift: 0, autoShade: true },
  [REGION.SECONDARY_SHADOW]: { ramp: "secondary", shift: -1, autoShade: false },
  [REGION.SECONDARY_LIGHT]: { ramp: "secondary", shift: 1, autoShade: false },
  [REGION.SECONDARY_DEEP]: { ramp: "secondary", shift: -2, autoShade: false },
  [REGION.ACCENT]: { ramp: "accent", shift: 0, autoShade: true },
  [REGION.ACCENT_SHADOW]: { ramp: "accent", shift: -1, autoShade: false },
  [REGION.ACCENT_LIGHT]: { ramp: "accent", shift: 1, autoShade: false },
  [REGION.ACCENT_DEEP]: { ramp: "accent", shift: -2, autoShade: false },
  [REGION.DARK]: { ramp: "dark", shift: 0, autoShade: false },
  [REGION.LIGHT]: { ramp: "light", shift: 0, autoShade: false },
  [REGION.BODY_BASE]: { ramp: "body", shift: 0, autoShade: false },
  [REGION.SECONDARY_BASE]: { ramp: "secondary", shift: 0, autoShade: false },
  [REGION.ACCENT_BASE]: { ramp: "accent", shift: 0, autoShade: false },
  [REGION.SKIN]: { ramp: "skin", shift: 0, autoShade: true },
  [REGION.SKIN_SHADOW]: { ramp: "skin", shift: -1, autoShade: false },
  [REGION.SKIN_LIGHT]: { ramp: "skin", shift: 1, autoShade: false },
  [REGION.LEATHER]: { ramp: "leather", shift: 0, autoShade: true },
  [REGION.LEATHER_SHADOW]: { ramp: "leather", shift: -1, autoShade: false },
  [REGION.LEATHER_LIGHT]: { ramp: "leather", shift: 1, autoShade: false },
  [REGION.SKIN_BASE]: { ramp: "skin", shift: 0, autoShade: false },
  [REGION.LEATHER_BASE]: { ramp: "leather", shift: 0, autoShade: false },
};

/** Dummy palette for region grids (they hold region ids, not colors). */
export const REGION_PALETTE = new Uint32Array(32);
