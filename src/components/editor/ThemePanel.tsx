import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { SmartLink, HeroObjectFit } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, Sparkles, Type, Crosshair, RotateCcw, Image, Layers, Eye } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ThemePanelProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

const bgPresets = [
  { label: "Neve", value: "from-gray-50 to-white", from: "#f9fafb", to: "#ffffff" },
  { label: "Creme", value: "from-orange-50 to-amber-50", from: "#fff7ed", to: "#fffbeb" },
  { label: "Céu", value: "from-blue-50 to-sky-100", from: "#eff6ff", to: "#e0f2fe" },
  { label: "Menta", value: "from-green-50 to-emerald-50", from: "#f0fdf4", to: "#ecfdf5" },
  { label: "Rosa", value: "from-pink-50 to-rose-100", from: "#fdf2f8", to: "#ffe4e6" },
  { label: "Lavanda", value: "from-violet-50 to-purple-100", from: "#f5f3ff", to: "#ede9fe" },
  { label: "Escuro", value: "from-slate-950 to-slate-900", from: "#020617", to: "#0f172a" },
  { label: "Índigo", value: "from-blue-950 to-indigo-950", from: "#172554", to: "#1e1b4b" },
  { label: "Floresta", value: "from-green-950 to-emerald-950", from: "#052e16", to: "#022c22" },
  { label: "Vinho", value: "from-rose-950 to-red-950", from: "#4c0519", to: "#450a0a" },
  { label: "Roxo", value: "from-purple-950 to-indigo-950", from: "#3b0764", to: "#1e1b4b" },
  { label: "Brasa", value: "from-red-950 to-orange-950", from: "#450a0a", to: "#431407" },
];

const fontOptions = [
  "Inter", "Poppins", "Space Grotesk", "Montserrat", "Raleway",
  "DM Sans", "Outfit", "Sora", "Rubik", "Nunito",
];

function loadGoogleFont(font: string) {
  const id = `gf-${font.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, "+")}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

// ─── Focal Point Picker ────────────────────────────────────────────────────

interface FocalPointPickerProps {
  imageUrl: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}

const FocalPointPicker = React.memo(function FocalPointPicker({ imageUrl, x, y, onChange }: FocalPointPickerProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const ny = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange(Math.max(0, Math.min(100, nx)), Math.max(0, Math.min(100, ny)));
  }, [onChange]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden cursor-crosshair border border-border/40"
      style={{ height: 80 }}
      onClick={handleClick}
    >
      <img
        src={imageUrl} alt=""
        className="w-full h-full"
        style={{ objectFit: 'cover', objectPosition: `${x}% ${y}%`, pointerEvents: 'none' }}
        draggable={false}
      />
      <div className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
        <div className="absolute inset-0 rounded-full border-2 border-white shadow-md bg-primary/40" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/70 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/70 -translate-x-1/2" />
      </div>
    </div>
  );
});

// ─── Section Header ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{label}</span>
    </div>
  );
}

// ─── Slider Row ────────────────────────────────────────────────────────────

function SliderRow({
  label, value, min, max, step, unit = "", onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-mono tabular-nums text-foreground">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-primary cursor-pointer"
      />
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────

function ColorPicker({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
          <input
            type="color" value={value || "#888888"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
          />
          <div className="w-full h-full rounded-lg" style={{ backgroundColor: value || "#888888" }} />
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

const COMMON_EMOJIS = ["🔥", "⭐", "❤️", "🎉", "✨", "🍕", "💰", "🎯", "💎", "🚀", "👑", "🌟", "💪", "🎁", "📱", "🛒", "💬", "📍", "🏆", "💥"];

const HERO_FIT_OPTIONS = [
  { value: 'cover' as HeroObjectFit, label: 'Preencher' },
  { value: 'contain' as HeroObjectFit, label: 'Conter' },
  { value: 'fill' as HeroObjectFit, label: 'Esticar' },
] as const;

const LOGO_SHAPE_OPTIONS = [
  { value: 'square' as const, label: 'Quadrado', style: { borderRadius: 0 } },
  { value: 'rounded' as const, label: 'Arredond.', style: { borderRadius: 8 } },
  { value: 'circle' as const, label: 'Círculo', style: { borderRadius: '50%' } },
];

// ─── Main Component ────────────────────────────────────────────────────────

export const ThemePanel = memo(function ThemePanel({ link, onUpdateLink }: ThemePanelProps) {
  const [customBg, setCustomBg] = useState({ from: "#1a1a2e", to: "#16213e", isGradient: false });
  const [emojiSearch, setEmojiSearch] = useState("");

  useEffect(() => {
    if (!link.backgroundColor.startsWith("custom:")) return;
    const parts = link.backgroundColor.split(":");
    const from = parts[1] ?? "#1a1a2e";
    const to = parts[2] ?? "#16213e";
    setCustomBg({ from, to, isGradient: from !== to });
  }, [link.backgroundColor]);

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

  const logoShape = link.logoShape ?? 'rounded';
  const logoRadius = logoShape === 'circle' ? '50%' : logoShape === 'square' ? '0' : '8px';

  return (
    <div className="space-y-6">

      {/* ── BANNER ─────────────────────────────────────────────────────────── */}
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
              label="Altura" value={link.heroImageHeightPx ?? 192} min={80} max={500} step={4} unit="px"
              onChange={(v) => throttled({ heroImageHeightPx: v })}
            />

            {/* Image fit */}
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Ajuste da imagem</span>
              <div className="grid grid-cols-3 gap-1.5">
                {HERO_FIT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateLink({ heroObjectFit: opt.value })}
                    className={`py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                      (link.heroObjectFit ?? 'cover') === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border'
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
                  <span className="text-[11px] text-muted-foreground">Ponto focal</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                  {link.heroFocalPoint?.x ?? 50}% {link.heroFocalPoint?.y ?? 50}%
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
              label="Opacidade da imagem" value={link.heroImageOpacity ?? 100} min={10} max={100} step={5} unit="%"
              onChange={(v) => throttled({ heroImageOpacity: v })}
            />

            <SliderRow
              label="Overlay escuro" value={link.heroOverlayOpacity ?? 0} min={0} max={80} step={5} unit="%"
              onChange={(v) => throttled({ heroOverlayOpacity: v })}
            />

            {/* Banner curve — available for any header style */}
            <div className="pt-1 border-t border-border/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Curva no banner</span>
                <Switch
                  checked={link.bannerCurve ?? false}
                  onCheckedChange={(v) => onUpdateLink({ bannerCurve: v })}
                />
              </div>
              {link.bannerCurve && (
                <SliderRow
                  label="Intensidade da curva"
                  value={link.bannerCurveIntensity ?? 50}
                  min={5} max={100} step={5} unit="%"
                  onChange={(v) => throttled({ bannerCurveIntensity: v })}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── LOGO & HEADER ──────────────────────────────────────────────────── */}
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
              label="Tamanho" value={link.logoSizePx ?? 80} min={32} max={200} step={4} unit="px"
              onChange={(v) => throttled({ logoSizePx: v })}
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
                        active ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {/* Visual preview of shape */}
                      <div
                        className={`w-5 h-5 ${active ? 'bg-primary' : 'bg-muted-foreground/40'}`}
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
              <Switch checked={link.logoShadow ?? true} onCheckedChange={(v) => onUpdateLink({ logoShadow: v })} />
            </div>

            {/* Header style */}
            {link.heroImage && (
              <div className="space-y-1.5 pt-1 border-t border-border/30">
                <span className="text-[11px] text-muted-foreground">Estilo do cabeçalho</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['classic', 'bio'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdateLink({ headerStyle: style })}
                      className={`py-2 px-3 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        (link.headerStyle ?? 'classic') === style
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {style === 'classic' ? '🖼 Clássico' : '👤 Bio'}
                    </button>
                  ))}
                </div>

                {/* Bio-specific: avatar border color */}
                {link.headerStyle === 'bio' && (
                  <ColorPicker
                    label="Cor da borda do avatar"
                    value={link.logoBorderColor ?? '#ffffff'}
                    onChange={(v) => onUpdateLink({ logoBorderColor: v })}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── TIPOGRAFIA ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader icon={Type} label="Tipografia" />

        <div className="grid grid-cols-2 gap-1.5">
          {fontOptions.map((font) => (
            <button
              key={font}
              onMouseEnter={() => loadGoogleFont(font)}
              onClick={() => { loadGoogleFont(font); onUpdateLink({ fontFamily: font }); }}
              className={`py-2.5 px-3 rounded-lg border text-left text-[12px] transition-all truncate ${
                link.fontFamily === font
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border/50 bg-secondary/30 text-foreground hover:border-border hover:bg-secondary/60"
              }`}
              style={{ fontFamily: `'${font}', sans-serif` }}
            >
              {font}
            </button>
          ))}
        </div>
      </section>

      {/* ── VISIBILIDADE ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader icon={Eye} label="Visibilidade" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Mostrar nome do negócio</span>
            <Switch checked={!(link.hideBusinessName ?? false)} onCheckedChange={(v) => onUpdateLink({ hideBusinessName: !v })} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Mostrar slogan / bio</span>
            <Switch checked={!(link.hideTagline ?? false)} onCheckedChange={(v) => onUpdateLink({ hideTagline: !v })} />
          </div>
        </div>
      </section>

      {/* ── CORES ────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader icon={Palette} label="Cores" />

        {/* Background presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-muted-foreground">Fundo predefinido</span>
          <div className="grid grid-cols-4 gap-1.5">
            {bgPresets.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdateLink({ backgroundColor: opt.value })}
                title={opt.label}
                className={`h-9 rounded-lg bg-gradient-to-br ${opt.value} border-2 transition-all duration-200 hover:scale-105 relative ${
                  link.backgroundColor === opt.value
                    ? "border-primary ring-1 ring-primary/30 scale-105 shadow-md"
                    : "border-transparent hover:border-border/50"
                }`}
              >
                {link.backgroundColor === opt.value && (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom color */}
        <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground">Cor personalizada</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Degradê</span>
              <Switch checked={customBg.isGradient} onCheckedChange={(v) => setCustomBg(s => ({ ...s, isGradient: v }))} />
            </div>
          </div>

          {!customBg.isGradient ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
                  <input
                    type="color" value={customBg.from}
                    onChange={(e) => setCustomBg(s => ({ ...s, from: e.target.value, to: e.target.value }))}
                    className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
                  />
                  <div className="w-full h-full rounded-lg" style={{ backgroundColor: customBg.from }} />
                </div>
                <Input
                  value={customBg.from}
                  onChange={(e) => setCustomBg(s => ({ ...s, from: e.target.value, to: e.target.value }))}
                  placeholder="#1a1a2e" className="text-xs h-9 font-mono"
                />
              </div>
              <button
                onClick={() => onUpdateLink({ backgroundColor: `custom:${customBg.from}:${customBg.from}` })}
                className="w-full h-8 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                Aplicar Cor
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className="h-8 rounded-lg border border-border/50"
                style={{ background: `linear-gradient(135deg, ${customBg.from}, ${customBg.to})` }}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground font-medium">Cor inicial</span>
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden shrink-0 cursor-pointer">
                      <input type="color" value={customBg.from} onChange={(e) => setCustomBg(s => ({ ...s, from: e.target.value }))}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                      <div className="w-full h-full" style={{ backgroundColor: customBg.from }} />
                    </div>
                    <Input value={customBg.from} onChange={(e) => setCustomBg(s => ({ ...s, from: e.target.value }))} className="text-[10px] h-7 font-mono px-1.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted-foreground font-medium">Cor final</span>
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden shrink-0 cursor-pointer">
                      <input type="color" value={customBg.to} onChange={(e) => setCustomBg(s => ({ ...s, to: e.target.value }))}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                      <div className="w-full h-full" style={{ backgroundColor: customBg.to }} />
                    </div>
                    <Input value={customBg.to} onChange={(e) => setCustomBg(s => ({ ...s, to: e.target.value }))} className="text-[10px] h-7 font-mono px-1.5" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => onUpdateLink({ backgroundColor: `custom:${customBg.from}:${customBg.to}` })}
                className="w-full h-8 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                Aplicar Degradê
              </button>
            </div>
          )}
        </div>

        {/* Text & accent colors — vertical layout */}
        <div className="space-y-3 p-3 rounded-xl bg-secondary/20 border border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cores do texto</span>

          {/* Accent */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">Cor de destaque</Label>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
                <input type="color" value={link.accentColor} onChange={(e) => onUpdateLink({ accentColor: e.target.value })}
                  className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                <div className="w-full h-full rounded-lg" style={{ backgroundColor: link.accentColor }} />
              </div>
              <Input value={link.accentColor} onChange={(e) => onUpdateLink({ accentColor: e.target.value })} placeholder="#f59e0b" className="text-xs h-8 flex-1 font-mono" />
            </div>
            <p className="text-[9px] text-muted-foreground">CTAs, botões e detalhes visuais</p>
          </div>

          {/* Title color */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">Cor do título</Label>
              {link.titleColor && (
                <button onClick={() => onUpdateLink({ titleColor: undefined })} className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-2.5 w-2.5" /> usar destaque
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
                <input type="color" value={link.titleColor || link.accentColor} onChange={(e) => onUpdateLink({ titleColor: e.target.value })}
                  className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                <div className="w-full h-full rounded-lg" style={{ backgroundColor: link.titleColor || link.accentColor }} />
              </div>
              <Input value={link.titleColor || ""} onChange={(e) => onUpdateLink({ titleColor: e.target.value || undefined })} placeholder={`destaque (${link.accentColor})`} className="text-xs h-8 flex-1 font-mono" />
            </div>
          </div>

          {/* Tagline color */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">Cor do slogan</Label>
              {link.taglineColor && (
                <button onClick={() => onUpdateLink({ taglineColor: undefined })} className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-2.5 w-2.5" /> automático
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
                <input type="color" value={link.taglineColor || "#888888"} onChange={(e) => onUpdateLink({ taglineColor: e.target.value })}
                  className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                <div className="w-full h-full rounded-lg" style={{ backgroundColor: link.taglineColor || "#888888" }} />
              </div>
              <Input value={link.taglineColor || ""} onChange={(e) => onUpdateLink({ taglineColor: e.target.value || undefined })} placeholder="automático" className="text-xs h-8 flex-1 font-mono" />
            </div>
          </div>
        </div>
      </section>

      {/* ── EMOJIS FLUTUANTES ────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader icon={Sparkles} label="Emojis Flutuantes" />
        <div className="flex flex-wrap gap-1.5 items-center">
          {link.floatingEmojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onUpdateLink({ floatingEmojis: link.floatingEmojis.filter((_, idx) => idx !== i) })}
              className="h-9 w-9 rounded-lg bg-secondary/60 border border-border/50 flex items-center justify-center text-lg hover:bg-destructive/20 hover:border-destructive/30 transition-colors group relative"
              title="Clique para remover"
            >
              {emoji}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive text-[8px] text-white items-center justify-center hidden group-hover:flex">✕</span>
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors text-lg" title="Adicionar emoji">
                +
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3" side="top" align="start">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold">Escolha um emoji</p>
                <div className="grid grid-cols-5 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button key={emoji} onClick={() => onUpdateLink({ floatingEmojis: [...link.floatingEmojis, emoji] })}
                      className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-xl transition-colors hover:scale-110">
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="pt-1 border-t border-border/50">
                  <Input
                    placeholder="Cole um emoji aqui..."
                    value={emojiSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      const emojis = [...val].filter(c => /\p{Emoji}/u.test(c) && !/\d/.test(c));
                      if (emojis.length > 0) {
                        onUpdateLink({ floatingEmojis: [...link.floatingEmojis, ...emojis] });
                        setEmojiSearch("");
                      } else {
                        setEmojiSearch(val);
                      }
                    }}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-[9px] text-muted-foreground">Clique no emoji para remover.</p>
      </section>

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
