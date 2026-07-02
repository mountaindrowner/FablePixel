import { useState } from "react";
import { encodeShare, getPalette } from "../../engine/index";
import { useStore } from "../store";
import { SpriteCanvas } from "./SpriteCanvas";

const PANE_PX = 320;

export function PreviewPane() {
  const results = useStore((s) => s.results);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const seed = useStore((s) => s.seed);
  const params = useStore((s) => s.params);
  const [copied, setCopied] = useState(false);

  const result = results[selectedIndex];
  const grid = result?.frames[0];
  if (!result || !grid) return null;

  const scale = Math.max(1, Math.floor(PANE_PX / Math.max(grid.width, grid.height)));
  const paletteName = getPalette(params.paletteId).name;

  const copyShareLink = async () => {
    const share = encodeShare({ seed, variationIndex: selectedIndex, params });
    const url = `${location.origin}${location.pathname}#${share}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      location.hash = share; // fallback: put it in the URL bar
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="preview-pane">
      <div className="preview-checkerboard">
        <SpriteCanvas
          grid={grid}
          scale={scale}
          cacheKey={`preview:${result.meta.seed}#${selectedIndex}:${result.meta.paramsHash}`}
        />
      </div>
      <div className="preview-caption">
        <code>
          {seed}#{selectedIndex}
        </code>
        <span className="preview-meta">
          {grid.width}×{grid.height} · {paletteName}
        </span>
        <button className="share-button" onClick={copyShareLink}>
          {copied ? "Copied!" : "Copy share link"}
        </button>
      </div>
    </div>
  );
}
