import { useState } from "react";
import type { PixelGrid } from "../../engine/index";
import { toRgba } from "../../render/toImageData";
import { scaleNearest } from "../../export/scale";
import { packSheet } from "../../export/spritesheet";
import { rgbaToPngBlob } from "../../export/png";
import { downloadBlob } from "../../export/download";
import { useStore } from "../store";

const SCALES = [1, 2, 4, 8];

export function ExportBar() {
  const results = useStore((s) => s.results);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const exportSelection = useStore((s) => s.exportSelection);
  const seed = useStore((s) => s.seed);
  const params = useStore((s) => s.params);
  const [scale, setScale] = useState(4);

  const baseName = [
    "fablepixel",
    params.category,
    params.viewpoint.replace("-", ""),
    `${params.width}x${params.height}`,
    params.paletteId,
    seed,
  ].join("_");

  const exportSingle = async () => {
    const grid = results[selectedIndex]?.frames[0];
    if (!grid) return;
    const img = scaleNearest({ data: toRgba(grid), width: grid.width, height: grid.height }, scale);
    const blob = await rgbaToPngBlob(img.data, img.width, img.height);
    downloadBlob(blob, `${baseName}-${selectedIndex}${scale > 1 ? `@${scale}x` : ""}.png`);
  };

  const exportSheet = async () => {
    const indices =
      exportSelection.size > 0
        ? [...exportSelection].sort((a, b) => a - b)
        : results.map((_, i) => i);
    const frames = indices
      .map((i) => results[i]?.frames[0])
      .filter((g): g is PixelGrid => g !== undefined);
    if (frames.length === 0) return;
    const sheet = packSheet(frames, { columns: 4, scale });
    const blob = await rgbaToPngBlob(sheet.data, sheet.width, sheet.height);
    const suffix = exportSelection.size > 0 ? `sheet${frames.length}` : "sheet16";
    downloadBlob(blob, `${baseName}_${suffix}${scale > 1 ? `@${scale}x` : ""}.png`);
  };

  return (
    <div className="export-bar">
      <label className="field-label">Scale</label>
      <div className="segmented">
        {SCALES.map((s) => (
          <button key={s} className={scale === s ? "active" : ""} onClick={() => setScale(s)}>
            {s}×
          </button>
        ))}
      </div>
      <button className="export-button" onClick={exportSingle}>
        ⬇ PNG
      </button>
      <button className="export-button" onClick={exportSheet}>
        ⬇ Spritesheet {exportSelection.size > 0 ? `(${exportSelection.size} picked)` : "(all 16)"}
      </button>
    </div>
  );
}
