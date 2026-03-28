import { useEffect, useRef, useState, CSSProperties } from "react";
import { Trash2, Copy, ChevronUp, ChevronDown, X } from "lucide-react";

interface CanvasToolbarProps {
  selectedId: string;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onDeselect: () => void;
}

interface ToolbarPos {
  top: number;
  left: number;
}

export function CanvasToolbar({
  selectedId,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onDeselect,
}: CanvasToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<ToolbarPos | null>(null);

  useEffect(() => {
    function measure() {
      const target = document.querySelector<HTMLElement>(`[data-canvas-id="${selectedId}"]`);
      if (!target) { setPos(null); return; }

      const r = target.getBoundingClientRect();
      const toolbarH = toolbarRef.current?.offsetHeight ?? 36;
      // Place above target; if not enough room (near top of viewport), place below
      const top = r.top > toolbarH + 12 ? r.top - toolbarH - 8 : r.bottom + 8;
      setPos({ top, left: r.left + r.width / 2 });
    }

    measure();

    // Re-measure on any canvas drag / resize via MutationObserver + rAF polling
    let rafId: number;
    let prev = "";
    function poll() {
      const target = document.querySelector<HTMLElement>(`[data-canvas-id="${selectedId}"]`);
      if (target) {
        const r = target.getBoundingClientRect();
        const key = `${r.top},${r.left},${r.width},${r.height}`;
        if (key !== prev) { prev = key; measure(); }
      }
      rafId = requestAnimationFrame(poll);
    }
    rafId = requestAnimationFrame(poll);

    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [selectedId]);

  if (!pos) return null;

  const style: CSSProperties = {
    position: "fixed",
    top: pos.top,
    left: pos.left,
    transform: "translateX(-50%)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: 2,
    padding: "4px 6px",
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 10,
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    pointerEvents: "auto",
  };

  const sep = <div style={{ width: 1, height: 16, background: "hsl(var(--border))", margin: "0 2px" }} />;
  const btn = "flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer select-none";

  return (
    <div ref={toolbarRef} style={style} onMouseDown={(e) => e.stopPropagation()}>
      <button type="button" className={btn} title="Trazer para frente (Ctrl+])" onClick={() => onBringForward(selectedId)}>
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={btn} title="Enviar para trás (Ctrl+[)" onClick={() => onSendBackward(selectedId)}>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {sep}
      <button type="button" className={btn} title="Duplicar (Ctrl+D)" onClick={() => onDuplicate(selectedId)}>
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button type="button" className={`${btn} hover:text-destructive`} title="Deletar (Delete)" onClick={() => onDelete(selectedId)}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      {sep}
      <button type="button" className={btn} title="Fechar seleção (Esc)" onClick={onDeselect}>
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
