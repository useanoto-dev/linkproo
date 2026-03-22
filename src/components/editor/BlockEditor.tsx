import React from "react";
import { SmartLink, SmartLinkButton, LinkBlock, BlockType, FaqItem, GalleryImage, SubPage, CarouselSlide, StatItem } from "@/types/smart-link";
import { PUBLISHED_DOMAIN } from "@/hooks/use-links";
import { ButtonBlockEditor } from "./ButtonBlockEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical, CopyPlus, AlignLeft, AlignCenter, AlignRight, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader, buildButtonPresets } from "./ImageUploader";
import { Slider } from "@/components/ui/slider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useCallback, memo, useState, useRef, useEffect } from "react";
import { checkSlugAvailability, normalizeSlug } from "@/lib/slug-utils";

// ─── Module-level constants (never re-created on render) ──────────────────────

const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  info: "Informações",
  button: "Botão",
  "image-button": "Botão Imagem",
  badges: "Badges",
  text: "Texto",
  separator: "Separador",
  cta: "CTA",
  image: "Imagem",
  header: "Título",
  spacer: "Espaçador",
  video: "Vídeo",
  countdown: "Countdown",
  faq: "FAQ",
  gallery: "Galeria",
  testimonial: "Depoimento",
  stats: "Números/Stats",
  product: "Produto",
  "email-capture": "Captura Email",
  spotify: "Spotify",
  map: "Mapa",
  carousel: "Carrossel",
  banner: "Banner Promo",
  html: "HTML Customizado",
  "animated-button": "Botão Animado",
};

const ANIM_STYLE_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp', color: 'bg-green-700' },
  { value: 'location', label: 'Localização', color: 'bg-blue-900' },
  { value: 'schedule', label: 'Agendamento', color: 'bg-blue-200 !text-blue-900' },
  { value: 'cta', label: 'CTA Custom', color: 'bg-purple-700' },
  { value: 'instagram', label: 'Instagram', color: 'bg-pink-600' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-gray-900' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600' },
  { value: 'phone', label: 'Telefone', color: 'bg-blue-700' },
  { value: 'email', label: 'E-mail', color: 'bg-teal-700' },
  { value: 'telegram', label: 'Telegram', color: 'bg-sky-600' },
] as const;

const BUSINESS_NAME_SIZE_OPTIONS = [
  { label: 'XS', size: 14 },
  { label: 'S',  size: 18 },
  { label: 'M',  size: 24 },
  { label: 'G',  size: 32 },
  { label: 'XG', size: 42 },
];

const BUSINESS_NAME_ALIGN_OPTIONS = [
  { value: "left" as const, Icon: AlignLeft },
  { value: "center" as const, Icon: AlignCenter },
  { value: "right" as const, Icon: AlignRight },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

class BlockErrorBoundary extends React.Component<
  { children: React.ReactNode; blockId: string; onRemove: (id: string) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-0 my-1 p-3 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-xs text-destructive">Erro neste bloco</span>
          </div>
          <button
            type="button"
            onClick={() => this.props.onRemove(this.props.blockId)}
            className="text-[10px] text-destructive/70 hover:text-destructive underline cursor-pointer"
          >
            Remover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface SubPageMode {
  page: SubPage;
  onUpdatePage: (updates: Partial<SubPage>) => void;
  onAddBlock: (type: BlockType, defaults?: Record<string, unknown>) => void;
  onInsertBlockAt: (type: BlockType, atIndex: number, defaults?: Record<string, unknown>) => void;
}

interface BlockEditorProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onInsertBlockAt?: (type: BlockType, atIndex: number, defaults?: Record<string, unknown>) => void;
  subPageMode?: SubPageMode;
  selectedElementId?: string;
  onElementSelected?: (id: string | null) => void;
}

// Unified item type for the sortable list
type UnifiedItem =
  | { kind: "button"; id: string; data: SmartLinkButton }
  | { kind: "block"; id: string; data: LinkBlock };

function getUnifiedItems(link: SmartLink): UnifiedItem[] {
  const buttonItems: UnifiedItem[] = link.buttons.map((b, i) => ({
    kind: "button",
    id: b.id,
    data: { ...b, order: b.order ?? i },
  }));
  const blockItems: UnifiedItem[] = link.blocks.map((b, i) => ({
    kind: "block",
    id: b.id,
    data: { ...b, order: b.order ?? (link.buttons.length + i) },
  }));
  return [...buttonItems, ...blockItems].sort(
    (a, b) => (a.data.order ?? 0) - (b.data.order ?? 0)
  );
}

function getUnifiedItemsForMode(link: SmartLink, subPageMode?: SubPageMode): UnifiedItem[] {
  if (subPageMode) {
    return subPageMode.page.blocks
      .map((b, i) => ({
        kind: "block" as const,
        id: b.id,
        data: { ...b, order: b.order ?? i },
      }))
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
  }
  return getUnifiedItems(link);
}

const SortableButton = memo(function SortableButton({
  button,
  index,
  onUpdate,
  onRemove,
  pages,
}: {
  button: SmartLinkButton;
  index: number;
  onUpdate: (id: string, updates: Partial<SmartLinkButton>) => void;
  onRemove: (id: string) => void;
  pages: SubPage[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: button.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ButtonBlockEditor
        button={button}
        index={index}
        onUpdate={onUpdate}
        onRemove={onRemove}
        dragHandleProps={listeners}
        pages={pages}
      />
    </div>
  );
});

const SortableBlock = memo(function SortableBlock({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  pages,
  openKey,
}: {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  pages?: SubPage[];
  openKey?: number;  // incrementa quando o usuário clica no elemento no preview
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const buttonPresets = useMemo(
    () => buildButtonPresets(block.buttonHeight ?? 110),
    [block.buttonHeight]
  );

  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (openKey) setOpen(true);
  }, [openKey]);

  const applyTextFormat = useCallback(
    (tag: string, url?: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const current = block.content || "";
      const selected = current.slice(start, end);
      let replacement: string;
      if (tag === "a") {
        const href = url || "";
        const text = selected || "link";
        replacement = `<a href="${href}" target="_blank">${text}</a>`;
      } else {
        const text = selected || (tag === "b" ? "texto em negrito" : "texto em itálico");
        replacement = `<${tag}>${text}</${tag}>`;
      }
      const newContent = current.slice(0, start) + replacement + current.slice(end);
      onUpdate(block.id, { content: newContent });
      // Restore focus after React re-render
      requestAnimationFrame(() => {
        el.focus();
        const newCursor = start + replacement.length;
        el.setSelectionRange(newCursor, newCursor);
      });
    },
    [block.id, block.content, onUpdate]
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="editor-card">
      {/* Compact header — click anywhere to expand/collapse */}
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/30 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing p-1.5 flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold text-foreground flex-1 truncate">{BLOCK_LABELS[block.type]}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}
          className="p-1.5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          title="Duplicar"
        >
          <CopyPlus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          className="p-1.5 flex items-center justify-center text-destructive/70 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <div className="p-1.5 text-muted-foreground">
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </div>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border-t border-border/30">
        {(block.type === "text" || block.type === "cta") && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {block.type === "cta" ? "Título do CTA" : "Texto"}
              </Label>
              {block.type === "text" && (
                <div className="flex gap-1 mb-1">
                  <button
                    type="button"
                    title="Negrito"
                    className="px-2 py-0.5 rounded text-xs font-bold border border-border hover:bg-secondary"
                    onClick={() => applyTextFormat("b")}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    title="Itálico"
                    className="px-2 py-0.5 rounded text-xs font-bold border border-border hover:bg-secondary italic"
                    onClick={() => applyTextFormat("i")}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    title="Link"
                    className="px-2 py-0.5 rounded text-xs font-bold border border-border hover:bg-secondary"
                    onClick={() => {
                      const url = window.prompt("URL do link:");
                      if (url !== null) applyTextFormat("a", url);
                    }}
                  >
                    🔗
                  </button>
                </div>
              )}
              <Textarea
                ref={block.type === "text" ? textareaRef : undefined}
                value={block.content || ""}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder={block.type === "cta" ? "Transforme Seus Projetos em Realidade" : "Seu texto aqui..."}
                className="text-sm min-h-[60px]"
              />
            </div>
            {block.type === "cta" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Subtítulo</Label>
                <Textarea
                  value={block.subtitle || ""}
                  onChange={(e) => onUpdate(block.id, { subtitle: e.target.value })}
                  placeholder="Descrição do CTA..."
                  className="text-sm min-h-[60px]"
                />
              </div>
            )}
            {/* Cor do texto */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Cor do texto</Label>
              <input
                type="color"
                value={block.blockTextColor || "#ffffff"}
                onChange={(e) => onUpdate(block.id, { blockTextColor: e.target.value })}
                className="h-7 w-10 rounded cursor-pointer border border-border bg-transparent p-0.5"
              />
            </div>
            {/* Alinhamento */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Alinhamento</Label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdate(block.id, { blockTextAlign: align })}
                    className={`p-1 rounded text-xs ${(block.blockTextAlign || 'center') === align ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {align === 'left' ? '⬅' : align === 'center' ? '↔' : '➡'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {block.type === "header" && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input
                value={block.content || ""}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                placeholder="Nossos Serviços"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Emoji (opcional)</Label>
              <Input
                value={block.emoji || ""}
                onChange={(e) => onUpdate(block.id, { emoji: e.target.value })}
                placeholder="🚀"
                className="text-sm h-9 w-20 text-center text-lg"
              />
            </div>
            {/* Cor do texto */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Cor do texto</Label>
              <input
                type="color"
                value={block.blockTextColor || "#ffffff"}
                onChange={(e) => onUpdate(block.id, { blockTextColor: e.target.value })}
                className="h-7 w-10 rounded cursor-pointer border border-border bg-transparent p-0.5"
              />
            </div>
            {/* Alinhamento */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Alinhamento</Label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdate(block.id, { blockTextAlign: align })}
                    className={`p-1 rounded text-xs ${(block.blockTextAlign || 'center') === align ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {align === 'left' ? '⬅' : align === 'center' ? '↔' : '➡'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {block.type === "image" && (
          <>
            <ImageUploader
              value={block.imageUrl || ""}
              onChange={(url) => onUpdate(block.id, { imageUrl: url })}
              aspectRatio={16 / 9}
              label="Imagem"
            />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Arredondamento: {block.borderRadius ?? 12}px</Label>
              <Slider
                value={[block.borderRadius ?? 12]}
                onValueChange={([v]) => onUpdate(block.id, { borderRadius: v })}
                min={0}
                max={32}
                step={2}
              />
            </div>
          </>
        )}

        {block.type === "video" && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">URL do Vídeo (YouTube ou Vimeo)</Label>
            <Input
              value={block.videoUrl || ""}
              onChange={(e) => onUpdate(block.id, { videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="text-sm h-9 font-mono"
            />
          </div>
        )}

        {block.type === "spacer" && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Altura: {block.height ?? 24}px</Label>
            <Slider
              value={[block.height ?? 24]}
              onValueChange={([v]) => onUpdate(block.id, { height: v })}
              min={8}
              max={80}
              step={4}
            />
          </div>
        )}

        {block.type === "badges" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Badges (emoji:label, separados por vírgula)</Label>
            <Input
              value={(block.badges || []).map(b => `${b.emoji}:${b.label}`).join(", ")}
              onChange={(e) => {
                const badges = e.target.value.split(",").map((s, i) => {
                  const parts = s.trim().split(":");
                  return {
                    id: `badge-${i}`,
                    emoji: parts[0]?.trim() || "⭐",
                    label: parts[1]?.trim() || parts[0]?.trim() || "",
                    color: ["bg-blue-500", "bg-green-500", "bg-red-500", "bg-purple-500", "bg-orange-500"][i % 5],
                  };
                }).filter(b => b.label);
                onUpdate(block.id, { badges });
              }}
              placeholder="⭐:Qualidade, 🛡️:Garantia, 💰:Preços Acessíveis"
              className="text-sm h-9"
            />
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

        {block.type === "separator" && (
          <p className="text-xs text-muted-foreground text-center">Linha divisora visual</p>
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

        {/* FAQ */}
        {block.type === "faq" && (
          <div className="space-y-3">
            {(block.faqItems || []).map((item, fi) => (
              <div key={item.id} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">#{fi + 1}</span>
                  <button
                    onClick={() => {
                      const items = (block.faqItems || []).filter((f) => f.id !== item.id);
                      onUpdate(block.id, { faqItems: items });
                    }}
                    className="ml-auto p-1 text-destructive/60 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <Input
                  value={item.question}
                  onChange={(e) => {
                    const items = (block.faqItems || []).map((f) =>
                      f.id === item.id ? { ...f, question: e.target.value } : f
                    );
                    onUpdate(block.id, { faqItems: items });
                  }}
                  placeholder="Pergunta"
                  className="text-sm h-8"
                />
                <Textarea
                  value={item.answer}
                  onChange={(e) => {
                    const items = (block.faqItems || []).map((f) =>
                      f.id === item.id ? { ...f, answer: e.target.value } : f
                    );
                    onUpdate(block.id, { faqItems: items });
                  }}
                  placeholder="Resposta"
                  className="text-sm min-h-[50px]"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newItem: FaqItem = { id: `faq-${Date.now()}`, question: "", answer: "" };
                onUpdate(block.id, { faqItems: [...(block.faqItems || []), newItem] });
              }}
              className="w-full py-2 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              + Adicionar pergunta
            </button>
          </div>
        )}

        {/* Gallery */}
        {block.type === "gallery" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(block.galleryImages || []).map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border/40">
                  <img src={img.url} alt="" className="w-full h-16 object-cover" />
                  <button
                    onClick={() => {
                      const images = (block.galleryImages || []).filter((g) => g.id !== img.id);
                      onUpdate(block.id, { galleryImages: images });
                    }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <ImageUploader
              value=""
              onChange={(url) => {
                const newImg: GalleryImage = { id: `gal-${Date.now()}`, url };
                onUpdate(block.id, { galleryImages: [...(block.galleryImages || []), newImg] });
              }}
              aspectRatio={1}
              label="Adicionar foto"
              compact
            />
          </div>
        )}

        {/* Testimonial */}
        {block.type === "testimonial" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <Input
                  value={block.testimonialName || ""}
                  onChange={e => onUpdate(block.id, { testimonialName: e.target.value })}
                  placeholder="Maria Silva"
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cargo / Empresa</Label>
                <Input
                  value={block.testimonialRole || ""}
                  onChange={e => onUpdate(block.id, { testimonialRole: e.target.value })}
                  placeholder="CEO, Empresa X"
                  className="text-sm h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Depoimento</Label>
              <Textarea
                value={block.content || ""}
                onChange={e => onUpdate(block.id, { content: e.target.value })}
                placeholder="Produto incrível, mudou minha vida..."
                className="text-sm min-h-[70px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Avaliação (estrelas)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => onUpdate(block.id, { testimonialRating: n })}
                    className={`text-xl transition-transform hover:scale-110 cursor-pointer ${n <= (block.testimonialRating ?? 5) ? "opacity-100" : "opacity-30"}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <ImageUploader
              value={block.testimonialAvatar || ""}
              onChange={url => onUpdate(block.id, { testimonialAvatar: url })}
              aspectRatio={1}
              label="Foto (opcional)"
              compact
            />
          </div>
        )}

        {/* Stats */}
        {block.type === "stats" && (
          <div className="space-y-3">
            <p className="text-[10px] text-muted-foreground">Ex: "10k" + "Clientes", "4.9★" + "Avaliação"</p>
            {(block.statItems || []).map((stat) => (
              <div key={stat.id} className="flex gap-2 items-center">
                <Input
                  value={stat.value}
                  onChange={e => {
                    const items = (block.statItems || []).map(s => s.id === stat.id ? { ...s, value: e.target.value } : s);
                    onUpdate(block.id, { statItems: items });
                  }}
                  placeholder="10k"
                  className="text-sm h-8 w-20 text-center font-bold"
                />
                <Input
                  value={stat.label}
                  onChange={e => {
                    const items = (block.statItems || []).map(s => s.id === stat.id ? { ...s, label: e.target.value } : s);
                    onUpdate(block.id, { statItems: items });
                  }}
                  placeholder="Clientes"
                  className="text-sm h-8 flex-1"
                />
                <button
                  onClick={() => onUpdate(block.id, { statItems: (block.statItems || []).filter(s => s.id !== stat.id) })}
                  className="p-1.5 text-destructive/60 hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItem: StatItem = { id: `stat-${Date.now()}`, value: "", label: "" };
                onUpdate(block.id, { statItems: [...(block.statItems || []), newItem] });
              }}
              className="w-full py-2 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
            >
              + Adicionar stat
            </button>
          </div>
        )}

        {/* Product */}
        {block.type === "product" && (
          <div className="space-y-3">
            <ImageUploader
              value={block.productImage || ""}
              onChange={url => onUpdate(block.id, { productImage: url })}
              aspectRatio={4 / 3}
              label="Imagem do produto"
            />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome do Produto</Label>
              <Input
                value={block.productName || ""}
                onChange={e => onUpdate(block.id, { productName: e.target.value })}
                placeholder="Camiseta Premium"
                className="text-sm h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Preço</Label>
                <Input
                  value={block.productPrice || ""}
                  onChange={e => onUpdate(block.id, { productPrice: e.target.value })}
                  placeholder="R$ 89,90"
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Preço antigo (riscado)</Label>
                <Input
                  value={block.productOldPrice || ""}
                  onChange={e => onUpdate(block.id, { productOldPrice: e.target.value })}
                  placeholder="R$ 129,90"
                  className="text-sm h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Descrição curta</Label>
              <Textarea
                value={block.productDescription || ""}
                onChange={e => onUpdate(block.id, { productDescription: e.target.value })}
                placeholder="Material 100% algodão..."
                className="text-sm min-h-[50px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Texto do botão</Label>
                <Input
                  value={block.productButtonLabel || ""}
                  onChange={e => onUpdate(block.id, { productButtonLabel: e.target.value })}
                  placeholder="Comprar agora"
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Link do botão</Label>
                <Input
                  value={block.productButtonUrl || ""}
                  onChange={e => onUpdate(block.id, { productButtonUrl: e.target.value })}
                  placeholder="https://..."
                  className="text-sm h-9 font-mono"
                />
              </div>
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

        {/* Spotify */}
        {block.type === "spotify" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">URL do Spotify</Label>
              <Input
                value={block.spotifyUrl || ""}
                onChange={e => onUpdate(block.id, { spotifyUrl: e.target.value })}
                placeholder="https://open.spotify.com/track/..."
                className="text-sm h-9 font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Cole o link de música, playlist ou álbum</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`spotify-compact-${block.id}`}
                checked={block.spotifyCompact ?? false}
                onChange={e => onUpdate(block.id, { spotifyCompact: e.target.checked })}
                className="rounded cursor-pointer"
              />
              <Label htmlFor={`spotify-compact-${block.id}`} className="text-xs text-muted-foreground cursor-pointer">
                Modo compacto (altura menor)
              </Label>
            </div>
          </div>
        )}

        {/* Map */}
        {block.type === "map" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Endereço ou nome do local</Label>
              <Input
                value={block.mapAddress || ""}
                onChange={e => onUpdate(block.id, { mapAddress: e.target.value })}
                placeholder="Ex: Av. Paulista 1000, São Paulo"
                className="text-sm h-9"
              />
              <p className="text-[10px] text-muted-foreground">
                Recomendado: preencha o endereço acima para mostrar o mapa automaticamente.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Link externo (opcional)</Label>
              <Textarea
                value={block.mapUrl || ""}
                onChange={e => onUpdate(block.id, { mapUrl: e.target.value })}
                placeholder="https://maps.app.goo.gl/... ou https://www.google.com/maps/embed?pb=..."
                className="text-sm min-h-[60px] font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Cole aqui um link de compartilhamento ou URL embed. Usado como botão "Abrir no Google Maps".
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Altura: {block.mapHeight ?? 220}px</Label>
              <Slider
                value={[block.mapHeight ?? 220]}
                onValueChange={([v]) => onUpdate(block.id, { mapHeight: v })}
                min={150}
                max={400}
                step={10}
              />
            </div>
          </div>
        )}

        {/* HTML Livre */}
        {block.type === "html" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Conteúdo HTML</Label>
              <Textarea
                value={block.htmlContent || ""}
                onChange={e => onUpdate(block.id, { htmlContent: e.target.value })}
                placeholder="<div>Seu HTML aqui...</div>"
                className="font-mono text-xs min-h-[120px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Altura: {block.htmlHeight ? `${block.htmlHeight}px` : "Automática"}
              </Label>
              <Slider
                value={[block.htmlHeight || 0]}
                onValueChange={([v]) => onUpdate(block.id, { htmlHeight: v === 0 ? undefined : v })}
                min={0}
                max={800}
                step={10}
              />
              <p className="text-[10px] text-muted-foreground mt-1">0 = altura automática</p>
            </div>
          </div>
        )}

        {/* Carousel */}
        {block.type === "carousel" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(block.carouselSlides || []).map((slide) => (
                <div key={slide.id} className="relative group rounded-lg overflow-hidden border border-border/40">
                  <img src={slide.url} alt="" className="w-full h-16 object-cover" />
                  <button
                    onClick={() => onUpdate(block.id, { carouselSlides: (block.carouselSlides || []).filter(s => s.id !== slide.id) })}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <ImageUploader
              value=""
              onChange={url => {
                const newSlide: CarouselSlide = { id: `slide-${Date.now()}`, url };
                onUpdate(block.id, { carouselSlides: [...(block.carouselSlides || []), newSlide] });
              }}
              aspectRatio={16 / 9}
              label="Adicionar slide"
              compact
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`carousel-auto-${block.id}`}
                checked={block.carouselAutoplay ?? true}
                onChange={e => onUpdate(block.id, { carouselAutoplay: e.target.checked })}
                className="cursor-pointer"
              />
              <Label htmlFor={`carousel-auto-${block.id}`} className="text-xs text-muted-foreground cursor-pointer">
                Autoplay
              </Label>
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

        {/* Banner Promo */}
        {block.type === "banner" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tag / Etiqueta (ex: 🔥 OFERTA)</Label>
              <Input
                value={block.bannerTag || ""}
                onChange={e => onUpdate(block.id, { bannerTag: e.target.value })}
                placeholder="🔥 OFERTA ESPECIAL"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input
                value={block.content || ""}
                onChange={e => onUpdate(block.id, { content: e.target.value })}
                placeholder="50% OFF em todo o site"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subtítulo</Label>
              <Input
                value={block.subtitle || ""}
                onChange={e => onUpdate(block.id, { subtitle: e.target.value })}
                placeholder="Somente hoje, não perca!"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cor de fundo (hex)</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={block.bannerBg || "#6366f1"}
                  onChange={e => onUpdate(block.id, { bannerBg: e.target.value })}
                  className="w-10 h-9 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={block.bannerBg || "#6366f1"}
                  onChange={e => onUpdate(block.id, { bannerBg: e.target.value })}
                  className="text-sm h-9 font-mono flex-1"
                />
              </div>
            </div>
          </div>
        )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const SortableItem = memo(function SortableItem({
  item,
  buttonIndex,
  onUpdateButton,
  onRemoveButton,
  onDuplicateButton: _onDuplicateButton,
  onUpdateBlock,
  onRemoveBlock,
  onDuplicateBlock,
  pages,
  openKey,
}: {
  item: UnifiedItem;
  buttonIndex: number;
  onUpdateButton: (id: string, updates: Partial<SmartLinkButton>) => void;
  onRemoveButton: (id: string) => void;
  onDuplicateButton: (id: string) => void;  // accepted but intentionally unused in SortableItem
  onUpdateBlock: (id: string, updates: Partial<LinkBlock>) => void;
  onRemoveBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  pages: SubPage[];
  openKey?: number;  // incrementa quando o usuário clica no elemento no preview
}) {
  if (item.kind === "button") {
    return (
      <BlockErrorBoundary blockId={item.id} onRemove={onRemoveButton}>
        <SortableButton
          button={item.data}
          index={buttonIndex}
          onUpdate={onUpdateButton}
          onRemove={onRemoveButton}
          pages={pages}
        />
      </BlockErrorBoundary>
    );
  }
  return (
    <BlockErrorBoundary blockId={item.id} onRemove={onRemoveBlock}>
      <SortableBlock
        block={item.data}
        onUpdate={onUpdateBlock}
        onRemove={onRemoveBlock}
        onDuplicate={onDuplicateBlock}
        pages={pages}
        openKey={openKey}
      />
    </BlockErrorBoundary>
  );
});

export function BlockEditor({ link, onUpdateLink, onInsertBlockAt, subPageMode, selectedElementId, onElementSelected }: BlockEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isSubPage = !!subPageMode;

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const unifiedItems = useMemo(
    () => getUnifiedItemsForMode(link, subPageMode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [link.buttons, link.blocks, subPageMode?.page.blocks]
  );

  const updateBlocks = useCallback((newBlocks: LinkBlock[]) => {
    if (isSubPage) {
      subPageMode!.onUpdatePage({ blocks: newBlocks });
    } else {
      onUpdateLink({ blocks: newBlocks });
    }
  }, [isSubPage, subPageMode, onUpdateLink]);

  // Stable refs — callbacks read from these instead of capturing arrays in closure
  const buttonsRef = useRef(link.buttons);
  buttonsRef.current = link.buttons;
  const blocksRef = useRef(link.blocks);
  blocksRef.current = link.blocks;
  const subPageBlocksRef = useRef(isSubPage ? subPageMode!.page.blocks : link.blocks);
  subPageBlocksRef.current = isSubPage ? subPageMode!.page.blocks : link.blocks;

  // Refs for selected element scrolling
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedOpenKey, setSelectedOpenKey] = useState(0);
  useEffect(() => {
    if (selectedElementId && itemRefs.current[selectedElementId]) {
      itemRefs.current[selectedElementId]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setSelectedOpenKey(k => k + 1);  // força re-trigger mesmo se mesmo ID
    }
  }, [selectedElementId]);

  // Slug real-time availability state
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup slug debounce on unmount
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

  const updateButton = useCallback((id: string, updates: Partial<SmartLinkButton>) => {
    onUpdateLink({
      buttons: buttonsRef.current.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    });
  }, [onUpdateLink]);

  const removeButton = useCallback((id: string) => {
    onUpdateLink({ buttons: buttonsRef.current.filter((b) => b.id !== id) });
  }, [onUpdateLink]);

  const duplicateButton = useCallback((id: string) => {
    const btn = buttonsRef.current.find((b) => b.id === id);
    if (!btn) return;
    const maxOrder = Math.max(
      ...buttonsRef.current.map((b) => b.order ?? 0),
      ...blocksRef.current.map((b) => b.order ?? 0),
      0
    );
    const newBtn = { ...btn, id: `btn-${Date.now()}`, order: maxOrder + 1 };
    onUpdateLink({ buttons: [...buttonsRef.current, newBtn] });
  }, [onUpdateLink]);

  const updateBlock = useCallback((id: string, updates: Partial<LinkBlock>) => {
    const blocks = subPageBlocksRef.current;
    updateBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, [updateBlocks]);

  const removeBlock = useCallback((id: string) => {
    const blocks = subPageBlocksRef.current;
    updateBlocks(blocks.filter((b) => b.id !== id));
  }, [updateBlocks]);

  const duplicateBlock = useCallback((id: string) => {
    const blocks = subPageBlocksRef.current;
    const blk = blocks.find((b) => b.id === id);
    if (!blk) return;
    const maxOrder = Math.max(
      ...(isSubPage ? [] : buttonsRef.current.map((b) => b.order ?? 0)),
      ...blocks.map((b) => b.order ?? 0),
      0
    );
    const newBlk = { ...blk, id: `blk-${Date.now()}`, order: maxOrder + 1 };
    updateBlocks([...blocks, newBlk]);
  }, [isSubPage, updateBlocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const oldIndex = unifiedItems.findIndex((item) => item.id === activeId);
    const newIndex = unifiedItems.findIndex((item) => item.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove([...unifiedItems], oldIndex, newIndex);

    if (isSubPage) {
      const newBlocks: LinkBlock[] = reordered.map((item, i) => ({ ...(item.data as LinkBlock), order: i }));
      updateBlocks(newBlocks);
      return;
    }

    // Assign new order values and split back into buttons/blocks
    const newButtons: SmartLinkButton[] = [];
    const newBlocks: LinkBlock[] = [];

    reordered.forEach((item, i) => {
      if (item.kind === "button") {
        newButtons.push({ ...item.data, order: i });
      } else {
        newBlocks.push({ ...item.data, order: i });
      }
    });

    onUpdateLink({ buttons: newButtons, blocks: newBlocks });
  };

  // Track button index for display purposes
  let buttonCounter = 0;

  const handleDropInsert = (type: BlockType, atIndex: number, defaults: Record<string, unknown>) => {
    if (isSubPage) {
      subPageMode!.onInsertBlockAt(type, atIndex, defaults);
    } else {
      onInsertBlockAt?.(type, atIndex, defaults);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hero & Info — hidden in sub-page mode */}
      {!isSubPage && <div className="rounded-xl border border-border bg-card p-3 space-y-3">
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
            {/* Slug availability indicator */}
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
      </div>}

      {/* Unified sortable list */}
      {unifiedItems.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Elementos</h3>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={unifiedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {unifiedItems.map((item, itemIndex) => {
                  const bi = item.kind === "button" ? buttonCounter++ : 0;
                  const isSelectedItem = !isSubPage && selectedElementId === item.id;
                  return (
                    <div
                      key={item.id}
                      ref={(el) => { itemRefs.current[item.id] = el; }}
                      className={`rounded-xl transition-all duration-200 ${isSelectedItem ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                      onClick={!isSubPage && onElementSelected ? () => onElementSelected(item.id) : undefined}
                      onDragOver={(e) => {
                        if (!e.dataTransfer.types.includes("application/x-block-type")) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                        setDragOverIndex(itemIndex);
                      }}
                      onDragLeave={(e) => {
                        // Only clear if leaving the outer div entirely (not entering a child)
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        const type = e.dataTransfer.getData("application/x-block-type") as BlockType;
                        if (!type) return;
                        e.preventDefault();
                        const rawDefaults = e.dataTransfer.getData("application/x-block-defaults");
                        const defaults = rawDefaults ? (JSON.parse(rawDefaults) as Record<string, unknown>) : {};
                        handleDropInsert(type, itemIndex, defaults);
                        setDragOverIndex(null);
                      }}
                    >
                      {dragOverIndex === itemIndex && (
                        <div className="h-0.5 bg-primary rounded-full mx-2 mb-1.5 opacity-90" />
                      )}
                      <SortableItem
                        item={item}
                        buttonIndex={bi}
                        onUpdateButton={updateButton}
                        onRemoveButton={removeButton}
                        onDuplicateButton={duplicateButton}
                        onUpdateBlock={updateBlock}
                        onRemoveBlock={removeBlock}
                        onDuplicateBlock={duplicateBlock}
                        pages={link.pages || []}
                        openKey={isSelectedItem ? selectedOpenKey : 0}
                      />
                    </div>
                  );
                })}
                {/* Drop zone after the last item */}
                <div
                  className={`transition-all duration-100 rounded-xl border-2 border-dashed ${
                    dragOverIndex === unifiedItems.length
                      ? "border-primary/70 bg-primary/5 py-3"
                      : "border-transparent py-0.5"
                  }`}
                  onDragOver={(e) => {
                    if (!e.dataTransfer.types.includes("application/x-block-type")) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                    setDragOverIndex(unifiedItems.length);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverIndex(null);
                    }
                  }}
                  onDrop={(e) => {
                    const type = e.dataTransfer.getData("application/x-block-type") as BlockType;
                    if (!type) return;
                    e.preventDefault();
                    const rawDefaults = e.dataTransfer.getData("application/x-block-defaults");
                    const defaults = rawDefaults ? (JSON.parse(rawDefaults) as Record<string, unknown>) : {};
                    handleDropInsert(type, unifiedItems.length, defaults);
                    setDragOverIndex(null);
                  }}
                >
                  {dragOverIndex === unifiedItems.length && (
                    <p className="text-center text-xs text-primary font-medium pointer-events-none">Solte aqui para adicionar ao final</p>
                  )}
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div
          className={`transition-all duration-100 rounded-xl border-2 border-dashed text-center py-12 text-muted-foreground ${
            dragOverIndex === 0
              ? "border-primary/70 bg-primary/5"
              : "border-border/30"
          }`}
          onDragOver={(e) => {
            if (!e.dataTransfer.types.includes("application/x-block-type")) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            setDragOverIndex(0);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOverIndex(null);
            }
          }}
          onDrop={(e) => {
            const type = e.dataTransfer.getData("application/x-block-type") as BlockType;
            if (!type) return;
            e.preventDefault();
            const rawDefaults = e.dataTransfer.getData("application/x-block-defaults");
            const defaults = rawDefaults ? (JSON.parse(rawDefaults) as Record<string, unknown>) : {};
            handleDropInsert(type, 0, defaults);
            setDragOverIndex(null);
          }}
        >
          {dragOverIndex === 0 ? (
            <p className="text-sm text-primary font-medium">Solte aqui para adicionar</p>
          ) : (
            <>
              <p className="text-sm">Adicione elementos usando o painel à esquerda</p>
              <p className="text-xs mt-1">Clique ou arraste elementos para cá</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
