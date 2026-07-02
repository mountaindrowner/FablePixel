import type { PixelGrid } from "../engine/index";
import { toImageData } from "./toImageData";

/** Draw a grid at an integer scale with crisp nearest-neighbor pixels. */
export function drawGrid(canvas: HTMLCanvasElement, grid: PixelGrid, scale: number): void {
  const s = Math.max(1, Math.floor(scale));
  canvas.width = grid.width * s;
  canvas.height = grid.height * s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const scratch = document.createElement("canvas");
  scratch.width = grid.width;
  scratch.height = grid.height;
  const sctx = scratch.getContext("2d");
  if (!sctx) return;
  sctx.putImageData(toImageData(grid), 0, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(scratch, 0, 0, canvas.width, canvas.height);
}
