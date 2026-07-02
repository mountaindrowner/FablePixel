import { hex } from "../core/color";
import type { Palette } from "./index";

/** Classic hardware palettes. Color values are public knowledge / public domain. */

// NES 2C02 — the usable color set with blacks/mirrors deduplicated (55 unique).
const NES_HEX = [
  "#7c7c7c", "#0000fc", "#0000bc", "#4428bc", "#940084", "#a80020", "#a81000", "#881400",
  "#503000", "#007800", "#006800", "#005800", "#004058", "#000000",
  "#bcbcbc", "#0078f8", "#0058f8", "#6844fc", "#d800cc", "#e40058", "#f83800", "#e45c10",
  "#ac7c00", "#00b800", "#00a800", "#00a844", "#008888",
  "#f8f8f8", "#3cbcfc", "#6888fc", "#9878f8", "#f878f8", "#f85898", "#f87858", "#fca044",
  "#f8b800", "#b8f818", "#58d854", "#58f898", "#00e8d8", "#787878",
  "#fcfcfc", "#a4e4fc", "#b8b8f8", "#d8b8f8", "#f8b8f8", "#f8a4c0", "#f0d0b0", "#fce0a8",
  "#f8d878", "#d8f878", "#b8f8b8", "#b8f8d8", "#00fcfc", "#f8d8f8",
];

// Game Boy DMG — 4 shades of green.
const GB_HEX = ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"];

// Commodore 64 — 16 colors (Pepto's measured values).
const C64_HEX = [
  "#000000", "#ffffff", "#883932", "#67b6bd", "#8b3f96", "#55a049", "#40318d", "#bfce72",
  "#8b5429", "#574200", "#b86962", "#505050", "#787878", "#94e089", "#7869c4", "#9f9f9f",
];

// CGA — full 16-color RGBI palette.
const CGA_HEX = [
  "#000000", "#0000aa", "#00aa00", "#00aaaa", "#aa0000", "#aa00aa", "#aa5500", "#aaaaaa",
  "#555555", "#5555ff", "#55ff55", "#55ffff", "#ff5555", "#ff55ff", "#ffff55", "#ffffff",
];

function make(id: string, name: string, hexes: string[], source: string): Palette {
  return { id, name, colors: Uint32Array.from(hexes.map(hex)), source };
}

export const HARDWARE_PALETTES: Palette[] = [
  make("nes", "NES", NES_HEX, "Nintendo 2C02 PPU (canonical 54)"),
  make("gb", "Game Boy", GB_HEX, "DMG-01 4-tone green"),
  make("c64", "Commodore 64", C64_HEX, "VIC-II (Pepto)"),
  make("cga", "CGA", CGA_HEX, "IBM CGA 16-color RGBI"),
];
