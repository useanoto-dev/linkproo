import React from "react";
import { SmartLink } from "@/types/smart-link";
import { Switch } from "@/components/ui/switch";
import { Layers } from "lucide-react";
import { ImageUploader } from "../ImageUploader";
import { SectionHeader, SliderRow, ColorPicker } from "./shared";

interface ThemeLogoSectionProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onThrottle: (updates: Partial<SmartLink>) => void;
}

const LOGO_SHAPE_OPTIONS = [
  { value: "square" as const, label: "Quadrado", style: { borderRadius: 0 } },
  {
    value: "rounded" as const,
    label: "Arredond.",
    style: { borderRadius: 8 },
  },
  {
    value: "circle" as const,
    label: "Círculo",
    style: { borderRadius: "50%" },
  },
];

export function ThemeLogoSection({
  link,
  onUpdateLink,
  onThrottle,
}: ThemeLogoSectionProps) {
  const logoShape = link.logoShape ?? "rounded";

  return (
    <section className="space-y-3">
      <SectionHeader icon={Layers} label="Logo & Cabeçalho" />

      <ImageUploader
        value={link.logoUrl}
        onChange={(url) => onUpdateLink({ logoUrl: url })}
        label="Logo"
      />

      {link.logoUrl && (
        <div className="space-y-3 p-3 rounded-xl bg-secondary/20 border border-border/40">
          <SliderRow
            label="Tamanho"
            value={link.logoSizePx ?? 80}
            min={32}
            max={200}
            step={4}
            unit="px"
            onChange={(v) => onThrottle({ logoSizePx: v })}
          />

          {/* Logo shape */}
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Formato</span>
            <div className="grid grid-cols-3 gap-1.5">
              {LOGO_SHAPE_OPTIONS.map((opt) => {
                const active = logoShape === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateLink({ logoShape: opt.value })}
                    className={`flex flex-col items-center py-2 px-1 rounded-lg border text-[10px] font-medium transition-all gap-1.5 ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 ${
                        active ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                      style={opt.style as React.CSSProperties}
                    />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Sombra</span>
            <Switch
              checked={link.logoShadow ?? true}
              onCheckedChange={(v) => onUpdateLink({ logoShadow: v })}
            />
          </div>

          {/* Header style — only when banner image is present */}
          {link.heroImage && (
            <div className="space-y-1.5 pt-1 border-t border-border/30">
              <span className="text-[11px] text-muted-foreground">
                Estilo do cabeçalho
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(["classic", "bio"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => onUpdateLink({ headerStyle: style })}
                    className={`py-2 px-3 rounded-lg border text-[11px] transition-all cursor-pointer ${
                      (link.headerStyle ?? "classic") === style
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {style === "classic" ? "🖼 Clássico" : "👤 Bio"}
                  </button>
                ))}
              </div>

              {link.headerStyle === "bio" && (
                <ColorPicker
                  label="Cor da borda do avatar"
                  value={link.logoBorderColor ?? "#ffffff"}
                  onChange={(v) => onUpdateLink({ logoBorderColor: v })}
                />
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
