import { SmartLinkButton, LinkType, SubPage } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical, ChevronDown, ChevronUp, Link2, ArrowLeftRight, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { brandIcons, brandColors } from "@/data/brand-icons";

function BrandIcon({ type, size = 16, className = "" }: { type: string; size?: number; className?: string }) {
  const svg = brandIcons[type];
  if (!svg) return null;
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, color: brandColors[type] || "currentColor" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const linkTypeOptions: { value: LinkType; label: string; placeholder: string; prefix: string; helper: string }[] = [
  { value: "whatsapp", label: "WhatsApp", placeholder: "5511999999999", prefix: "https://wa.me/", helper: "Digite apenas o número com DDD e código do país (ex: 5511999999999)" },
  { value: "instagram", label: "Instagram", placeholder: "seu.usuario", prefix: "https://instagram.com/", helper: "Digite apenas seu @ (sem o @)" },
  { value: "tiktok", label: "TikTok", placeholder: "seu.usuario", prefix: "https://tiktok.com/@", helper: "Digite apenas seu usuário (sem o @)" },
  { value: "youtube", label: "YouTube", placeholder: "seu-canal", prefix: "https://youtube.com/@", helper: "Digite o nome do seu canal" },
  { value: "telegram", label: "Telegram", placeholder: "seu_usuario", prefix: "https://t.me/", helper: "Digite seu usuário do Telegram" },
  { value: "email", label: "E-mail", placeholder: "seu@email.com", prefix: "mailto:", helper: "Digite seu endereço de e-mail" },
  { value: "phone", label: "Telefone", placeholder: "5511999999999", prefix: "tel:+", helper: "Digite o número com DDD e código do país" },
  { value: "external", label: "Link externo", placeholder: "https://seusite.com", prefix: "", helper: "Cole o link completo" },
  { value: "page", label: "Sub-página", placeholder: "", prefix: "", helper: "Abre uma sub-página interna ao clicar" },
];

function generateUrl(type: LinkType, value: string): string {
  if (type === "external") return value;
  const opt = linkTypeOptions.find((o) => o.value === type);
  if (!opt) return value;
  const clean = value.replace(/^[@+\s]+/, "").trim();
  if (type === "whatsapp" || type === "phone") {
    return opt.prefix + clean.replace(/\D/g, "");
  }
  return opt.prefix + clean;
}

interface ButtonBlockEditorProps {
  button: SmartLinkButton;
  index: number;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
  onRemove: (id: string) => void;
  dragHandleProps?: Record<string, any>;
  pages?: SubPage[];
}

const gradientOptions = [
  { label: "Azul", value: "from-blue-600 to-blue-800", css: "linear-gradient(135deg, #2563eb, #1e40af)" },
  { label: "Verde", value: "from-green-600 to-green-800", css: "linear-gradient(135deg, #16a34a, #166534)" },
  { label: "Vermelho", value: "from-red-600 to-red-800", css: "linear-gradient(135deg, #dc2626, #991b1b)" },
  { label: "Laranja", value: "from-orange-500 to-orange-700", css: "linear-gradient(135deg, #f97316, #c2410c)" },
  { label: "Roxo", value: "from-purple-600 to-purple-800", css: "linear-gradient(135deg, #9333ea, #6b21a8)" },
  { label: "Rosa", value: "from-pink-500 to-pink-700", css: "linear-gradient(135deg, #ec4899, #be185d)" },
  { label: "Amarelo", value: "from-yellow-500 to-amber-600", css: "linear-gradient(135deg, #eab308, #d97706)" },
  { label: "Ciano", value: "from-cyan-500 to-teal-700", css: "linear-gradient(135deg, #06b6d4, #0f766e)" },
  { label: "Índigo", value: "from-indigo-500 to-indigo-800", css: "linear-gradient(135deg, #6366f1, #3730a3)" },
  { label: "Esmeralda", value: "from-emerald-500 to-emerald-800", css: "linear-gradient(135deg, #10b981, #065f46)" },
];

const BUTTON_STYLE_OPTIONS = [
  { value: 'card', label: 'Card', desc: 'Grande' },
  { value: 'pill', label: 'Pílula', desc: 'Compacto' },
  { value: 'outline', label: 'Borda', desc: 'Contorno' },
  { value: 'glass', label: 'Vidro', desc: 'Glass' },
  { value: 'minimal', label: 'Mínimo', desc: 'Texto' },
] as const;

const BUTTON_ALIGN_OPTIONS = [
  { value: "left" as const, icon: AlignLeft, label: "Esquerda" },
  { value: "center" as const, icon: AlignCenter, label: "Centro" },
  { value: "right" as const, icon: AlignRight, label: "Direita" },
] as const;

const BUTTON_COLOR_MODE_OPTIONS = [
  { value: "preset" as const, label: "Predefinida" },
  { value: "solid" as const, label: "Cor sólida" },
  { value: "gradient" as const, label: "Gradiente" },
] as const;

export const ButtonBlockEditor = React.memo(function ButtonBlockEditor({ button, index, onUpdate, onRemove, dragHandleProps, pages = [] }: ButtonBlockEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [colorState, setColorState] = useState({
    mode: "preset" as "solid" | "gradient" | "preset",
    solidColor: "#2563eb",
    customFrom: "#2563eb",
    customTo: "#1e40af",
  });

  const gradientStyle = useMemo(() => {
    if (!button.gradientColor?.startsWith("custom:")) return undefined;
    const parts = button.gradientColor.split(":");
    return { background: `linear-gradient(135deg, ${parts[1]}, ${parts[2]})` };
  }, [button.gradientColor]);

  const imgPos = button.imagePosition || "right";
  const imgOpacity = button.imageOpacity ?? 85;
  const imgSize = button.imageSize ?? 50;

  return (
    <div className="editor-card rounded-2xl">
      {/* Header with mini preview */}
      <div className="flex items-center gap-2 p-2.5 bg-secondary/30">
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Mini card preview */}
        <div
          className={`flex-1 h-14 rounded-xl bg-gradient-to-r ${button.gradientColor?.startsWith("custom:") ? "" : (button.gradientColor || "from-blue-600 to-blue-800")} flex items-center px-4 gap-3 overflow-hidden relative shadow-inner`}
          style={gradientStyle}
        >
          {button.imageUrl && (
            <img
              src={button.imageUrl}
              alt=""
              className={`absolute ${imgPos === "left" ? "left-0" : "right-0"} top-0 h-full object-cover`}
              style={{
                width: `${imgSize}%`,
                opacity: imgOpacity / 100,
                maskImage: imgPos === "left" ? "linear-gradient(to left, transparent, black 50%)" : "linear-gradient(to right, transparent, black 50%)",
                WebkitMaskImage: imgPos === "left" ? "linear-gradient(to left, transparent, black 50%)" : "linear-gradient(to right, transparent, black 50%)",
              }}
            />
          )}
          {button.iconEmoji && (
            <span className="text-2xl drop-shadow-md relative z-10">{button.iconEmoji}</span>
          )}
          <div className="relative z-10 flex-1 min-w-0">
            <span className="text-white text-sm font-bold truncate block drop-shadow-sm">
              {button.label || `Botão ${index + 1}`}
            </span>
            {button.subtitle && (
              <span className="text-white/70 text-[10px] truncate block">{button.subtitle}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onRemove(button.id)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 border-t border-border/30">
              {/* Button Style Picker */}
              <div>
                <Label className="text-xs text-muted-foreground">Estilo do Botão</Label>
                <div className="grid grid-cols-5 gap-1 mt-1">
                  {BUTTON_STYLE_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => onUpdate(button.id, { buttonStyle: s.value })}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer border ${
                        (button.buttonStyle || 'card') === s.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="font-semibold">{s.label}</span>
                      <span className="text-[9px] opacity-70">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Arredondamento</label>
                  <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{button.buttonBorderRadius ?? 12}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  step={2}
                  value={button.buttonBorderRadius ?? 12}
                  onChange={(e) => onUpdate(button.id, { buttonBorderRadius: Number(e.target.value) })}
                  className="w-full h-1.5 accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Reto</span>
                  <span>Arredondado</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Título</Label>
                  <Input
                    value={button.label}
                    onChange={(e) => onUpdate(button.id, { label: e.target.value })}
                    placeholder="Ex: Fale conosco"
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Subtítulo</Label>
                  <Input
                    value={button.subtitle}
                    onChange={(e) => onUpdate(button.id, { subtitle: e.target.value })}
                    placeholder="Ex: Chama no Whats"
                    className="text-sm h-9"
                  />
                </div>
              </div>

              {/* Title Size */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-muted-foreground">Tamanho do Título: {button.titleSize ?? 16}px</Label>
                <Slider
                  value={[button.titleSize ?? 16]}
                  onValueChange={([v]) => onUpdate(button.id, { titleSize: v })}
                  min={12}
                  max={28}
                  step={1}
                />
              </div>

              {/* Button Height — only for card style */}
              {(button.buttonStyle === undefined || button.buttonStyle === 'card') && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Altura do Botão: {button.buttonHeight ?? 110}px</Label>
                  <Slider
                    value={[button.buttonHeight ?? 110]}
                    onValueChange={([v]) => onUpdate(button.id, { buttonHeight: v })}
                    min={60}
                    max={200}
                    step={5}
                  />
                </div>
              )}

              {/* Text Alignment */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-muted-foreground">Alinhamento do Texto</Label>
                <div className="flex gap-1.5">
                  {BUTTON_ALIGN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdate(button.id, { textAlign: opt.value })}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        (button.textAlign || "center") === opt.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground border border-border/50"
                      }`}
                    >
                      <opt.icon className="h-3.5 w-3.5" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Type Selector */}
              <div className="space-y-3">
                <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Tipo de Link
                </Label>
                <Select
                  value={button.linkType || "external"}
                  onValueChange={(val: LinkType) => {
                    const newUrl = button.linkValue ? generateUrl(val, button.linkValue) : "";
                    onUpdate(button.id, { linkType: val, url: newUrl });
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {linkTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <BrandIcon type={opt.value} size={16} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Smart input based on type */}
                {(() => {
                  const currentType = button.linkType || "external";
                  
                  // Page selector
                  if (currentType === "page") {
                    return (
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground">Sub-página</Label>
                        <Select
                          value={button.pageId || ""}
                          onValueChange={(val) => onUpdate(button.id, { pageId: val, url: "" })}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Selecione a página" />
                          </SelectTrigger>
                          <SelectContent>
                            {pages.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {pages.length === 0 && (
                          <p className="text-[10px] text-amber-500">
                            Crie uma sub-página primeiro no menu "Páginas"
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          Ao clicar, abrirá a página selecionada em tela cheia
                        </p>
                      </div>
                    );
                  }
                  
                  const opt = linkTypeOptions.find((o) => o.value === currentType)!;
                  return (
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">
                        {currentType === "external" ? "URL" : opt.label}
                      </Label>
                      <div className="relative">
                        {currentType !== "external" && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                            {currentType === "whatsapp" || currentType === "phone" ? "+" : "@"}
                          </span>
                        )}
                        <Input
                          value={button.linkValue ?? button.url ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const url = generateUrl(currentType, val);
                            onUpdate(button.id, { linkValue: val, url });
                          }}
                          placeholder={opt.placeholder}
                          className={`text-sm h-9 font-mono ${currentType !== "external" ? "pl-7" : ""}`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{opt.helper}</p>
                      {button.url && (
                        <p className="text-[10px] text-primary font-mono truncate">
                          → {button.url}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Image Upload — only for card style */}
              {(button.buttonStyle === undefined || button.buttonStyle === 'card') && (
                <ImageUploader
                  value={button.imageUrl || ""}
                  onChange={(url) => onUpdate(button.id, { imageUrl: url })}
                  aspectRatio={3 / 4}
                  label="Imagem do Card (opcional)"
                  compact
                />
              )}

              {/* Image Controls - only show when there's an image and card style */}
              {(button.buttonStyle === undefined || button.buttonStyle === 'card') && button.imageUrl && (
                <div className="space-y-4 p-3 rounded-xl bg-secondary/30 border border-border/40">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Controles da Imagem</span>
                  </div>

                  {/* Position toggle */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Posição</Label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onUpdate(button.id, { imagePosition: "left" })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          imgPos === "left"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-border/50"
                        }`}
                      >
                        ← Esquerda
                      </button>
                      <button
                        onClick={() => onUpdate(button.id, { imagePosition: "right" })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          imgPos === "right"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-border/50"
                        }`}
                      >
                        Direita →
                      </button>
                    </div>
                  </div>

                  {/* Opacity slider */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Opacidade: {imgOpacity}%</Label>
                    <Slider
                      value={[imgOpacity]}
                      onValueChange={([v]) => onUpdate(button.id, { imageOpacity: v })}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>

                  {/* Size slider */}
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Tamanho: {imgSize}%</Label>
                    <Slider
                      value={[imgSize]}
                      onValueChange={([v]) => onUpdate(button.id, { imageSize: v })}
                      min={30}
                      max={70}
                      step={5}
                    />
                  </div>
                </div>
              )}

              {/* Emoji */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-muted-foreground">Emoji Flutuante (aparece flutuando no canto do botão)</Label>
                <Input
                  value={button.iconEmoji || ""}
                  onChange={(e) => onUpdate(button.id, { iconEmoji: e.target.value })}
                  placeholder="💬"
                  className="text-sm h-9 w-24 text-center text-lg"
                />
              </div>

              {/* Badge do botão */}
              <div className="space-y-2">
                <Label className="text-[11px] font-medium text-muted-foreground">Badge (aparece no canto do botão)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={button.badgeLabel || ""}
                    onChange={e => onUpdate(button.id, { badgeLabel: e.target.value })}
                    placeholder="NOVO · 🔥 · GRÁTIS"
                    className="text-sm h-9 flex-1"
                  />
                  <input
                    type="color"
                    value={button.badgeColor || "#ef4444"}
                    onChange={e => onUpdate(button.id, { badgeColor: e.target.value })}
                    className="w-10 h-9 rounded-xl border border-border cursor-pointer"
                    title="Cor do badge"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Deixe vazio para esconder. Aparece no canto superior direito.</p>
              </div>

              {/* Gradient picker — hidden for outline/glass/minimal (they use accent/primaryColor) */}
              {(button.buttonStyle === undefined || button.buttonStyle === 'card' || button.buttonStyle === 'pill') && (
              <div className="space-y-2">
                <Label className="text-[11px] font-medium text-muted-foreground">Cor do Botão</Label>
                
                {/* Mode tabs */}
                <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50">
                  {BUTTON_COLOR_MODE_OPTIONS.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setColorState(s => ({ ...s, mode: mode.value }))}
                      className={`flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                        colorState.mode === mode.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {colorState.mode === "preset" && (
                  <div className="grid grid-cols-5 gap-1.5">
                    {gradientOptions.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => onUpdate(button.id, { gradientColor: g.value })}
                        className={`h-9 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                          button.gradientColor === g.value
                            ? "border-foreground scale-110 shadow-lg"
                            : "border-transparent hover:border-border"
                        }`}
                        style={{ background: g.css }}
                        title={g.label}
                      />
                    ))}
                  </div>
                )}

                {colorState.mode === "solid" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorState.solidColor}
                      onChange={(e) => {
                        setColorState(s => ({ ...s, solidColor: e.target.value }));
                        onUpdate(button.id, { gradientColor: `custom:${e.target.value}:${e.target.value}` });
                      }}
                      className="w-10 h-10 rounded-xl border border-border cursor-pointer"
                    />
                    <Input
                      value={colorState.solidColor}
                      onChange={(e) => {
                        setColorState(s => ({ ...s, solidColor: e.target.value }));
                        onUpdate(button.id, { gradientColor: `custom:${e.target.value}:${e.target.value}` });
                      }}
                      className="text-xs h-9 font-mono flex-1"
                      placeholder="#2563eb"
                    />
                    <div
                      className="h-9 w-20 rounded-xl border border-border/50"
                      style={{ background: colorState.solidColor }}
                    />
                  </div>
                )}

                {colorState.mode === "gradient" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-1.5">
                        <input type="color" value={colorState.customFrom} onChange={(e) => setColorState(s => ({ ...s, customFrom: e.target.value }))} className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                        <Input value={colorState.customFrom} onChange={(e) => setColorState(s => ({ ...s, customFrom: e.target.value }))} className="text-xs h-8 font-mono" />
                      </div>
                      <div className="flex-1 flex items-center gap-1.5">
                        <input type="color" value={colorState.customTo} onChange={(e) => setColorState(s => ({ ...s, customTo: e.target.value }))} className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                        <Input value={colorState.customTo} onChange={(e) => setColorState(s => ({ ...s, customTo: e.target.value }))} className="text-xs h-8 font-mono" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 h-9 rounded-xl border border-border/50"
                        style={{ background: `linear-gradient(135deg, ${colorState.customFrom}, ${colorState.customTo})` }}
                      />
                      <button
                        onClick={() => onUpdate(button.id, { gradientColor: `custom:${colorState.customFrom}:${colorState.customTo}` })}
                        className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
