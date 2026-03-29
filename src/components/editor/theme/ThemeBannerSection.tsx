import React from "react";
import { SmartLink, HeroObjectFit } from "@/types/smart-link";
import { Switch } from "@/components/ui/switch";
import { Image, Crosshair } from "lucide-react";
import { ImageUploader } from "../ImageUploader";
import { SectionHeader, SliderRow, FocalPointPicker } from "./shared";

interface ThemeBannerSectionProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onThrottle: (updates: Partial<SmartLink>) => void;
}

const HERO_FIT_OPTIONS = [
  { value: "cover" as HeroObjectFit, label: "Preencher" },
  { value: "contain" as HeroObjectFit, label: "Conter" },
  { value: "fill" as HeroObjectFit, label: "Esticar" },
] as const;

export function ThemeBannerSection({
  link,
  onUpdateLink,
  onThrottle,
}: ThemeBannerSectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeader icon={Image} label="Banner" />

      <ImageUploader
        value={link.heroImage}
        onChange={(url) => onUpdateLink({ heroImage: url })}
        aspectRatio={16 / 9}
        label="Imagem do Banner"
      />

      {link.heroImage && (
        <div className="space-y-3 p-3 rounded-xl bg-secondary/20 border border-border/40">
          <SliderRow
            label="Altura"
            value={link.heroImageHeightPx ?? 192}
            min={80}
            max={500}
            step={4}
            unit="px"
            onChange={(v) => onThrottle({ heroImageHeightPx: v })}
          />

          {/* Image fit */}
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">
              Ajuste da imagem
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {HERO_FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdateLink({ heroObjectFit: opt.value })}
                  className={`py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                    (link.heroObjectFit ?? "cover") === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focal point */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crosshair className="h-3 w-3 text-primary" />
                <span className="text-[11px] text-muted-foreground">
                  Ponto focal
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                {link.heroFocalPoint?.x ?? 50}%{" "}
                {link.heroFocalPoint?.y ?? 50}%
              </span>
            </div>
            <FocalPointPicker
              imageUrl={link.heroImage}
              x={link.heroFocalPoint?.x ?? 50}
              y={link.heroFocalPoint?.y ?? 50}
              onChange={(x, y) => onUpdateLink({ heroFocalPoint: { x, y } })}
            />
          </div>

          <SliderRow
            label="Opacidade da imagem"
            value={link.heroImageOpacity ?? 100}
            min={10}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => onThrottle({ heroImageOpacity: v })}
          />

          <SliderRow
            label="Overlay escuro"
            value={link.heroOverlayOpacity ?? 0}
            min={0}
            max={80}
            step={5}
            unit="%"
            onChange={(v) => onThrottle({ heroOverlayOpacity: v })}
          />

          {/* Banner curve */}
          <div className="pt-1 border-t border-border/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Curva no banner
              </span>
              <Switch
                checked={link.bannerCurve ?? false}
                onCheckedChange={(v) => onUpdateLink({ bannerCurve: v })}
              />
            </div>
            {link.bannerCurve && (
              <SliderRow
                label="Intensidade da curva"
                value={link.bannerCurveIntensity ?? 50}
                min={5}
                max={100}
                step={5}
                unit="%"
                onChange={(v) => onThrottle({ bannerCurveIntensity: v })}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
