import { useEffect } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { VariationGrid } from "./components/VariationGrid";
import { PreviewPane } from "./components/PreviewPane";
import { ExportBar } from "./components/ExportBar";
import { useStore } from "./store";

export function App() {
  const loadShare = useStore((s) => s.loadShare);

  useEffect(() => {
    const onHashChange = () => {
      if (location.hash.length > 1) loadShare(location.hash.slice(1));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [loadShare]);

  return (
    <div className="app-layout">
      <ControlPanel />
      <main className="workspace">
        <VariationGrid />
        <div className="side-pane">
          <PreviewPane />
          <ExportBar />
        </div>
      </main>
    </div>
  );
}
