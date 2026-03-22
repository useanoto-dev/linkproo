import { SmartLink, HeroObjectFit } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, Sparkles, Type, Crosshair } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ImageUploader } from "./ImageUploader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ThemePanelProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

const bgPresets = [
  { label: "Branco Neve", value: "from-gray-50 to-white" },
  { label: "Creme", value: "from-orange-50 to-amber-50" },
  { label: "Azul Céu", value: "from-blue-50 to-sky-100" },
  { label: "Verde Menta", value: "from-green-50 to-emerald-50" },
  { label: "Rosa Suave", value: "from-pink-50 to-rose-100" },
  { label: "Lavanda", value: "from-violet-50 to-purple-100" },
  { label: "Escuro Elegante", value: "from-slate-950 to-slate-900" },
  { label: "Azul Profundo", value: "from-blue-950 to-indigo-950" },
  { label: "Verde Escuro", value: "from-green-950 to-emerald-950" },
  { label: "Vinho", value: "from-rose-950 to-red-950" },
  { label: "Roxo Noturno", value: "from-purple-950 to-indigo-950" },
  { label: "Vermelho", value: "from-red-950 to-orange-950" },
];

const fontOptions = [
  "Inter",
  "Poppins",
  "Space Grotesk",
  "Montserrat",
  "Raleway",
  "DM Sans",
  "Outfit",
  "Sora",
  "Rubik",
  "Nunito",
];

// Load Google Fonts dynamically
function loadGoogleFont(font: string) {
  const id = `gf-${font.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, "+")}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

// ─── Focal Point Picker ───────────────────────────────────────────────────────

interface FocalPointPickerProps {
  imageUrl: string;
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}

function FocalPointPicker({ imageUrl, x, y, onChange }: FocalPointPickerProps) {
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.round(((e.clientX - rect.left) / rect.width)  * 100);
    const ny = Math.round(((e.clientY - rect.top)  / rect.height) * 100);
    onChange(Math.max(0, Math.min(100, nx)), Math.max(0, Math.min(100, ny)));
  }, [onChange]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden cursor-crosshair border border-border/40"
      style={{ height: 96 }}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full"
        style={{ objectFit: 'cover', objectPosition: `${x}% ${y}%`, pointerEvents: 'none' }}
        draggable={false}
      />
      {/* Crosshair */}
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
}

// ─────────────────────────────────────────────────────────────────────────────

const COMMON_EMOJIS = ["🔥", "⭐", "❤️", "🎉", "✨", "🍕", "💰", "🎯", "💎", "🚀", "👑", "🌟", "💪", "🎁", "📱", "🛒", "💬", "📍", "🏆", "💥"];

export function ThemePanel({ link, onUpdateLink }: ThemePanelProps) {
  const [customBgColor, setCustomBgColor] = useState("#1a1a2e");
  const [isGradient, setIsGradient] = useState(false);
  const [gradFrom, setGradFrom] = useState("#1a1a2e");
  const [gradTo, setGradTo] = useState("#16213e");
  const [emojiSearch, setEmojiSearch] = useState("");
  const emojiPopoverRef = useRef<HTMLButtonElement>(null);

  // Sync custom color pickers with saved link.backgroundColor
  useEffect(() => {
    if (!link.backgroundColor.startsWith("custom:")) return;
    const parts = link.backgroundColor.split(":");
    // format: "custom:#color1:#color2"
    const from = parts[1] ?? "#1a1a2e";
    const to = parts[2] ?? "#16213e";
    const gradient = from !== to;
    setCustomBgColor(from);
    setGradFrom(from);
    setGradTo(to);
    setIsGradient(gradient);
  }, [link.backgroundColor]);

  // Preload all fonts
  useEffect(() => {
    fontOptions.forEach(loadGoogleFont);
  }, []);

  return (
    <div className="space-y-5">
      {/* Hero Image */}
      <div className="space-y-1">
        <ImageUploader
          value={link.heroImage}
          onChange={(url) => onUpdateLink({ heroImage: url })}
          aspectRatio={16 / 9}
          label="Imagem Banner / Hero"
        />
      </div>

      {/* Banner config — only when image is set */}
      {link.heroImage && (
        <div className="space-y-4 p-3 rounded-xl border border-border/50 bg-secondary/10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Configuração do Banner</p>

          {/* Height slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">Altura</Label>
              <span className="text-[11px] font-mono text-foreground tabular-nums">
                {link.heroImageHeightPx ?? 192}px
              </span>
            </div>
            <input
              type="range"
              min={80}
              max={500}
              step={4}
              value={link.heroImageHeightPx ?? 192}
              onChange={(e) => onUpdateLink({ heroImageHeightPx: Number(e.target.value) })}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>80px</span><span>500px</span>
            </div>
          </div>

          {/* Object-fit */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">Ajuste da imagem</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { value: 'cover'   as HeroObjectFit, label: 'Preencher', hint: 'Recorta para cobrir' },
                { value: 'contain' as HeroObjectFit, label: 'Conter',    hint: 'Mostra tudo' },
                { value: 'fill'    as HeroObjectFit, label: 'Esticar',   hint: 'Estica sem recorte' },
              ]).map((opt) => {
                const active = (link.heroObjectFit ?? 'cover') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateLink({ heroObjectFit: opt.value })}
                    title={opt.hint}
                    className={`flex flex-col items-center py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border'
                    }`}
                  >
                    <span className="font-semibold">{opt.label}</span>
                    <span className="opacity-60 text-[8px] text-center leading-tight mt-0.5">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focal point picker */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Crosshair className="h-3 w-3 text-primary" />
              <Label className="text-[11px] font-medium text-muted-foreground">Ponto Focal</Label>
              <span className="ml-auto text-[9px] font-mono text-muted-foreground tabular-nums">
                {link.heroFocalPoint?.x ?? 50}% {link.heroFocalPoint?.y ?? 50}%
              </span>
            </div>
            <FocalPointPicker
              imageUrl={link.heroImage}
              x={link.heroFocalPoint?.x ?? 50}
              y={link.heroFocalPoint?.y ?? 50}
              onChange={(x, y) => onUpdateLink({ heroFocalPoint: { x, y } })}
            />
            <p className="text-[9px] text-muted-foreground">Clique na imagem para definir o centro de foco ao recortar.</p>
          </div>

          {/* Image opacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">Opacidade da Imagem</Label>
              <span className="text-[11px] font-mono text-foreground tabular-nums">
                {link.heroImageOpacity ?? 100}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={link.heroImageOpacity ?? 100}
              onChange={(e) => onUpdateLink({ heroImageOpacity: Number(e.target.value) })}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>10%</span><span>100%</span>
            </div>
          </div>

          {/* Overlay opacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">Overlay sobre a imagem</Label>
              <span className="text-[11px] font-mono text-foreground tabular-nums">
                {link.heroOverlayOpacity ?? 0}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={link.heroOverlayOpacity ?? 0}
              onChange={(e) => onUpdateLink({ heroOverlayOpacity: Number(e.target.value) })}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>0%</span><span>80%</span>
            </div>
          </div>

          {/* Overlay color — only visible when overlay > 0 */}
          {(link.heroOverlayOpacity ?? 0) > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">Cor do Overlay</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { value: 'dark' as const,   label: 'Escuro',        preview: '#000000' as string | null },
                  { value: 'light' as const,  label: 'Claro',          preview: '#ffffff' as string | null },
                  { value: 'custom' as const, label: 'Personalizado',  preview: null },
                ]).map((opt) => {
                  const current = link.heroOverlayColor ?? 'dark';
                  const isCustom = opt.value === 'custom';
                  const active = isCustom
                    ? current !== 'dark' && current !== 'light'
                    : current === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (isCustom) onUpdateLink({ heroOverlayColor: '#ff0000' });
                        else onUpdateLink({ heroOverlayColor: opt.value });
                      }}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all gap-1 ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {opt.preview ? (
                        <span
                          className="w-4 h-4 rounded-full border border-border/40 inline-block"
                          style={{ backgroundColor: opt.preview }}
                        />
                      ) : (
                        <input
                          type="color"
                          className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                          value={active ? current : '#ff0000'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateLink({ heroOverlayColor: e.target.value })}
                        />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logo */}
      <ImageUploader
        value={link.logoUrl}
        onChange={(url) => onUpdateLink({ logoUrl: url })}
        label="Logo"
      />

      {/* Font Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Type className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-bold uppercase tracking-wider text-primary">Fonte</Label>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {fontOptions.map((font) => (
            <button
              key={font}
              onClick={() => {
                loadGoogleFont(font);
                onUpdateLink({ fontFamily: font });
              }}
              className={`text-[11px] py-2 px-2 rounded-lg border transition-all text-left truncate ${
                link.fontFamily === font
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border/50 bg-secondary/30 text-foreground hover:border-border hover:bg-secondary/60"
              }`}
              style={{ fontFamily: `'${font}', sans-serif` }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Background presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-bold uppercase tracking-wider text-primary">Cor de Fundo</Label>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {bgPresets.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateLink({ backgroundColor: opt.value })}
              className={`h-9 rounded-lg bg-gradient-to-br ${opt.value} border-2 transition-all duration-200 hover:scale-105 ${
                link.backgroundColor === opt.value
                  ? "border-primary ring-1 ring-primary/30 scale-105 shadow-md"
                  : "border-border/20 hover:border-border"
              }`}
              title={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Custom color - Canva style */}
      <div className="space-y-3">
        <Label className="text-[11px] font-medium text-muted-foreground">Cor Personalizada</Label>
        
        {/* Solid / Gradient toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border/50">
          <span className="text-[11px] font-medium text-foreground">Degradê</span>
          <Switch checked={isGradient} onCheckedChange={setIsGradient} />
        </div>

        {!isGradient ? (
          /* Solid color */
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customBgColor}
                onChange={(e) => setCustomBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl border-2 border-border cursor-pointer bg-transparent"
              />
              <div className="flex-1">
                <Input
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  placeholder="#1a1a2e"
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>
            <button
              onClick={() => onUpdateLink({ backgroundColor: `custom:${customBgColor}:${customBgColor}` })}
              className="w-full h-9 rounded-xl text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
            >
              Aplicar Cor
            </button>
          </div>
        ) : (
          /* Gradient */
          <div className="space-y-2">
            {/* Preview bar */}
            <div
              className="h-10 rounded-xl border border-border/50 shadow-inner"
              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            />
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-medium text-muted-foreground">Cor 1</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={gradFrom}
                    onChange={(e) => setGradFrom(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input value={gradFrom} onChange={(e) => setGradFrom(e.target.value)} className="text-[10px] h-7 font-mono px-1.5" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-medium text-muted-foreground">Cor 2</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={gradTo}
                    onChange={(e) => setGradTo(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input value={gradTo} onChange={(e) => setGradTo(e.target.value)} className="text-[10px] h-7 font-mono px-1.5" />
                </div>
              </div>
            </div>
            <button
              onClick={() => onUpdateLink({ backgroundColor: `custom:${gradFrom}:${gradTo}` })}
              className="w-full h-9 rounded-xl text-[11px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
            >
              Aplicar Degradê
            </button>
          </div>
        )}
      </div>

      {/* Floating emojis - Fixed with popover picker */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          <Label className="text-[11px] font-medium text-muted-foreground">Emojis Flutuantes</Label>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {link.floatingEmojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => {
                const updated = link.floatingEmojis.filter((_, idx) => idx !== i);
                onUpdateLink({ floatingEmojis: updated });
              }}
              className="h-9 w-9 rounded-lg bg-secondary/60 border border-border/50 flex items-center justify-center text-lg hover:bg-destructive/20 hover:border-destructive/30 transition-colors group relative"
              title="Clique para remover"
            >
              {emoji}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive text-[8px] text-white items-center justify-center hidden group-hover:flex">✕</span>
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button
                ref={emojiPopoverRef}
                className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors text-lg"
                title="Adicionar emoji"
              >
                +
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" side="top" align="start">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-foreground">Escolha um emoji</p>
                <div className="grid grid-cols-5 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onUpdateLink({ floatingEmojis: [...link.floatingEmojis, emoji] });
                      }}
                      className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-xl transition-colors hover:scale-110"
                    >
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
        <p className="text-[9px] text-muted-foreground">Clique no + para adicionar. Clique no emoji para remover.</p>
      </div>

      {/* Accent color */}
      <div className="space-y-2">
        <Label className="text-[11px] font-medium text-muted-foreground">Cor de Destaque</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={link.accentColor}
            onChange={(e) => onUpdateLink({ accentColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
          />
          <Input
            value={link.accentColor}
            onChange={(e) => onUpdateLink({ accentColor: e.target.value })}
            placeholder="#f59e0b"
            className="text-xs h-8 flex-1 font-mono"
          />
        </div>
        <p className="text-[9px] text-muted-foreground">Aplicada no nome do negócio, CTAs, separadores e detalhes visuais</p>
      </div>
    </div>
  );
}
