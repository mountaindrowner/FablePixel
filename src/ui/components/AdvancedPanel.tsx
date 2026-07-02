import { ITEM_ARCHETYPES, TERRAIN_ARCHETYPES, type OutlineMode } from "../../engine/index";
import { useStore } from "../store";

const OUTLINES: OutlineMode[] = ["none", "black", "selective"];

export function AdvancedPanel() {
  const params = useStore((s) => s.params);
  const setParam = useStore((s) => s.setParam);

  const archetypes =
    params.category === "item"
      ? [...ITEM_ARCHETYPES, "blob"]
      : params.category === "terrain"
        ? TERRAIN_ARCHETYPES
        : null;
  const currentArchetype =
    typeof params.categoryParams?.["archetype"] === "string"
      ? (params.categoryParams["archetype"] as string)
      : "random";

  const autoHue = params.baseHue === "auto";

  return (
    <details className="advanced-panel">
      <summary>Advanced</summary>

      <label className="field-label">Outline</label>
      <div className="segmented">
        {OUTLINES.map((o) => (
          <button key={o} className={params.outline === o ? "active" : ""} onClick={() => setParam("outline", o)}>
            {o}
          </button>
        ))}
      </div>

      {archetypes && (
        <>
          <label className="field-label">Archetype</label>
          <select
            value={currentArchetype}
            onChange={(e) =>
              setParam(
                "categoryParams",
                e.target.value === "random" ? undefined : { archetype: e.target.value },
              )
            }
          >
            <option value="random">random</option>
            {archetypes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </>
      )}

      <label className="field-label">
        Density <span className="value">{params.density.toFixed(2)}</span>
      </label>
      <input
        type="range"
        min={0.2}
        max={0.9}
        step={0.05}
        value={params.density}
        onChange={(e) => setParam("density", Number(e.target.value))}
      />

      <label className="field-label">
        Complexity <span className="value">{params.complexity.toFixed(2)}</span>
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={params.complexity}
        onChange={(e) => setParam("complexity", Number(e.target.value))}
      />

      <label className="field-label">Base hue</label>
      <div className="hue-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={autoHue}
            onChange={(e) => setParam("baseHue", e.target.checked ? "auto" : 200)}
          />
          auto
        </label>
        {!autoHue && (
          <input
            type="range"
            min={0}
            max={359}
            step={1}
            value={typeof params.baseHue === "number" ? params.baseHue : 200}
            onChange={(e) => setParam("baseHue", Number(e.target.value))}
            className="hue-slider"
          />
        )}
      </div>

      <label className="field-label">Shades per ramp</label>
      <div className="segmented">
        {([2, 3, 4] as const).map((n) => (
          <button key={n} className={params.rampLength === n ? "active" : ""} onClick={() => setParam("rampLength", n)}>
            {n}
          </button>
        ))}
      </div>

      <label className="checkbox-label">
        <input type="checkbox" checked={params.dither} onChange={(e) => setParam("dither", e.target.checked)} />
        dithering
      </label>

      {params.category === "character" && (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={params.symmetry === "horizontal"}
            onChange={(e) => setParam("symmetry", e.target.checked ? "horizontal" : "none")}
          />
          symmetry
        </label>
      )}
    </details>
  );
}
