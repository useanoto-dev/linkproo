import { memo, useState, useRef, useCallback, useEffect } from "react";
import { SmartLink } from "@/types/smart-link";
import { PUBLISHED_DOMAIN } from "@/hooks/use-links";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BUSINESS_NAME_SIZE_OPTIONS, BUSINESS_NAME_ALIGN_OPTIONS } from "./constants";
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
    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide text-muted-foreground">Informações do Negócio</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
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
          <div className="flex items-center gap-2 pt-1">
            <Switch
              id="businessNameHtml"
              checked={!!link.businessNameHtml}
              onCheckedChange={(checked) =>
                onUpdateLink({ businessNameHtml: checked, businessNameFontSize: checked ? 100 : 24 })
              }
            />
            <Label htmlFor="businessNameHtml" className="text-xs text-muted-foreground cursor-pointer">
              Usar HTML completo
            </Label>
          </div>

          {link.businessNameHtml ? (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Cole um documento HTML completo (com <code>&lt;style&gt;</code>, fontes, animações). O conteúdo roda em iframe isolado.
              </p>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Escala</Label>
                <span className="text-[11px] font-mono text-foreground tabular-nums">
                  {link.businessNameFontSize ?? 100}%
                </span>
              </div>
              <Slider
                value={[link.businessNameFontSize ?? 100]}
                onValueChange={([v]) => onUpdateLink({ businessNameFontSize: v })}
                min={30}
                max={200}
                step={5}
              />
            </div>
          ) : (
            <div>
              <Label className="text-xs text-muted-foreground">Tamanho do texto</Label>
              <div className="flex gap-1 mt-1">
                {BUSINESS_NAME_SIZE_OPTIONS.map(({ label, size }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onUpdateLink({ businessNameFontSize: size })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      (link.businessNameFontSize ?? 24) === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alinhamento do Título</Label>
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
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Slogan / Tagline</Label>
        <Input
          value={link.tagline}
          onChange={(e) => onUpdateLink({ tagline: e.target.value })}
          placeholder="Ex: Construindo Sonhos"
          className="text-sm h-9"
        />
      </div>
    </div>
  );
});
