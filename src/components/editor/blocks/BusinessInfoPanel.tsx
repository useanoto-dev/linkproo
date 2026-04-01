import { memo, useState, useRef, useCallback, useEffect } from "react";
import { SmartLink, TextBgBox } from "@/types/smart-link";
import { PUBLISHED_DOMAIN } from "@/hooks/use-links";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
        className="w-full flex items-center justify-between px-3 py-1.5 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-primary shrink-0" />
          <span className="text-[10px] font-semibold text-foreground">{label}</span>
        </div>
        {open ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-2.5 space-y-2">{children}</div>}
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
      <span className="text-[9px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="relative w-6 h-6 rounded border border-border overflow-hidden shrink-0 cursor-pointer">
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
          className="text-[9px] h-6 flex-1 font-mono"
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
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">{label}</span>
        <span className="text-[9px] font-mono tabular-nums text-foreground">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 accent-primary cursor-pointer"
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground font-medium">Ativar borda de fundo</span>
        <Switch
          checked={box.enabled}
          onCheckedChange={(v) => onChange({ ...box, enabled: v })}
        />
      </div>

      {box.enabled && (
        <div className="space-y-2">
          {/* Preview */}
          <div
            className="flex items-center justify-center rounded h-8 overflow-hidden"
            style={{ background: '#1a1a2e' }}
          >
            <span
              className="text-xs font-bold"
              style={{
                display: 'inline-block',
                background: hexToRgba(box.bgColor, box.bgOpacity),
                border: `${box.borderWidth}px solid ${hexToRgba(box.borderColor, box.borderOpacity)}`,
                borderRadius: `${box.borderRadius}px`,
                padding: `${Math.min(box.padding, 12)}px`,
                color: '#fff',
                fontSize: 11,
              }}
            >
              Pré-visualização
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
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

          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <SliderRow
              label="Opac. fundo"
              value={box.bgOpacity}
              min={0} max={100} step={5} unit="%"
              onChange={(v) => onChange({ ...box, bgOpacity: v })}
            />
            <SliderRow
              label="Opac. borda"
              value={box.borderOpacity}
              min={0} max={100} step={5} unit="%"
              onChange={(v) => onChange({ ...box, borderOpacity: v })}
            />
            <SliderRow
              label="Espessura"
              value={box.borderWidth}
              min={0} max={16} step={1} unit="px"
              onChange={(v) => onChange({ ...box, borderWidth: v })}
            />
            <SliderRow
              label="Radius"
              value={box.borderRadius}
              min={0} max={40} step={2} unit="px"
              onChange={(v) => onChange({ ...box, borderRadius: v })}
            />
          </div>
          <SliderRow
            label="Espaçamento interno"
            value={box.padding}
            min={4} max={40} step={2} unit="px"
            onChange={(v) => onChange({ ...box, padding: v })}
          />
        </div>
      )}
    </div>
  );
}

// ─── Text Effects selector + intensity ────────────────────────────────────────

function TextEffectsSection({
  currentEffect,
  intensity,
  onChange,
  onIntensityChange,
}: {
  currentEffect: string | undefined;
  intensity: number;
  onChange: (key: string | undefined) => void;
  onIntensityChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] text-muted-foreground">Clique para aplicar. Efeito direto nas letras.</p>
      <div className="grid grid-cols-2 gap-1">
        {/* None option */}
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`h-8 rounded border text-[10px] font-bold cursor-pointer transition-all ${
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
              className={`h-8 rounded border cursor-pointer transition-all overflow-hidden relative ${
                active ? "border-primary ring-1 ring-primary" : "border-border/40 hover:border-border/70"
              }`}
              style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)" }}
            >
              <span
                className={`text-[10px] font-bold${effect.animClass ? ` ${effect.animClass}` : ''}`}
                style={effect.style}
              >
                {effect.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Intensity slider — only when an effect is active */}
      {currentEffect && (
        <SliderRow
          label="Intensidade"
          value={intensity}
          min={10} max={100} step={5} unit="%"
          onChange={onIntensityChange}
        />
      )}
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
    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Informações do Negócio</h3>

      {/* ── Nome do negócio ─────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] text-muted-foreground">Nome do Negócio</Label>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground">HTML</span>
            <Switch
              id="businessNameHtml"
              checked={!!link.businessNameHtml}
              onCheckedChange={(checked) => onUpdateLink({ businessNameHtml: checked, businessNameFontSize: checked ? 100 : 24 })}
            />
          </div>
        </div>
        {link.businessNameHtml ? (
          <Textarea
            value={link.businessName}
            onChange={(e) => onUpdateLink({ businessName: e.target.value })}
            placeholder="Ex: Pizzaria <b>Oliveira</b>"
            className="text-xs min-h-[60px] font-mono"
          />
        ) : (
          <Input
            value={link.businessName}
            onChange={(e) => onUpdateLink({ businessName: e.target.value })}
            placeholder="Ex: Pizzaria Oliveira"
            className="text-xs h-7"
          />
        )}
        {link.businessNameHtml && (
          <p className="text-[9px] text-muted-foreground">
            Cole HTML completo com <code>&lt;style&gt;</code>, fontes, animações.
          </p>
        )}
      </div>

      {/* Tamanho + Alinhamento em grid 2-col */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">
              {link.businessNameHtml ? "Escala" : "Tamanho"}
            </span>
            <span className="text-[9px] font-mono tabular-nums text-foreground">
              {link.businessNameFontSize ?? (link.businessNameHtml ? 100 : 24)}{link.businessNameHtml ? "%" : "px"}
            </span>
          </div>
          <input
            type="range"
            min={link.businessNameHtml ? 30 : 12}
            max={link.businessNameHtml ? 200 : 56}
            step={link.businessNameHtml ? 5 : 1}
            value={link.businessNameFontSize ?? (link.businessNameHtml ? 100 : 24)}
            onChange={(e) => onUpdateLink({ businessNameFontSize: Number(e.target.value) })}
            className="w-full h-1 accent-primary cursor-pointer"
          />
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground block">Alinhamento</span>
          <div className="flex gap-0.5">
            {BUSINESS_NAME_ALIGN_OPTIONS.map(({ value, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdateLink({ businessNameAlign: value })}
                className={`flex-1 h-7 rounded border flex items-center justify-center transition-all cursor-pointer ${
                  (link.businessNameAlign ?? "center") === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Largura do nome */}
      <SliderRow
        label="Largura do nome"
        value={link.businessNameWidth ?? 100}
        min={30} max={100} step={5} unit="%"
        onChange={(v) => onUpdateLink({ businessNameWidth: v })}
      />

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
          intensity={link.businessNameEffectIntensity ?? 100}
          onChange={(k) => onUpdateLink({ businessNameEffect: k })}
          onIntensityChange={(v) => onUpdateLink({ businessNameEffectIntensity: v })}
        />
      </Collapsible>

      {/* ── Slogan / Tagline ─────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted-foreground">Slogan / Tagline</Label>
        <Input
          value={link.tagline}
          onChange={(e) => onUpdateLink({ tagline: e.target.value })}
          placeholder="Ex: Construindo Sonhos"
          className="text-xs h-7"
        />
      </div>

      {/* Tamanho do slogan + Largura em grid */}
      <div className="grid grid-cols-2 gap-x-3">
        <SliderRow
          label="Tamanho"
          value={link.taglineFontSize ?? 13}
          min={10} max={28} step={1} unit="px"
          onChange={(v) => onUpdateLink({ taglineFontSize: v })}
        />
        <SliderRow
          label="Largura"
          value={link.taglineWidth ?? 100}
          min={30} max={100} step={5} unit="%"
          onChange={(v) => onUpdateLink({ taglineWidth: v })}
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
          intensity={link.taglineEffectIntensity ?? 100}
          onChange={(k) => onUpdateLink({ taglineEffect: k })}
          onIntensityChange={(v) => onUpdateLink({ taglineEffectIntensity: v })}
        />
      </Collapsible>

      {/* ── Slug ────────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Endereço da página</Label>
        <div className="flex items-center gap-0 rounded border border-border overflow-hidden bg-background">
          <span className="px-2 py-1.5 text-[9px] text-muted-foreground bg-secondary border-r border-border whitespace-nowrap">
            {PUBLISHED_DOMAIN}/l/
          </span>
          <input
            value={link.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="meu-negocio"
            className="flex-1 h-7 px-2 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-mono"
          />
        </div>
        {slugChecking && <span className="text-[9px] text-muted-foreground">Verificando...</span>}
        {!slugChecking && slugAvailable === true && <span className="text-[9px] text-green-400">✓ Disponível</span>}
        {!slugChecking && slugAvailable === false && <span className="text-[9px] text-destructive">✗ Já está em uso</span>}
      </div>
    </div>
  );
});
