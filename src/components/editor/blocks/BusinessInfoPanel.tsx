import { memo, useState, useRef, useCallback, useEffect } from "react";
import { SmartLink } from "@/types/smart-link";
import { PUBLISHED_DOMAIN } from "@/hooks/use-links";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BUSINESS_NAME_ALIGN_OPTIONS } from "./constants";
import { checkSlugAvailability, normalizeSlug } from "@/lib/slug-utils";

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

      {/* Business name + HTML toggle */}
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
            min={12} max={48} step={1}
          />
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>12px</span><span>48px</span>
          </div>
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

      {/* Tagline + size */}
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
            min={10} max={24} step={1}
          />
        </div>
      </div>

      {/* Glass effect toggles */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Efeito Glass</Label>
        <div className="flex items-center gap-2">
          <Switch
            id="businessNameGlass"
            checked={!!link.businessNameGlass}
            onCheckedChange={(checked) => onUpdateLink({ businessNameGlass: checked })}
          />
          <Label htmlFor="businessNameGlass" className="text-xs text-muted-foreground cursor-pointer">Glass no nome</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="taglineGlass"
            checked={!!link.taglineGlass}
            onCheckedChange={(checked) => onUpdateLink({ taglineGlass: checked })}
          />
          <Label htmlFor="taglineGlass" className="text-xs text-muted-foreground cursor-pointer">Glass no slogan</Label>
        </div>
      </div>

      {/* Width controls */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Largura</Label>
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
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>30%</span><span>100%</span>
          </div>
        </div>
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
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>30%</span><span>100%</span>
          </div>
        </div>
      </div>

      {/* Slug */}
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
