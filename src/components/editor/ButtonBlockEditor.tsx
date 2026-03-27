import { SmartLinkButton, LinkType, SubPage } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical, ChevronDown, ChevronUp, Link2, ArrowLeftRight, AlignLeft, AlignCenter, AlignRight, CopyPlus } from "lucide-react";
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

function generateUrl(type: LinkType, value: string, whatsappMessage?: string): string {
  if (type === "external") return value;
  const opt = linkTypeOptions.find((o) => o.value === type);
  if (!opt) return value;
  const clean = value.replace(/^[@+\s]+/, "").trim();
  if (type === "whatsapp") {
    const number = clean.replace(/\D/g, "");
    const base = opt.prefix + number;
    return whatsappMessage?.trim() ? `${base}?text=${encodeURIComponent(whatsappMessage.trim())}` : base;
  }
  if (type === "phone") {
    return opt.prefix + clean.replace(/\D/g, "");
  }
  return opt.prefix + clean;
}

interface ButtonBlockEditorProps {
  button: SmartLinkButton;
  index: number;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
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

export const ButtonBlockEditor = React.memo(function ButtonBlockEditor({ button, index, onUpdate, onRemove, onDuplicate, dragHandleProps, pages = [] }: ButtonBlockEditorProps) {
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
        {onDuplicate && (
          <button
            onClick={() => onDuplicate(button.id)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Duplicar botão"
          >
            <CopyPlus className="h-4 w-4" />
          </button>
        )}
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
            <div className="p-3 space-y-0 border-t border-border/30 divide-y divide-border/20">

              {/* ── Estilo ──────────────────────────────────────────────── */}
              <div className="py-3 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estilo</p>

                <div className="grid grid-cols-5 gap-1">
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-muted-foreground">Arredondamento</label>
                    <span className="text-[11px] font-mono tabular-nums text-foreground">{button.buttonBorderRadius ?? 12}px</span>
                  </div>
                  <input
                    type="range" min={0} max={32} step={2} value={button.buttonBorderRadius ?? 12}
                    onChange={(e) => onUpdate(button.id, { buttonBorderRadius: Number(e.target.value) })}
                    className="w-full h-1.5 accent-primary cursor-pointer"
                  />
                </div>

                {(button.buttonStyle === undefined || button.buttonStyle === 'card') && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-muted-foreground">Altura</label>
                      <span className="text-[11px] font-mono tabular-nums text-foreground">{button.buttonHeight ?? 110}px</span>
                    </div>
                    <Slider value={[button.buttonHeight ?? 110]} onValueChange={([v]) => onUpdate(button.id, { buttonHeight: v })} min={60} max={200} step={5} />
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              {/* ── Conteúdo ────────────────────────────────────────────── */}
              <div className="py-3 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conteúdo</p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Título</Label>
                    <Input value={button.label} onChange={(e) => onUpdate(button.id, { label: e.target.value })} placeholder="Ex: Fale conosco" className="text-sm h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Subtítulo</Label>
                    <Input value={button.subtitle} onChange={(e) => onUpdate(button.id, { subtitle: e.target.value })} placeholder="Ex: Chama no Whats" className="text-sm h-8" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Tamanho: {button.titleSize ?? 16}px</Label>
                    <Slider value={[button.titleSize ?? 16]} onValueChange={([v]) => onUpdate(button.id, { titleSize: v })} min={12} max={28} step={1} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Alinhamento</Label>
                    <div className="flex gap-1">
                      {BUTTON_ALIGN_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onUpdate(button.id, { textAlign: opt.value })}
                          className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition-all ${
                            (button.textAlign || "center") === opt.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-secondary text-muted-foreground hover:text-foreground border border-border/50"
                          }`}
                        >
                          <opt.icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="space-y-1 flex-1">
                    <Label className="text-[11px] text-muted-foreground">Emoji / Ícone</Label>
                    <Input value={button.iconEmoji || ""} onChange={(e) => onUpdate(button.id, { iconEmoji: e.target.value })} placeholder="💬" className="text-sm h-8 text-center text-lg" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label className="text-[11px] text-muted-foreground">Badge (canto)</Label>
                    <Input value={button.badgeLabel || ""} onChange={(e) => onUpdate(button.id, { badgeLabel: e.target.value })} placeholder="NOVO · 🔥" className="text-sm h-8" />
                  </div>
                  {button.badgeLabel && (
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Cor</Label>
                      <div className="relative w-8 h-8 rounded-lg border border-border overflow-hidden cursor-pointer">
                        <input type="color" value={button.badgeColor || "#ef4444"} onChange={(e) => onUpdate(button.id, { badgeColor: e.target.value })}
                          className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                        <div className="w-full h-full rounded-lg" style={{ backgroundColor: button.badgeColor || "#ef4444" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Destino ─────────────────────────────────────────────── */}
              <div className="py-3 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3 w-3" /> Destino
                </p>
                <Select
                  value={button.linkType || "external"}
                  onValueChange={(val: LinkType) => {
                    const newUrl = button.linkValue ? generateUrl(val, button.linkValue, button.whatsappMessage) : "";
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
                            const url = generateUrl(currentType, val, button.whatsappMessage);
                            onUpdate(button.id, { linkValue: val, url });
                          }}
                          placeholder={opt.placeholder}
                          className={`text-sm h-9 font-mono ${currentType !== "external" ? "pl-7" : ""}`}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">{opt.helper}</p>
                      {currentType === "whatsapp" && (
                        <div className="space-y-1.5 pt-1">
                          <Label className="text-[11px] text-muted-foreground">Mensagem pré-preenchida (opcional)</Label>
                          <Input
                            value={button.whatsappMessage ?? ""}
                            onChange={(e) => {
                              const msg = e.target.value;
                              const linkVal = button.linkValue ?? "";
                              const url = generateUrl("whatsapp", linkVal, msg);
                              onUpdate(button.id, { whatsappMessage: msg, url });
                            }}
                            placeholder="Ex: Olá! Gostaria de saber mais sobre..."
                            className="text-sm h-9"
                          />
                          <p className="text-[10px] text-muted-foreground">O visitante vai ver essa mensagem pronta no WhatsApp ao clicar</p>
                        </div>
                      )}
                      {button.url && (
                        <p className="text-[10px] text-primary font-mono truncate">
                          → {button.url}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ── Imagem ──────────────────────────────────────────────── */}
              {(button.buttonStyle === undefined || button.buttonStyle === 'card') && (
                <div className="py-3 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <ArrowLeftRight className="h-3 w-3 inline mr-1" />Imagem
                  </p>
                  <ImageUploader
                    value={button.imageUrl || ""}
                    onChange={(url) => onUpdate(button.id, { imageUrl: url })}
                    aspectRatio={3 / 4}
                    label="Imagem do Card (opcional)"
                    compact
                  />
                  {button.imageUrl && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Posição</Label>
                        <div className="flex gap-1">
                          <button onClick={() => onUpdate(button.id, { imagePosition: "left" })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${imgPos === "left" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border/50"}`}>
                            ← Esq.
                          </button>
                          <button onClick={() => onUpdate(button.id, { imagePosition: "right" })}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${imgPos === "right" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border/50"}`}>
                            Dir. →
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Opacidade: {imgOpacity}%</Label>
                        <Slider value={[imgOpacity]} onValueChange={([v]) => onUpdate(button.id, { imageOpacity: v })} min={10} max={100} step={5} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Tamanho: {imgSize}%</Label>
                        <Slider value={[imgSize]} onValueChange={([v]) => onUpdate(button.id, { imageSize: v })} min={30} max={70} step={5} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Cor ─────────────────────────────────────────────────── */}
              {(button.buttonStyle === undefined || button.buttonStyle === 'card' || button.buttonStyle === 'pill') && (
                <div className="py-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cor do Botão</p>

                  {/* Mode tabs */}
                  <div className="flex gap-0.5 p-0.5 rounded-lg bg-secondary/60 border border-border/30">
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
                          title={g.label}
                          className={`h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                            button.gradientColor === g.value
                              ? "border-foreground scale-110 shadow-lg"
                              : "border-transparent hover:border-border"
                          }`}
                          style={{ background: g.css }}
                        />
                      ))}
                    </div>
                  )}

                  {colorState.mode === "solid" && (
                    <div className="flex items-center gap-2">
                      <div className="relative w-9 h-9 rounded-lg border border-border overflow-hidden cursor-pointer shrink-0">
                        <input type="color" value={colorState.solidColor}
                          onChange={(e) => { setColorState(s => ({ ...s, solidColor: e.target.value })); onUpdate(button.id, { gradientColor: `custom:${e.target.value}:${e.target.value}` }); }}
                          className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                        <div className="w-full h-full" style={{ backgroundColor: colorState.solidColor }} />
                      </div>
                      <Input value={colorState.solidColor}
                        onChange={(e) => { setColorState(s => ({ ...s, solidColor: e.target.value })); onUpdate(button.id, { gradientColor: `custom:${e.target.value}:${e.target.value}` }); }}
                        className="text-xs h-9 font-mono flex-1" placeholder="#2563eb" />
                    </div>
                  )}

                  {colorState.mode === "gradient" && (
                    <div className="space-y-2">
                      <div className="h-8 rounded-lg border border-border/50" style={{ background: `linear-gradient(135deg, ${colorState.customFrom}, ${colorState.customTo})` }} />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden cursor-pointer shrink-0">
                            <input type="color" value={colorState.customFrom} onChange={(e) => setColorState(s => ({ ...s, customFrom: e.target.value }))}
                              className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                            <div className="w-full h-full" style={{ backgroundColor: colorState.customFrom }} />
                          </div>
                          <Input value={colorState.customFrom} onChange={(e) => setColorState(s => ({ ...s, customFrom: e.target.value }))} className="text-[10px] h-7 font-mono" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="relative w-7 h-7 rounded-md border border-border overflow-hidden cursor-pointer shrink-0">
                            <input type="color" value={colorState.customTo} onChange={(e) => setColorState(s => ({ ...s, customTo: e.target.value }))}
                              className="absolute inset-0 w-[150%] h-[150%] -translate-x-[16%] -translate-y-[16%] cursor-pointer border-0 p-0 opacity-0" />
                            <div className="w-full h-full" style={{ backgroundColor: colorState.customTo }} />
                          </div>
                          <Input value={colorState.customTo} onChange={(e) => setColorState(s => ({ ...s, customTo: e.target.value }))} className="text-[10px] h-7 font-mono" />
                        </div>
                      </div>
                      <button
                        onClick={() => onUpdate(button.id, { gradientColor: `custom:${colorState.customFrom}:${colorState.customTo}` })}
                        className="w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                      >
                        Aplicar degradê
                      </button>
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
