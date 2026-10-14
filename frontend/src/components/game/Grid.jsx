import { useRef, useState } from "react";
import { lineCells } from "../../game/generator";

const cellFromPoint = (x, y) => {
  const el = document.elementFromPoint(x, y)?.closest("[data-cell]");
  return el ? el.dataset.cell.split("-").map(Number) : null;
};

export const Grid = ({ grid, foundCells, hintCell, onSelect }) => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const ref = useRef(null);
  const selected = new Set(start && end ? lineCells(start, end).map((c) => c.join("-")) : []);

  const down = (e) => {
    const c = cellFromPoint(e.clientX, e.clientY);
    if (!c) return;
    ref.current?.setPointerCapture?.(e.pointerId);
    setStart(c); setEnd(c);
  };
  const move = (e) => {
    if (!start) return;
    const c = cellFromPoint(e.clientX, e.clientY);
    if (c) setEnd(c);
  };
  const up = () => {
    if (start && end) onSelect(lineCells(start, end));
    setStart(null); setEnd(null);
  };

  return (
    <div
      ref={ref}
      data-testid="word-search-grid"
      className="grid gap-[3px] sm:gap-1 select-none touch-none p-3 sm:p-4 bg-white rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0_#0F172A]"
      style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
    >
      {grid.map((row, r) => row.map((ch, c) => {
        const k = `${r}-${c}`;
        const isSel = selected.has(k);
        const found = foundCells.has(k);
        const hint = hintCell === k;
        return (
          <div
            key={k}
            data-cell={k}
            data-testid={`grid-cell-${r}-${c}`}
            className={`aspect-square flex items-center justify-center rounded-md sm:rounded-lg font-grid font-bold text-xs sm:text-base lg:text-lg cursor-pointer transition-colors duration-150 uppercase
              ${isSel ? "bg-[#818CF8] text-white scale-110" : found ? "bg-[#34D399] text-slate-900" : "bg-[#F1F5F9] text-slate-800 hover:bg-indigo-100"}
              ${hint ? "ring-4 ring-amber-400 animate-pulse" : ""}`}
          >
            {ch}
          </div>
        );
      }))}
    </div>
  );
};
