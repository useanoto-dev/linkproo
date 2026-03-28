import { SmartLinkButton, LinkBlock } from "@/types/smart-link";

type CanvasElement = SmartLinkButton | LinkBlock;

interface CanvasPropertiesPanelProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

function NumInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(v);
        }}
        className="w-full h-8 px-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export function CanvasPropertiesPanel({ element, onUpdate }: CanvasPropertiesPanelProps) {
  if (!element) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Posição &amp; Tamanho
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumInput
          label="X"
          value={element.canvasX}
          onChange={(v) => onUpdate({ canvasX: v })}
          min={-9999}
        />
        <NumInput
          label="Y"
          value={element.canvasY}
          onChange={(v) => onUpdate({ canvasY: v })}
          min={-9999}
        />
        <NumInput
          label="W"
          value={element.canvasW}
          onChange={(v) => onUpdate({ canvasW: Math.max(20, v) })}
          min={20}
        />
        <NumInput
          label="H"
          value={element.canvasH}
          onChange={(v) => onUpdate({ canvasH: Math.max(8, v) })}
          min={8}
        />
      </div>
      <NumInput
        label="Rotação (°)"
        value={element.canvasRotation}
        onChange={(v) => onUpdate({ canvasRotation: v })}
        min={-360}
        max={360}
      />
    </div>
  );
}
