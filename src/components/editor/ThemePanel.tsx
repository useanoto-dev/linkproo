import React, { useRef, useCallback, useEffect, memo, useState } from "react";
import { SmartLink } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smile, X, Plus } from "lucide-react";
import { ThemeBannerSection } from "./theme/ThemeBannerSection";
import { ThemeLogoSection } from "./theme/ThemeLogoSection";
import { ThemeFontSection, loadGoogleFont } from "./theme/ThemeFontSection";
import { ThemeVisibilitySection } from "./theme/ThemeVisibilitySection";
import { ThemeColorsSection } from "./theme/ThemeColorsSection";

function FloatingEmojisSection({ emojis, onUpdate }: { emojis: string[]; onUpdate: (emojis: string[]) => void }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newEmojis = trimmed.split(/\s+/).filter(Boolean);
    onUpdate([...emojis, ...newEmojis]);
    setInput("");
  };

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-bold uppercase tracking-wider text-primary">Emojis Flutuantes</Label>
        </div>
        <Switch
          checked={emojis.length > 0}
          onCheckedChange={(v) => {
            if (v) { if (emojis.length === 0) onUpdate(["✨"]); }
            else onUpdate([]);
          }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground">Emojis que flutuam sobre o banner. Clique no ✕ para remover individualmente.</p>

      {emojis.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {emojis.map((emoji, i) => (
            <span
              key={`${emoji}-${i}`}
              className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-full bg-secondary border border-border/50 text-sm"
            >
              {emoji}
              <button
                type="button"
                onClick={() => onUpdate(emojis.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                aria-label={`Remover ${emoji}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 pt-0.5">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="🔥 💎 ✨  (separe por espaço)"
          className="text-sm h-8 flex-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 shrink-0"
          aria-label="Adicionar emoji"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

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

      <FloatingEmojisSection
        emojis={link.floatingEmojis ?? []}
        onUpdate={(emojis) => onUpdateLink({ floatingEmojis: emojis })}
      />

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
