import React, { useMemo } from "react";
import { SmartLink, EntryAnimation, WhatsAppFloat } from "@/types/smart-link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Snowflake, Wand2, Code2, FileCode2, Zap, MessageCircle } from "lucide-react";

interface EffectsPanelProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}

const ANIM_OPTIONS: { value: EntryAnimation; label: string; desc: string }[] = [
  { value: "none", label: "Nenhuma", desc: "Sem animação" },
  { value: "fade-up", label: "Fade Up", desc: "Aparece de baixo" },
  { value: "slide-left", label: "Slide Esquerda", desc: "Desliza da esquerda" },
  { value: "slide-right", label: "Slide Direita", desc: "Desliza da direita" },
  { value: "scale", label: "Scale", desc: "Cresce do centro" },
  { value: "bounce", label: "Bounce", desc: "Efeito quicando" },
];

const ColorPicker = React.memo(function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#ffffff"
        className="text-xs h-8 flex-1 font-mono"
      />
    </div>
  );
});

function EffectHeader({
  icon,
  label,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <Label className="text-xs font-bold uppercase tracking-wider text-primary">{label}</Label>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

const WA_ANIM_OPTIONS: { value: WhatsAppFloat["animation"]; label: string }[] = [
  { value: "pulse", label: "Pulso" },
  { value: "bounce", label: "Quicar" },
  { value: "none", label: "Nenhuma" },
];

const WA_POS_OPTIONS: { value: WhatsAppFloat["position"]; label: string }[] = [
  { value: "bottom-right", label: "Direita" },
  { value: "bottom-left", label: "Esquerda" },
];

export function EffectsPanel({ link, onUpdateLink }: EffectsPanelProps) {
  const snow = useMemo(
    () => link.snowEffect ?? { enabled: false, intensity: 40, color: "#ffffff" },
    [link.snowEffect]
  );
  const bubbles = useMemo(
    () => link.bubblesEffect ?? { enabled: false, intensity: 40, color: "#88ccff" },
    [link.bubblesEffect]
  );
  const fireflies = useMemo(
    () => link.firefliesEffect ?? { enabled: false, count: 15, color: "#ffe066" },
    [link.firefliesEffect]
  );
  const matrix = useMemo(
    () => link.matrixEffect ?? { enabled: false, speed: 5, color: "#00ff46" },
    [link.matrixEffect]
  );
  const stars = useMemo(
    () => link.starsEffect ?? { enabled: false, count: 80, color: "#ffffff", shooting: true },
    [link.starsEffect]
  );
  const bgHtml = useMemo(
    () => link.bgHtml ?? { enabled: false, html: "" },
    [link.bgHtml]
  );
  const wa = useMemo(
    () =>
      link.whatsappFloat ?? {
        enabled: false,
        phone: "",
        message: "",
        label: "Entre em contato",
        showLabel: true,
        position: "bottom-right" as const,
        animation: "pulse" as const,
      },
    [link.whatsappFloat]
  );
  const currentAnim = link.entryAnimation ?? "fade-up";

  return (
    <div className="space-y-5">
      {/* WhatsApp Float */}
      <section className="space-y-2.5">
        <EffectHeader
          icon={<MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />}
          label="Botão WhatsApp"
          enabled={wa.enabled}
          onToggle={(v) => onUpdateLink({ whatsappFloat: { ...wa, enabled: v } })}
        />
        <p className="text-[9px] text-muted-foreground">Botão fixo para contato via WhatsApp</p>
        {wa.enabled && (
          <div className="space-y-3 pt-0.5">
            {/* Phone */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Número (somente dígitos)</Label>
              <Input
                value={wa.phone}
                onChange={(e) => onUpdateLink({ whatsappFloat: { ...wa, phone: e.target.value.replace(/\D/g, "") } })}
                placeholder="5599981361794"
                className="text-xs h-8 font-mono"
                inputMode="tel"
              />
              <p className="text-[8.5px] text-muted-foreground">DDI + DDD + número, sem espaços ou símbolos</p>
            </div>

            {/* Pre-filled message */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Mensagem pré-preenchida</Label>
              <Textarea
                value={wa.message}
                onChange={(e) => onUpdateLink({ whatsappFloat: { ...wa, message: e.target.value } })}
                placeholder="Olá! Vim pelo site e gostaria de mais informações."
                className="text-[10px] h-20 resize-none"
              />
            </div>

            {/* Label bubble */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Balão de texto</Label>
                <Switch
                  checked={wa.showLabel}
                  onCheckedChange={(v) => onUpdateLink({ whatsappFloat: { ...wa, showLabel: v } })}
                />
              </div>
              {wa.showLabel && (
                <div className="space-y-2.5">
                  <Input
                    value={wa.label}
                    onChange={(e) => onUpdateLink({ whatsappFloat: { ...wa, label: e.target.value } })}
                    placeholder="Entre em contato"
                    className="text-xs h-8"
                  />
                  {/* Delay before first appearance */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label className="text-[10px] text-muted-foreground">Aparece após</Label>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {((wa.labelDelayMs ?? 1500) / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <Slider
                      value={[wa.labelDelayMs ?? 1500]}
                      onValueChange={([v]) => onUpdateLink({ whatsappFloat: { ...wa, labelDelayMs: v } })}
                      min={500}
                      max={10000}
                      step={500}
                    />
                  </div>
                  {/* Duration visible */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label className="text-[10px] text-muted-foreground">Fica visível por</Label>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {((wa.labelDurationMs ?? 4000) / 1000).toFixed(0)}s
                      </span>
                    </div>
                    <Slider
                      value={[wa.labelDurationMs ?? 4000]}
                      onValueChange={([v]) => onUpdateLink({ whatsappFloat: { ...wa, labelDurationMs: v } })}
                      min={1000}
                      max={15000}
                      step={1000}
                    />
                  </div>
                  {/* Pause between cycles */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label className="text-[10px] text-muted-foreground">Pausa entre ciclos</Label>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {((wa.labelHiddenMs ?? 5000) / 1000).toFixed(0)}s
                      </span>
                    </div>
                    <Slider
                      value={[wa.labelHiddenMs ?? 5000]}
                      onValueChange={([v]) => onUpdateLink({ whatsappFloat: { ...wa, labelHiddenMs: v } })}
                      min={1000}
                      max={20000}
                      step={1000}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Position */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Posição</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {WA_POS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateLink({ whatsappFloat: { ...wa, position: opt.value } })}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                      wa.position === opt.value
                        ? "border-[#25D366] bg-[#25D366]/10 text-[#25D366]"
                        : "border-border/50 bg-secondary/30 text-foreground hover:border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Animação</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {WA_ANIM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdateLink({ whatsappFloat: { ...wa, animation: opt.value } })}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                      wa.animation === opt.value
                        ? "border-[#25D366] bg-[#25D366]/10 text-[#25D366]"
                        : "border-border/50 bg-secondary/30 text-foreground hover:border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="h-px bg-border/50" />

      {/* Entry Animation */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-bold uppercase tracking-wider text-primary">Animação de Entrada</Label>
        </div>
        <p className="text-[9px] text-muted-foreground">Como os elementos aparecem na página</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ANIM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateLink({ entryAnimation: opt.value })}
              className={`text-left py-2 px-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                currentAnim === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-secondary/30 text-foreground hover:border-border hover:bg-secondary/60"
              }`}
            >
              <span className="text-[10px] font-medium block">{opt.label}</span>
              <span className="text-[9px] text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="h-px bg-border/50" />

      {/* Snow */}
      <section className="space-y-2.5">
        <EffectHeader
          icon={<Snowflake className="h-3.5 w-3.5 text-primary" />}
          label="Neve"
          enabled={snow.enabled}
          onToggle={(v) => onUpdateLink({ snowEffect: { ...snow, enabled: v } })}
        />
        <p className="text-[9px] text-muted-foreground">Partículas caindo suavemente</p>
        {snow.enabled && (
          <div className="space-y-3 pt-0.5">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Intensidade</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">{snow.intensity}%</span>
              </div>
              <Slider
                value={[snow.intensity]}
                onValueChange={([v]) => onUpdateLink({ snowEffect: { ...snow, intensity: v } })}
                min={5}
                max={100}
                step={5}
              />
            </div>
            <ColorPicker value={snow.color} onChange={(c) => onUpdateLink({ snowEffect: { ...snow, color: c } })} />
          </div>
        )}
      </section>

      <div className="h-px bg-border/50" />

      {/* Bubbles */}
      <section className="space-y-2.5">
        <EffectHeader
          icon={<span className="text-primary text-sm leading-none">◎</span>}
          label="Bolhas"
          enabled={bubbles.enabled}
          onToggle={(v) => onUpdateLink({ bubblesEffect: { ...bubbles, enabled: v } })}
        />
        <p className="text-[9px] text-muted-foreground">Bolhas de sabão flutuando para cima</p>
        {bubbles.enabled && (
          <div className="space-y-3 pt-0.5">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Intensidade</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">{bubbles.intensity}%</span>
              </div>
              <Slider
                value={[bubbles.intensity]}
                onValueChange={([v]) => onUpdateLink({ bubblesEffect: { ...bubbles, intensity: v } })}
                min={5}
                max={100}
                step={5}
              />
            </div>
            <ColorPicker value={bubbles.color} onChange={(c) => onUpdateLink({ bubblesEffect: { ...bubbles, color: c } })} />
          </div>
        )}
      </section>

      <div className="h-px bg-border/50" />

      {/* Fireflies */}
      <section className="space-y-2.5">
        <EffectHeader
          icon={<Sparkles className="h-3.5 w-3.5 text-primary" />}
          label="Vaga-lumes"
          enabled={fireflies.enabled}
          onToggle={(v) => onUpdateLink({ firefliesEffect: { ...fireflies, enabled: v } })}
        />
        <p className="text-[9px] text-muted-foreground">Pontos brilhantes flutuando com pulso</p>
        {fireflies.enabled && (
          <div className="space-y-3 pt-0.5">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Quantidade</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">{fireflies.count}</span>
              </div>
              <Slider
                value={[fireflies.count]}
                onValueChange={([v]) => onUpdateLink({ firefliesEffect: { ...fireflies, count: v } })}
                min={3}
                max={40}
                step={1}
              />
            </div>
            <ColorPicker value={fireflies.color} onChange={(c) => onUpdateLink({ firefliesEffect: { ...fireflies, color: c } })} />
          </div>
        )}
      </section>

      <div className="h-px bg-border/50" />

      {/* Stars */}
      <section className="space-y-2.5">
        <EffectHeader
          icon={<Zap className="h-3.5 w-3.5 text-primary" />}
          label="Estrelas"
          enabled={stars.enabled}
          onToggle={(v) => onUpdateLink({ starsEffect: { ...stars, enabled: v } })}
        />
        <p className="text-[9px] text-muted-foreground">Campo de estrelas com brilho pulsante</p>
        {stars.enabled && (
          <div className="space-y-3 pt-0.5">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Quantidade</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">{stars.count}</span>
              </div>
              <Slider
                value={[stars.count]}
                onValueChange={([v]) => onUpdateLink({ starsEffect: { ...stars, count: v } })}
                min={20}
                max={200}
                step={10}
              />
            </div>
            <ColorPicker value={stars.color} onChange={(c) => onUpdateLink({ starsEffect: { ...stars, color: c } })} />
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Estrelas cadentes</Label>
              <Switch
                checked={stars.shooting}
                onCheckedChange={(v) => onUpdateLink({ starsEffect: { ...stars, shooting: v } })}
              />
            </div>
          </div>
        )}
      </section>

      <div className="h-px bg-border/50" />

      {/* Matrix */}
      <section className="space-y-2.5">
        <EffectHeader
          icon={<Code2 className="h-3.5 w-3.5 text-primary" />}
          label="Matrix Rain"
          enabled={matrix.enabled}
          onToggle={(v) => onUpdateLink({ matrixEffect: { ...matrix, enabled: v } })}
        />
        <p className="text-[9px] text-muted-foreground">Chuva de caracteres no fundo</p>
        {matrix.enabled && (
          <div className="space-y-3 pt-0.5">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-[10px] text-muted-foreground">Velocidade</Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">{matrix.speed}</span>
              </div>
              <Slider
                value={[matrix.speed]}
                onValueChange={([v]) => onUpdateLink({ matrixEffect: { ...matrix, speed: v } })}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <ColorPicker value={matrix.color} onChange={(c) => onUpdateLink({ matrixEffect: { ...matrix, color: c } })} />
          </div>
        )}
      </section>

      <div className="h-px bg-border/50" />

      {/* Background HTML */}
      <section className="space-y-2.5">
        <EffectHeader
          icon={<FileCode2 className="h-3.5 w-3.5 text-primary" />}
          label="HTML de Fundo"
          enabled={bgHtml.enabled}
          onToggle={(v) => onUpdateLink({ bgHtml: { ...bgHtml, enabled: v } })}
        />
        <p className="text-[9px] text-muted-foreground">HTML/CSS personalizado no fundo da página (atrás de todo o conteúdo)</p>
        {bgHtml.enabled && (
          <div className="space-y-2 pt-0.5">
            <Textarea
              value={bgHtml.html}
              onChange={(e) => onUpdateLink({ bgHtml: { ...bgHtml, html: e.target.value } })}
              placeholder={`<style>\nbody { background: linear-gradient(45deg, #ff0080, #7928ca); }\n</style>`}
              className="text-[10px] font-mono h-32 resize-none"
            />
            <p className="text-[8.5px] text-muted-foreground">Suporta HTML, CSS e JavaScript. Renderizado em iframe isolado.</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Overlay escuro: {bgHtml.overlay ?? 0}%
              </Label>
              <Slider
                value={[bgHtml.overlay ?? 0]}
                onValueChange={([v]) => onUpdateLink({
                  bgHtml: { ...bgHtml, overlay: v }
                })}
                min={0}
                max={80}
                step={5}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
