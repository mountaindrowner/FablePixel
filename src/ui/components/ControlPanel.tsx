import { useState } from "react";
import { clampSize, type CategoryId, type Era, type Viewpoint } from "../../engine/index";
import { useStore } from "../store";
import { PaletteSwatch } from "./PaletteSwatch";
import { AdvancedPanel } from "./AdvancedPanel";

const CATEGORIES: Array<{ id: CategoryId; label: string }> = [
  { id: "character", label: "Character" },
  { id: "terrain", label: "Terrain" },
  { id: "item", label: "Item" },
];

const VIEWPOINTS: Array<{ id: Viewpoint; label: string }> = [
  { id: "top-down", label: "Top-down" },
  { id: "isometric", label: "Isometric" },
  { id: "side", label: "Side" },
];

const ERAS: Array<{ id: Era; label: string }> = [
  { id: "8bit", label: "8-bit" },
  { id: "16bit", label: "16-bit" },
  { id: "32bit", label: "32-bit" },
];

const SIZE_PRESETS = [16, 32, 64];

export function ControlPanel() {
  const params = useStore((s) => s.params);
  const seed = useStore((s) => s.seed);
  const setParam = useStore((s) => s.setParam);
  const setEra = useStore((s) => s.setEra);
  const setCategory = useStore((s) => s.setCategory);
  const setSeed = useStore((s) => s.setSeed);
  const generate = useStore((s) => s.generate);
  const [seedDraft, setSeedDraft] = useState<string | null>(null);
  const [customSize, setCustomSize] = useState(false);

  const isPreset = !customSize && SIZE_PRESETS.includes(params.width) && params.width === params.height;

  const applySize = (w: number, h: number) => {
    const cw = clampSize(w);
    const ch = clampSize(h);
    setParam("width", cw);
    if (ch !== cw || params.height !== ch) setParam("height", ch);
  };

  return (
    <aside className="control-panel">
      <h1 className="app-title">FablePixel</h1>

      <section>
        <label className="field-label">Type</label>
        <div className="segmented">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={params.category === c.id ? "active" : ""}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="field-label">View</label>
        <div className="segmented">
          {VIEWPOINTS.map((v) => (
            <button
              key={v.id}
              className={params.viewpoint === v.id ? "active" : ""}
              onClick={() => setParam("viewpoint", v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="field-label">Era look</label>
        <div className="segmented">
          {ERAS.map((e) => (
            <button key={e.id} className={params.era === e.id ? "active" : ""} onClick={() => setEra(e.id)}>
              {e.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="field-label">Size</label>
        <div className="segmented">
          {SIZE_PRESETS.map((s) => (
            <button
              key={s}
              className={isPreset && params.width === s ? "active" : ""}
              onClick={() => {
                setCustomSize(false);
                applySize(s, s);
              }}
            >
              {s}×{s}
            </button>
          ))}
          <button className={!isPreset ? "active" : ""} onClick={() => setCustomSize(true)}>
            Custom
          </button>
        </div>
        {(customSize || !isPreset) && (
          <div className="custom-size">
            <input
              type="number"
              min={8}
              max={128}
              value={params.width}
              onChange={(e) => setParam("width", clampSize(Number(e.target.value)))}
            />
            <span>×</span>
            <input
              type="number"
              min={8}
              max={128}
              value={params.height}
              onChange={(e) => setParam("height", clampSize(Number(e.target.value)))}
            />
          </div>
        )}
      </section>

      <section>
        <label className="field-label">Palette</label>
        <PaletteSwatch />
      </section>

      <section>
        <label className="field-label">Seed</label>
        <div className="seed-row">
          <input
            type="text"
            value={seedDraft ?? seed}
            onChange={(e) => setSeedDraft(e.target.value)}
            onBlur={() => {
              if (seedDraft !== null && seedDraft !== seed) setSeed(seedDraft);
              setSeedDraft(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            spellCheck={false}
          />
        </div>
      </section>

      <button className="generate-button" onClick={generate}>
        🎲 Generate
      </button>

      <AdvancedPanel />
    </aside>
  );
}
