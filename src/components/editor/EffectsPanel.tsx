import React, { useMemo } from "react";
import { SmartLink, EntryAnimation } from "@/types/smart-link";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Snowflake, Wand2, Code2, FileCode2, Zap } from "lucide-react";

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
  const currentAnim = link.entryAnimation ?? "fade-up";

  return (
    <div className="space-y-5">
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
