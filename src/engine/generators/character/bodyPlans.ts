/**
 * Body-plan templates in normalized coordinates (0..1 of the sprite box).
 * Templates own the topology — where a head, torso, limbs live — so sprites
 * read as creatures; noise fill inside the parts owns the variety.
 */

import { REGION } from "../../core/regions";
import type { Viewpoint } from "../../core/types";

export interface NormRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BodyPart {
  region: number;
  rect: NormRect;
  fill: "solid" | "noise";
  /** Positional jitter as a fraction of sprite size (default 0.02). */
  jitter?: number;
  /** Component-keep anchor — silhouette cleanup won't drop this part. */
  anchor?: boolean;
}

export interface BodyPlan {
  id: string;
  mirror: boolean;
  parts: BodyPart[];
  /** Normalized eye centers (post-mirror coordinates). */
  eyes: Array<{ x: number; y: number }>;
  /** Minimum complexity for this plan to be eligible. */
  minComplexity: number;
}

const B = REGION.BODY;
const S = REGION.SECONDARY;
const A = REGION.ACCENT;

const TOP_DOWN_PLANS: BodyPlan[] = [
  {
    id: "humanoid",
    mirror: true,
    minComplexity: 0,
    parts: [
      { region: B, rect: { x: 0.26, y: 0.06, w: 0.48, h: 0.44 }, fill: "solid", anchor: true },
      { region: S, rect: { x: 0.24, y: 0.5, w: 0.52, h: 0.32 }, fill: "noise", anchor: true },
      { region: S, rect: { x: 0.1, y: 0.52, w: 0.14, h: 0.22 }, fill: "noise" },
      { region: A, rect: { x: 0.28, y: 0.82, w: 0.18, h: 0.12 }, fill: "solid" },
    ],
    eyes: [
      { x: 0.38, y: 0.28 },
      { x: 0.62, y: 0.28 },
    ],
  },
  {
    id: "blob",
    mirror: true,
    minComplexity: 0,
    parts: [
      { region: B, rect: { x: 0.12, y: 0.15, w: 0.76, h: 0.72 }, fill: "noise", anchor: true },
      { region: B, rect: { x: 0.3, y: 0.3, w: 0.4, h: 0.4 }, fill: "solid", anchor: true },
    ],
    eyes: [
      { x: 0.38, y: 0.42 },
      { x: 0.62, y: 0.42 },
    ],
  },
  {
    id: "quadruped",
    mirror: true,
    minComplexity: 0.4,
    parts: [
      { region: B, rect: { x: 0.3, y: 0.04, w: 0.4, h: 0.3 }, fill: "solid", anchor: true },
      { region: S, rect: { x: 0.2, y: 0.32, w: 0.6, h: 0.5 }, fill: "noise", anchor: true },
      { region: A, rect: { x: 0.24, y: 0.8, w: 0.14, h: 0.14 }, fill: "solid" },
      { region: S, rect: { x: 0.44, y: 0.82, w: 0.12, h: 0.14 }, fill: "noise" },
    ],
    eyes: [
      { x: 0.4, y: 0.16 },
      { x: 0.6, y: 0.16 },
    ],
  },
  {
    id: "winged",
    mirror: true,
    minComplexity: 0.7,
    parts: [
      { region: B, rect: { x: 0.3, y: 0.08, w: 0.4, h: 0.36 }, fill: "solid", anchor: true },
      { region: S, rect: { x: 0.28, y: 0.44, w: 0.44, h: 0.34 }, fill: "noise", anchor: true },
      { region: A, rect: { x: 0.04, y: 0.24, w: 0.24, h: 0.44 }, fill: "noise" },
      { region: A, rect: { x: 0.32, y: 0.78, w: 0.14, h: 0.12 }, fill: "solid" },
    ],
    eyes: [
      { x: 0.42, y: 0.24 },
      { x: 0.58, y: 0.24 },
    ],
  },
];

const SIDE_PLANS: BodyPlan[] = [
  {
    id: "humanoid",
    mirror: false,
    minComplexity: 0,
    parts: [
      { region: B, rect: { x: 0.4, y: 0.05, w: 0.34, h: 0.28 }, fill: "solid", anchor: true },
      { region: S, rect: { x: 0.32, y: 0.33, w: 0.38, h: 0.38 }, fill: "noise", anchor: true },
      { region: S, rect: { x: 0.5, y: 0.38, w: 0.14, h: 0.24 }, fill: "noise" },
      { region: A, rect: { x: 0.34, y: 0.71, w: 0.13, h: 0.24 }, fill: "solid" },
      { region: A, rect: { x: 0.54, y: 0.71, w: 0.13, h: 0.24 }, fill: "solid" },
    ],
    eyes: [{ x: 0.64, y: 0.17 }],
  },
  {
    id: "blob",
    mirror: false,
    minComplexity: 0,
    parts: [
      { region: B, rect: { x: 0.12, y: 0.2, w: 0.76, h: 0.68 }, fill: "noise", anchor: true },
      { region: B, rect: { x: 0.3, y: 0.35, w: 0.42, h: 0.4 }, fill: "solid", anchor: true },
    ],
    eyes: [{ x: 0.66, y: 0.44 }],
  },
  {
    id: "quadruped",
    mirror: false,
    minComplexity: 0.4,
    parts: [
      { region: S, rect: { x: 0.12, y: 0.34, w: 0.6, h: 0.36 }, fill: "noise", anchor: true },
      { region: B, rect: { x: 0.62, y: 0.16, w: 0.3, h: 0.3 }, fill: "solid", anchor: true },
      { region: A, rect: { x: 0.18, y: 0.68, w: 0.1, h: 0.26 }, fill: "solid" },
      { region: A, rect: { x: 0.56, y: 0.68, w: 0.1, h: 0.26 }, fill: "solid" },
      { region: S, rect: { x: 0.02, y: 0.24, w: 0.14, h: 0.18 }, fill: "noise" },
    ],
    eyes: [{ x: 0.8, y: 0.28 }],
  },
  {
    id: "winged",
    mirror: false,
    minComplexity: 0.7,
    parts: [
      { region: B, rect: { x: 0.44, y: 0.08, w: 0.32, h: 0.26 }, fill: "solid", anchor: true },
      { region: S, rect: { x: 0.36, y: 0.34, w: 0.36, h: 0.36 }, fill: "noise", anchor: true },
      { region: A, rect: { x: 0.06, y: 0.14, w: 0.36, h: 0.46 }, fill: "noise" },
      { region: A, rect: { x: 0.4, y: 0.7, w: 0.12, h: 0.24 }, fill: "solid" },
      { region: A, rect: { x: 0.58, y: 0.7, w: 0.12, h: 0.24 }, fill: "solid" },
    ],
    eyes: [{ x: 0.66, y: 0.19 }],
  },
];

const ISO_PLANS: BodyPlan[] = [
  {
    id: "humanoid",
    mirror: false,
    minComplexity: 0,
    parts: [
      { region: B, rect: { x: 0.3, y: 0.08, w: 0.4, h: 0.34 }, fill: "solid", anchor: true },
      { region: S, rect: { x: 0.26, y: 0.42, w: 0.48, h: 0.36 }, fill: "noise", anchor: true },
      { region: A, rect: { x: 0.28, y: 0.76, w: 0.16, h: 0.12 }, fill: "solid" },
      { region: A, rect: { x: 0.52, y: 0.8, w: 0.16, h: 0.12 }, fill: "solid" },
    ],
    eyes: [
      { x: 0.4, y: 0.24 },
      { x: 0.58, y: 0.24 },
    ],
  },
  {
    id: "blob",
    mirror: false,
    minComplexity: 0,
    parts: [
      { region: B, rect: { x: 0.14, y: 0.18, w: 0.72, h: 0.66 }, fill: "noise", anchor: true },
      { region: B, rect: { x: 0.32, y: 0.34, w: 0.38, h: 0.36 }, fill: "solid", anchor: true },
    ],
    eyes: [
      { x: 0.38, y: 0.42 },
      { x: 0.56, y: 0.42 },
    ],
  },
  {
    id: "quadruped",
    mirror: false,
    minComplexity: 0.4,
    parts: [
      { region: S, rect: { x: 0.16, y: 0.36, w: 0.58, h: 0.34 }, fill: "noise", anchor: true },
      { region: B, rect: { x: 0.58, y: 0.14, w: 0.32, h: 0.32 }, fill: "solid", anchor: true },
      { region: A, rect: { x: 0.22, y: 0.68, w: 0.12, h: 0.24 }, fill: "solid" },
      { region: A, rect: { x: 0.56, y: 0.72, w: 0.12, h: 0.22 }, fill: "solid" },
    ],
    eyes: [{ x: 0.74, y: 0.26 }],
  },
];

const PLANS: Record<Viewpoint, BodyPlan[]> = {
  "top-down": TOP_DOWN_PLANS,
  side: SIDE_PLANS,
  isometric: ISO_PLANS,
};

export function plansFor(viewpoint: Viewpoint, complexity: number): BodyPlan[] {
  const eligible = PLANS[viewpoint].filter((p) => p.minComplexity <= complexity);
  return eligible.length > 0 ? eligible : PLANS[viewpoint].slice(0, 1);
}
