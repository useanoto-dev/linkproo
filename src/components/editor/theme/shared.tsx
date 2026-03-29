import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Section Header ────────────────────────────────────────────────────────

export function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
        {label}
      </span>
    </div>
  );
}

// ─── Slider Row ────────────────────────────────────────────────────────────

export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-mono tabular-nums text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-primary cursor-pointer"
      />
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────

export function ColorPicker({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
          <input
            type="color"
            value={value || "#888888"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
          />
          <div
            className="w-full h-full rounded-lg"
            style={{ backgroundColor: value || "#888888" }}
          />
        </div>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value || "")}
          placeholder={placeholder || "#000000"}
          className="text-xs h-8 flex-1 font-mono"
        />
      </div>
    </div>
  );
}

// ─── Focal Point Picker ────────────────────────────────────────────────────

interface FocalPointPickerProps {
  imageUrl: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}

export const FocalPointPicker = React.memo(function FocalPointPicker({
  imageUrl,
  x,
  y,
  onChange,
}: FocalPointPickerProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const ny = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      onChange(
        Math.max(0, Math.min(100, nx)),
        Math.max(0, Math.min(100, ny))
      );
    },
    [onChange]
  );

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden cursor-crosshair border border-border/40"
      style={{ height: 80 }}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full"
        style={{
          objectFit: "cover",
          objectPosition: `${x}% ${y}%`,
          pointerEvents: "none",
        }}
        draggable={false}
      />
      <div
        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-white shadow-md bg-primary/40" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/70 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/70 -translate-x-1/2" />
      </div>
    </div>
  );
});
