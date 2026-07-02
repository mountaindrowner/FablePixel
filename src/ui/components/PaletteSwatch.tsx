import { ALL_PALETTES } from "../../engine/index";
import { toCss } from "../../engine/core/color";
import { useStore } from "../store";

export function PaletteSwatch() {
  const paletteId = useStore((s) => s.params.paletteId);
  const setParam = useStore((s) => s.setParam);

  return (
    <div className="palette-list">
      {ALL_PALETTES.map((p) => (
        <button
          key={p.id}
          className={`palette-chip${p.id === paletteId ? " active" : ""}`}
          onClick={() => setParam("paletteId", p.id)}
          title={`${p.name} (${p.colors.length} colors) — ${p.source}`}
        >
          <span className="palette-name">{p.name}</span>
          <span className="palette-colors">
            {Array.from(p.colors.slice(0, 8)).map((c, i) => (
              <span key={i} className="palette-color" style={{ background: toCss(c) }} />
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}
