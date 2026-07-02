import { useStore } from "../store";
import { SpriteCanvas } from "./SpriteCanvas";

const TILE_PX = 88;

export function VariationGrid() {
  const results = useStore((s) => s.results);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const exportSelection = useStore((s) => s.exportSelection);
  const select = useStore((s) => s.select);
  const toggleExport = useStore((s) => s.toggleExport);

  return (
    <div className="variation-grid">
      {results.map((result, i) => {
        const grid = result.frames[0];
        if (!grid) return null;
        const scale = Math.max(1, Math.floor(TILE_PX / Math.max(grid.width, grid.height)));
        return (
          <div className="variation-cell" key={i}>
            <SpriteCanvas
              grid={grid}
              scale={scale}
              cacheKey={`${result.meta.seed}#${i}:${result.meta.paramsHash}`}
              selected={i === selectedIndex}
              exportSelected={exportSelection.has(i)}
              title={`${result.meta.seed}#${i} — click to select, shift-click to add to sheet`}
              onClick={(shiftKey) => (shiftKey ? toggleExport(i) : select(i))}
            />
          </div>
        );
      })}
    </div>
  );
}
