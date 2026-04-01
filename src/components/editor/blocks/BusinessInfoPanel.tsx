import { memo, useState, useRef, useCallback, useEffect } from "react";
import { SmartLink, TextBgBox } from "@/types/smart-link";
import { PUBLISHED_DOMAIN } from "@/hooks/use-links";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronRight, Sparkles, Square } from "lucide-react";
import { BUSINESS_NAME_ALIGN_OPTIONS } from "./constants";
import { checkSlugAvailability, normalizeSlug } from "@/lib/slug-utils";
import { TEXT_EFFECTS } from "@/lib/text-effects-registry";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${(alpha / 100).toFixed(2)})`;
}

const DEFAULT_BG_BOX: TextBgBox = {
  enabled: false,
  borderWidth: 1,
  borderColor: "#ffffff",
  borderOpacity: 40,
  borderRadius: 12,
  padding: 12,
  bgColor: "#000000",
  bgOpacity: 20,
};

// ─── Collapsible wrapper ──────────────────────────────────────────────────────

function Collapsible({
  label,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-[11px] font-semibold text-foreground">{label}</span>
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Inline color + hex input ─────────────────────────────────────────────────

function InlineColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative w-7 h-7 rounded border border-border overflow-hidden shrink-0 cursor-pointer">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0"
          />
          <div className="w-full h-full" style={{ backgroundColor: value || "#000000" }} />
        </div>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="text-[10px] h-7 flex-1 font-mono"
        />
      </div>
    </div>
  );
}

function SliderRow({
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
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono tabular-nums text-foreground">{value}{unit}</span>
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

// ─── Borda de Fundo (background box config) ───────────────────────────────────

function BgBoxSection({
  value,
  onChange,
}: {
  value: TextBgBox | undefined;
  onChange: (v: TextBgBox) => void;
}) {
  const box = value ?? DEFAULT_BG_BOX;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-medium">Ativar borda de fundo</span>
        <Switch
          checked={box.enabled}
          onCheckedChange={(v) => onChange({ ...box, enabled: v })}
        />
      </div>

      {box.enabled && (
        <div className="space-y-2.5">
          {/* Preview */}
          <div
            className="flex items-center justify-center rounded-lg h-10 overflow-hidden"
            style={{ background: '#1a1a2e' }}
          >
            <span
              className="text-sm font-bold"
              style={{
                display: 'inline-block',
                background: hexToRgba(box.bgColor, box.bgOpacity),
                border: `${box.borderWidth}px solid ${hexToRgba(box.borderColor, box.borderOpacity)}`,
                borderRadius: `${box.borderRadius}px`,
                padding: `${Math.min(box.padding, 16)}px`,
                color: '#fff',
                fontSize: 13,
              }}
            >
              Pré-visualização
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <InlineColorPicker
              label="Cor do fundo"
              value={box.bgColor}
              onChange={(v) => onChange({ ...box, bgColor: v })}
            />
            <InlineColorPicker
              label="Cor da borda"
              value={box.borderColor}
              onChange={(v) => onChange({ ...box, borderColor: v })}
            />
          </div>

          <SliderRow
            label="Opacidade do fundo"
            value={box.bgOpacity}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => onChange({ ...box, bgOpacity: v })}
          />
          <SliderRow
            label="Opacidade da borda"
            value={box.borderOpacity}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => onChange({ ...box, borderOpacity: v })}
          />
          <SliderRow
            label="Espessura da borda"
            value={box.borderWidth}
            min={0}
            max={16}
            step={1}
            unit="px"
            onChange={(v) => onChange({ ...box, borderWidth: v })}
          />
          <SliderRow
            label="Border radius"
            value={box.borderRadius}
            min={0}
            max={40}
            step={2}
            unit="px"
            onChange={(v) => onChange({ ...box, borderRadius: v })}
          />
          <SliderRow
            label="Espaçamento interno"
            value={box.padding}
            min={4}
            max={40}
            step={2}
            unit="px"
            onChange={(v) => onChange({ ...box, padding: v })}
          />
        </div>
      )}
    </div>
  );
}

// ─── Text Effects selector ────────────────────────────────────────────────────

function TextEffectsSection({
  currentEffect,
  onChange,
}: {
  currentEffect: string | undefined;
  onChange: (key: string | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] text-muted-foreground">Clique para aplicar. Efeito aplicado diretamente nas letras.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {/* None option */}
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`h-10 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
            !currentEffect
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"
          }`}
        >
          Nenhum
        </button>

        {TEXT_EFFECTS.map((effect) => {
          const active = currentEffect === effect.key;
          return (
            <button
              key={effect.key}
              type="button"
              onClick={() => onChange(active ? undefined : effect.key)}
              title={effect.description}
              className={`h-10 rounded-lg border cursor-pointer transition-all overflow-hidden relative ${
                active ? "border-primary ring-1 ring-primary" : "border-border/40 hover:border-border/70"
              }`}
              style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)" }}
            >
              <span
                className={`text-xs font-bold${effect.animClass ? ` ${effect.animClass}` : ''}`}
                style={effect.style}
              >
                {effect.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface BusinessInfoPanelProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

export const BusinessInfoPanel = memo(function BusinessInfoPanel({ link, onUpdateLink }: BusinessInfoPanelProps) {
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    };
  }, []);

  const handleSlugChange = useCallback((newSlug: string) => {
    const normalized = normalizeSlug(newSlug);
    onUpdateLink({ slug: normalized });
    setSlugAvailable(null);

    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    if (!normalized || normalized.length < 2) return;

    slugDebounceRef.current = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const available = await checkSlugAvailability(normalized, link.id.startsWith("new-") ? undefined : link.id);
        setSlugAvailable(available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
  }, [link.id, onUpdateLink]);

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informações do Negócio</h3>

      {/* ── Nome do negócio ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Nome do Negócio</Label>
        {link.businessNameHtml ? (
          <Textarea
            value={link.businessName}
            onChange={(e) => onUpdateLink({ businessName: e.target.value })}
            placeholder="Ex: Pizzaria <b>Oliveira</b>"
            className="text-sm min-h-[72px] font-mono"
          />
        ) : (
          <Input
            value={link.businessName}
            onChange={(e) => onUpdateLink({ businessName: e.target.value })}
            placeholder="Ex: Pizzaria Oliveira"
            className="text-sm h-9"
          />
        )}
        <div className="flex items-center gap-2">
          <Switch
            id="businessNameHtml"
            checked={!!link.businessNameHtml}
            onCheckedChange={(checked) => onUpdateLink({ businessNameHtml: checked, businessNameFontSize: checked ? 100 : 24 })}
          />
          <Label htmlFor="businessNameHtml" className="text-xs text-muted-foreground cursor-pointer">Usar HTML completo</Label>
        </div>
      </div>

      {/* Title font size */}
      {link.businessNameHtml ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Escala do HTML</Label>
            <span className="text-[11px] font-mono text-foreground tabular-nums">{link.businessNameFontSize ?? 100}%</span>
          </div>
          <Slider
            value={[link.businessNameFontSize ?? 100]}
            onValueChange={([v]) => onUpdateLink({ businessNameFontSize: v })}
            min={30} max={200} step={5}
          />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Cole um documento HTML completo (com <code>&lt;style&gt;</code>, fontes, animações).
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Tamanho do título</Label>
            <span className="text-[11px] font-mono text-foreground tabular-nums">{link.businessNameFontSize ?? 24}px</span>
          </div>
          <Slider
            value={[link.businessNameFontSize ?? 24]}
            onValueChange={([v]) => onUpdateLink({ businessNameFontSize: v })}
            min={12} max={56} step={1}
          />
        </div>
      )}

      {/* Alignment */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Alinhamento</Label>
        <div className="flex gap-1">
          {BUSINESS_NAME_ALIGN_OPTIONS.map(({ value, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdateLink({ businessNameAlign: value })}
              className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                (link.businessNameAlign ?? "center") === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Largura do nome */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] text-muted-foreground">Largura do nome</Label>
          <span className="text-[11px] font-mono text-foreground tabular-nums">{link.businessNameWidth ?? 100}%</span>
        </div>
        <Slider
          value={[link.businessNameWidth ?? 100]}
          onValueChange={([v]) => onUpdateLink({ businessNameWidth: v })}
          min={30} max={100} step={5}
        />
      </div>

      {/* Borda de Fundo — Nome */}
      <Collapsible label="Borda de Fundo — Nome" icon={Square}>
        <BgBoxSection
          value={link.businessNameBgBox}
          onChange={(v) => onUpdateLink({ businessNameBgBox: v })}
        />
      </Collapsible>

      {/* Efeitos de Texto — Nome */}
      <Collapsible label="Efeitos — Nome" icon={Sparkles}>
        <TextEffectsSection
          currentEffect={link.businessNameEffect}
          onChange={(k) => onUpdateLink({ businessNameEffect: k })}
        />
      </Collapsible>

      {/* ── Slogan / Tagline ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Slogan / Tagline</Label>
        <Input
          value={link.tagline}
          onChange={(e) => onUpdateLink({ tagline: e.target.value })}
          placeholder="Ex: Construindo Sonhos"
          className="text-sm h-9"
        />
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Tamanho do slogan</Label>
            <span className="text-[11px] font-mono text-foreground tabular-nums">{link.taglineFontSize ?? 13}px</span>
          </div>
          <Slider
            value={[link.taglineFontSize ?? 13]}
            onValueChange={([v]) => onUpdateLink({ taglineFontSize: v })}
            min={10} max={28} step={1}
          />
        </div>
      </div>

      {/* Largura do slogan */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] text-muted-foreground">Largura do slogan</Label>
          <span className="text-[11px] font-mono text-foreground tabular-nums">{link.taglineWidth ?? 100}%</span>
        </div>
        <Slider
          value={[link.taglineWidth ?? 100]}
          onValueChange={([v]) => onUpdateLink({ taglineWidth: v })}
          min={30} max={100} step={5}
        />
      </div>

      {/* Borda de Fundo — Slogan */}
      <Collapsible label="Borda de Fundo — Slogan" icon={Square}>
        <BgBoxSection
          value={link.taglineBgBox}
          onChange={(v) => onUpdateLink({ taglineBgBox: v })}
        />
      </Collapsible>

      {/* Efeitos de Texto — Slogan */}
      <Collapsible label="Efeitos — Slogan" icon={Sparkles}>
        <TextEffectsSection
          currentEffect={link.taglineEffect}
          onChange={(k) => onUpdateLink({ taglineEffect: k })}
        />
      </Collapsible>

      {/* ── Slug ────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Endereço da sua página</Label>
        <div className="flex items-center gap-0 rounded-md border border-border overflow-hidden bg-background">
          <span className="px-2.5 py-2 text-xs text-muted-foreground bg-secondary border-r border-border whitespace-nowrap">
            {PUBLISHED_DOMAIN}/l/
          </span>
          <input
            value={link.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="meu-negocio"
            className="flex-1 h-9 px-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-mono"
          />
        </div>
        {slugChecking && <span className="text-[10px] text-muted-foreground">Verificando...</span>}
        {!slugChecking && slugAvailable === true && <span className="text-[10px] text-green-400">✓ Disponível</span>}
        {!slugChecking && slugAvailable === false && <span className="text-[10px] text-destructive">✗ Já está em uso</span>}
        <p className="text-[10px] text-muted-foreground">Este é o link que você compartilha com seus clientes</p>
      </div>
    </div>
  );
});
