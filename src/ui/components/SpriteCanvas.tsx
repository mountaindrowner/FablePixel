import { memo, useEffect, useRef } from "react";
import type { PixelGrid } from "../../engine/index";
import { drawGrid } from "../../render/drawToCanvas";

interface Props {
  grid: PixelGrid;
  scale: number;
  cacheKey: string;
  selected?: boolean;
  exportSelected?: boolean;
  onClick?: (shiftKey: boolean) => void;
  title?: string;
}

export const SpriteCanvas = memo(
  function SpriteCanvas({ grid, scale, selected, exportSelected, onClick, title }: Props) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      if (ref.current) drawGrid(ref.current, grid, scale);
    }, [grid, scale]);

    const classes = ["sprite-canvas"];
    if (selected) classes.push("selected");
    if (exportSelected) classes.push("export-selected");
    return (
      <canvas
        ref={ref}
        className={classes.join(" ")}
        title={title}
        onClick={(e) => onClick?.(e.shiftKey)}
      />
    );
  },
  (prev, next) =>
    prev.cacheKey === next.cacheKey &&
    prev.scale === next.scale &&
    prev.selected === next.selected &&
    prev.exportSelected === next.exportSelected,
);
