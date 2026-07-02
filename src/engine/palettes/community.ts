import { hex } from "../core/color";
import type { Palette } from "./index";

/** Popular community pixel-art palettes, freely published by their authors. */

// PICO-8 (Lexaloffle) — 16 colors.
const PICO8_HEX = [
  "#000000", "#1d2b53", "#7e2553", "#008751", "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8",
  "#ff004d", "#ffa300", "#ffec27", "#00e436", "#29adff", "#83769c", "#ff77a8", "#ffccaa",
];

// Endesga 32 by ENDESGA.
const ENDESGA32_HEX = [
  "#be4a2f", "#d77643", "#ead4aa", "#e4a672", "#b86f50", "#733e39", "#3e2731", "#a22633",
  "#e43b44", "#f77622", "#feae34", "#fee761", "#63c74d", "#3e8948", "#265c42", "#193c3e",
  "#124e89", "#0099db", "#2ce8f5", "#ffffff", "#c0cbdc", "#8b9bb4", "#5a6988", "#3a4466",
  "#262b44", "#181425", "#ff0044", "#68386c", "#b55088", "#f6757a", "#e8b796", "#c28569",
];

// AAP-64 by Adigun A. Polack.
const AAP64_HEX = [
  "#060608", "#141013", "#3b1725", "#73172d", "#b4202a", "#df3e23", "#fa6a0a", "#f9a31b",
  "#ffd541", "#fffc40", "#d6f264", "#9cdb43", "#59c135", "#14a02e", "#1a7a3e", "#24523b",
  "#122020", "#143464", "#285cc4", "#249fde", "#20d6c7", "#a6fcdb", "#ffffff", "#fef3c0",
  "#fad6b8", "#f5a097", "#e86a73", "#bc4a9b", "#793a80", "#403353", "#242234", "#221c1a",
  "#322b28", "#71413b", "#bb7547", "#dba463", "#f4d29c", "#dae0ea", "#b3b9d1", "#8b93af",
  "#6d758d", "#4a5462", "#333941", "#422433", "#5b3138", "#8e5252", "#ba756a", "#e9b5a3",
  "#e3e6ff", "#b9bffb", "#849be4", "#588dbe", "#477d85", "#23674e", "#328464", "#5daf8d",
  "#92dcba", "#cdf7e2", "#e4d2aa", "#c7b08b", "#a08662", "#796755", "#5a4e44", "#423934",
];

// Resurrect 64 by Kerrie Lake.
const RESURRECT64_HEX = [
  "#2e222f", "#3e3546", "#625565", "#966c6c", "#ab947a", "#694f62", "#7f708a", "#9babb2",
  "#c7dcd0", "#ffffff", "#6e2727", "#b33831", "#ea4f36", "#f57d4a", "#ae2334", "#e83b3b",
  "#fb6b1d", "#f79617", "#f9c22b", "#7a3045", "#9e4539", "#cd683d", "#e6904e", "#fbb954",
  "#4c3e24", "#676633", "#a2a947", "#d5e04b", "#fbff86", "#165a4c", "#239063", "#1ebc73",
  "#91db69", "#cddf6c", "#313638", "#374e4a", "#547e64", "#92a984", "#b2ba90", "#0b5e65",
  "#0b8a8f", "#0eaf9b", "#30e1b9", "#8ff8e2", "#323353", "#484a77", "#4d65b4", "#4d9be6",
  "#8fd3ff", "#45293f", "#6b3e75", "#905ea9", "#a884f3", "#eaaded", "#753c54", "#a24b6f",
  "#cf657f", "#ed8099", "#831c5d", "#c32454", "#f04f78", "#f68181", "#fca790", "#fdcbb0",
];

function make(id: string, name: string, hexes: string[], source: string): Palette {
  return { id, name, colors: Uint32Array.from(hexes.map(hex)), source };
}

export const COMMUNITY_PALETTES: Palette[] = [
  make("pico8", "PICO-8", PICO8_HEX, "Lexaloffle PICO-8"),
  make("endesga32", "Endesga 32", ENDESGA32_HEX, "ENDESGA"),
  make("aap64", "AAP-64", AAP64_HEX, "Adigun A. Polack"),
  make("resurrect64", "Resurrect 64", RESURRECT64_HEX, "Kerrie Lake"),
];
