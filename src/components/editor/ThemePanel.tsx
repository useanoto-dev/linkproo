import React, { useRef, useCallback, useEffect, memo } from "react";
import { SmartLink } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeBannerSection } from "./theme/ThemeBannerSection";
import { ThemeLogoSection } from "./theme/ThemeLogoSection";
import { ThemeFontSection, loadGoogleFont } from "./theme/ThemeFontSection";
import { ThemeVisibilitySection } from "./theme/ThemeVisibilitySection";
import { ThemeColorsSection } from "./theme/ThemeColorsSection";

interface ThemePanelProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

export const ThemePanel = memo(function ThemePanel({ link, onUpdateLink }: ThemePanelProps) {
  const rafRef = useRef<number | undefined>(undefined);
  const pendingRef = useRef<Partial<SmartLink> | null>(null);

  useEffect(() => () => { if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current); }, []);

  const throttled = useCallback((updates: Partial<SmartLink>) => {
    pendingRef.current = { ...(pendingRef.current ?? {}), ...updates };
    if (rafRef.current !== undefined) return;
    rafRef.current = requestAnimationFrame(() => {
      if (pendingRef.current) onUpdateLink(pendingRef.current);
      pendingRef.current = null;
      rafRef.current = undefined;
    });
  }, [onUpdateLink]);

  useEffect(() => { loadGoogleFont(link.fontFamily ?? "Inter"); }, [link.fontFamily]);

  return (
    <div className="space-y-6">
      <ThemeBannerSection link={link} onUpdateLink={onUpdateLink} onThrottle={throttled} />
      <ThemeLogoSection link={link} onUpdateLink={onUpdateLink} onThrottle={throttled} />
      <ThemeFontSection link={link} onUpdateLink={onUpdateLink} />
      <ThemeVisibilitySection link={link} onUpdateLink={onUpdateLink} />
      <ThemeColorsSection link={link} onUpdateLink={onUpdateLink} />

      {/* ── MARCA D'ÁGUA ─────────────────────────────────────────────────── */}
      <section className="space-y-3 p-3 rounded-xl border border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-foreground">Marca d'água LinkPro</span>
          <Switch
            checked={link.watermarkEnabled ?? (!link.ownerPlan || link.ownerPlan === "free")}
            onCheckedChange={(v) => onUpdateLink({ watermarkEnabled: v })}
          />
        </div>
        {(link.watermarkEnabled ?? (!link.ownerPlan || link.ownerPlan === "free")) && (
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">URL do link</Label>
            <Input
              value={link.watermarkUrl || ""}
              onChange={(e) => onUpdateLink({ watermarkUrl: e.target.value || undefined })}
              placeholder="https://wa.me/... (padrão)"
              className="text-xs h-8 font-mono"
            />
          </div>
        )}
      </section>
    </div>
  );
});
