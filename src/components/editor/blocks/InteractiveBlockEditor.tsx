import React, { memo, useMemo } from "react";
import { LinkBlock, SubPage, BadgeItem } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader, buildButtonPresets } from "../ImageUploader";
import { ANIM_STYLE_OPTIONS } from "./constants";
import { Trash2, Plus } from "lucide-react";

interface InteractiveBlockEditorProps {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
  pages?: SubPage[];
}

export const InteractiveBlockEditor = memo(function InteractiveBlockEditor({ block, onUpdate, pages }: InteractiveBlockEditorProps) {
  const buttonPresets = useMemo(
    () => buildButtonPresets(block.buttonHeight ?? 110),
    [block.buttonHeight]
  );

  return (
    <>
      {block.type === "badges" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Badges</p>
            <button
              type="button"
              onClick={() => {
                const COLORS = ["bg-blue-500", "bg-green-500", "bg-red-500", "bg-purple-500", "bg-orange-500"];
                const idx = (block.badges || []).length;
                const newBadge: BadgeItem = {
                  id: `badge-${Date.now()}`,
                  emoji: "⭐",
                  label: "Novo Badge",
                  color: COLORS[idx % COLORS.length],
                };
                onUpdate(block.id, { badges: [...(block.badges || []), newBadge] });
              }}
              className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70 transition-opacity"
            >
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          </div>

          {(block.badges || []).length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-3 border border-dashed border-border rounded-lg">
              Nenhum badge ainda. Clique em Adicionar.
            </p>
          )}

          <div className="space-y-2">
            {(block.badges || []).map((badge, idx) => (
              <div key={badge.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-secondary/40 border border-border/30">
                {/* Emoji preview circle */}
                <div className={`w-10 h-10 rounded-full ${badge.color} flex items-center justify-center shrink-0 text-xl shadow`}>
                  {badge.emoji || "?"}
                </div>

                <div className="flex-1 space-y-1.5">
                  <Input
                    value={badge.emoji}
                    onChange={(e) => {
                      const updated = [...(block.badges || [])];
                      updated[idx] = { ...badge, emoji: e.target.value };
                      onUpdate(block.id, { badges: updated });
                    }}
                    placeholder="Cole um emoji (ex: ⭐)"
                    className="text-sm h-7 text-center"
                  />
                  <Input
                    value={badge.label}
                    onChange={(e) => {
                      const updated = [...(block.badges || [])];
                      updated[idx] = { ...badge, label: e.target.value };
                      onUpdate(block.id, { badges: updated });
                    }}
                    placeholder="Rótulo do badge"
                    className="text-xs h-7"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUpdate(block.id, { badges: (block.badges || []).filter((_, i) => i !== idx) });
                  }}
                  className="text-destructive/50 hover:text-destructive transition-colors mt-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Button */}
      {block.type === "image-button" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">
            Suba uma arte personalizada (PNG, JPG, WebP). O recorte já vem no tamanho exato do botão.
          </p>
          <ImageUploader
            value={block.buttonImageUrl || ""}
            onChange={(url) => onUpdate(block.id, { buttonImageUrl: url })}
            aspectRatio={348 / (block.buttonHeight ?? 110)}
            label="Arte do botão"
            allowOriginal
            presets={buttonPresets}
          />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Altura do Botão: {block.buttonHeight ?? 110}px</Label>
            <Slider
              value={[block.buttonHeight ?? 110]}
              onValueChange={([v]) => onUpdate(block.id, { buttonHeight: v })}
              min={60}
              max={250}
              step={5}
            />
          </div>
          {/* Link type: URL or sub-page */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Destino ao clicar</Label>
            <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50">
              {(['url', 'page'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (t === 'page') onUpdate(block.id, { buttonUrl: '' });
                    else onUpdate(block.id, { blockPageId: undefined });
                  }}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                    (t === 'page' ? !!block.blockPageId : !block.blockPageId)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'url' ? 'Link externo' : 'Sub-página'}
                </button>
              ))}
            </div>
            {block.blockPageId ? (
              <>
                <Select
                  value={block.blockPageId}
                  onValueChange={(val) => onUpdate(block.id, { blockPageId: val, buttonUrl: '' })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione a página" />
                  </SelectTrigger>
                  <SelectContent>
                    {(pages || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(pages || []).length === 0 && (
                  <p className="text-[10px] text-amber-500">Crie uma sub-página primeiro no menu "Páginas"</p>
                )}
              </>
            ) : (
              <Input
                value={block.buttonUrl || ""}
                onChange={(e) => onUpdate(block.id, { buttonUrl: e.target.value })}
                placeholder="https://..."
                className="text-sm h-9 font-mono"
              />
            )}
          </div>
        </div>
      )}

      {/* Countdown */}
      {block.type === "countdown" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Data e Hora</Label>
            <Input
              type="datetime-local"
              value={block.countdownDate || ""}
              onChange={(e) => onUpdate(block.id, { countdownDate: e.target.value })}
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Título (opcional)</Label>
            <Input
              value={block.countdownLabel || ""}
              onChange={(e) => onUpdate(block.id, { countdownLabel: e.target.value })}
              placeholder="Ex: Oferta termina em..."
              className="text-sm h-9"
            />
          </div>
        </div>
      )}

      {/* Email Capture */}
      {block.type === "email-capture" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              value={block.content || ""}
              onChange={e => onUpdate(block.id, { content: e.target.value })}
              placeholder="Receba novidades exclusivas"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Placeholder do campo</Label>
            <Input
              value={block.emailPlaceholder || ""}
              onChange={e => onUpdate(block.id, { emailPlaceholder: e.target.value })}
              placeholder="seu@email.com"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Texto do botão</Label>
            <Input
              value={block.emailButtonLabel || ""}
              onChange={e => onUpdate(block.id, { emailButtonLabel: e.target.value })}
              placeholder="Quero receber!"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Mensagem de sucesso</Label>
            <Input
              value={block.emailSuccessMessage || ""}
              onChange={e => onUpdate(block.id, { emailSuccessMessage: e.target.value })}
              placeholder="Obrigado! Em breve você receberá nossas novidades."
              className="text-sm h-9"
            />
          </div>
        </div>
      )}

      {/* Animated Button */}
      {block.type === "animated-button" && (
        <div className="space-y-3">
          {/* Style picker */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Estilo</Label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {ANIM_STYLE_OPTIONS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onUpdate(block.id, { animStyle: s.value })}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-white ${s.color} ${
                    (block.animStyle || 'cta') === s.value ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {/* Label */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              value={block.content || ""}
              onChange={e => onUpdate(block.id, { content: e.target.value })}
              placeholder={
                block.animStyle === 'location' ? 'Nossa Localização' :
                block.animStyle === 'schedule' ? 'Agende sua consulta' :
                block.animStyle === 'cta' ? 'Saiba Mais' :
                'Chama no WhatsApp'
              }
              className="text-sm h-9"
            />
          </div>
          {/* Subtitle */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Subtítulo</Label>
            <Input
              value={block.animSubtitle || ""}
              onChange={e => onUpdate(block.id, { animSubtitle: e.target.value })}
              placeholder={
                block.animStyle === 'location' ? 'Saiba como nos encontrar' :
                block.animStyle === 'schedule' ? 'Horários disponíveis online' :
                block.animStyle === 'cta' ? '' :
                'Atendimento rápido pelo chat'
              }
              className="text-sm h-9"
            />
          </div>
          {/* Button text */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Texto do botão</Label>
            <Input
              value={block.animButtonLabel || ""}
              onChange={e => onUpdate(block.id, { animButtonLabel: e.target.value })}
              placeholder={
                block.animStyle === 'location' ? 'Abrir Google Maps' :
                block.animStyle === 'schedule' ? 'Agendar agora' :
                block.animStyle === 'cta' ? 'Clique aqui' :
                'Falar no WhatsApp'
              }
              className="text-sm h-9"
            />
          </div>
          {/* Link de destino: URL ou sub-página */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Link de destino</Label>
            <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50">
              {(['url', 'page'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (t === 'page') onUpdate(block.id, { animUrl: '' });
                    else onUpdate(block.id, { blockPageId: undefined });
                  }}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                    (t === 'page' ? !!block.blockPageId : !block.blockPageId)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'url' ? 'Link externo' : 'Sub-página'}
                </button>
              ))}
            </div>
            {block.blockPageId ? (
              <>
                <Select
                  value={block.blockPageId}
                  onValueChange={(val) => onUpdate(block.id, { blockPageId: val, animUrl: '' })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione a página" />
                  </SelectTrigger>
                  <SelectContent>
                    {(pages || []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(pages || []).length === 0 && (
                  <p className="text-[10px] text-amber-500">Crie uma sub-página primeiro no menu "Páginas"</p>
                )}
              </>
            ) : (
              <Input
                value={block.animUrl || ""}
                onChange={e => onUpdate(block.id, { animUrl: e.target.value })}
                placeholder={
                  block.animStyle === 'location' ? 'https://maps.google.com/...' :
                  block.animStyle === 'schedule' ? 'https://calendly.com/...' :
                  block.animStyle === 'cta' ? 'https://...' :
                  'https://wa.me/5511999999999'
                }
                className="text-sm h-9"
              />
            )}
          </div>

          {/* Title size */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tamanho do Título: {block.animTitleSize ?? 17}px
            </Label>
            <Slider
              value={[block.animTitleSize ?? 17]}
              onValueChange={([v]) => onUpdate(block.id, { animTitleSize: v })}
              min={11}
              max={26}
              step={1}
            />
          </div>

          {/* Button height */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Altura do Card: {block.animButtonHeight ?? 130}px
            </Label>
            <Slider
              value={[block.animButtonHeight ?? 130]}
              onValueChange={([v]) => onUpdate(block.id, { animButtonHeight: v })}
              min={90}
              max={200}
              step={5}
            />
          </div>

          {/* Color overrides — all styles */}
          <div className="space-y-3 pt-1 border-t border-border/30">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Personalizar Cor{block.animStyle && block.animStyle !== 'cta' ? ' (sobrescreve padrão)' : ''}
            </Label>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cor primária</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.animPrimaryColor || (block.animStyle === 'cta' ? "#7c3aed" : "#000000")}
                  onChange={e => onUpdate(block.id, { animPrimaryColor: e.target.value })}
                  className="w-10 h-9 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={block.animPrimaryColor || ""}
                  onChange={e => onUpdate(block.id, { animPrimaryColor: e.target.value || undefined })}
                  className="text-sm h-9 font-mono flex-1"
                  placeholder={block.animStyle === 'cta' ? "#7c3aed (padrão)" : "Deixe vazio para padrão"}
                />
                {block.animPrimaryColor && (
                  <button
                    type="button"
                    onClick={() => onUpdate(block.id, { animPrimaryColor: undefined })}
                    className="h-9 px-2 rounded-lg text-xs text-muted-foreground hover:text-destructive border border-border/50 hover:border-destructive/50 transition-colors"
                    title="Remover cor personalizada"
                  >✕</button>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cor secundária (gradiente)</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.animSecondaryColor || (block.animStyle === 'cta' ? "#4f46e5" : "#000000")}
                  onChange={e => onUpdate(block.id, { animSecondaryColor: e.target.value })}
                  className="w-10 h-9 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={block.animSecondaryColor || ""}
                  onChange={e => onUpdate(block.id, { animSecondaryColor: e.target.value || undefined })}
                  className="text-sm h-9 font-mono flex-1"
                  placeholder={block.animStyle === 'cta' ? "#4f46e5 (padrão)" : "Deixe vazio para igual à primária"}
                />
                {block.animSecondaryColor && (
                  <button
                    type="button"
                    onClick={() => onUpdate(block.id, { animSecondaryColor: undefined })}
                    className="h-9 px-2 rounded-lg text-xs text-muted-foreground hover:text-destructive border border-border/50 hover:border-destructive/50 transition-colors"
                    title="Remover cor personalizada"
                  >✕</button>
                )}
              </div>
            </div>
            {/* Preview swatch */}
            {(block.animPrimaryColor || block.animSecondaryColor) && (
              <div
                className="h-8 rounded-xl border border-border/40"
                style={{
                  background: `linear-gradient(135deg, ${block.animPrimaryColor || "#888"} 0%, ${block.animSecondaryColor || block.animPrimaryColor || "#888"} 100%)`,
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
});
