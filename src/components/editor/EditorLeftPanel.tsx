import { useState, useMemo, useCallback } from "react";
import { SmartLink, SmartLinkButton, LinkBlock } from "@/types/smart-link";
import { useEditorStore } from "@/stores/editor-store";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Palette, Sparkles, FileText, Plus, ChevronDown,
  Zap, MousePointerClick, ImagePlus, Heading, Type,
  Image as ImageIcon, Video, Images, GalleryHorizontal, Code,
  MessageSquare, Timer, Star, BarChart3, ShoppingBag,
  Mail, Megaphone, Users, Music, MapPin, HelpCircle,
  Award, Space, Minus as MinusIcon, Trash2, ArrowUp, ArrowDown,
  Info, Copy, GripVertical,
} from "lucide-react";
import { getUnifiedItems, UnifiedItem } from "./blocks/unified-items";
import { BLOCK_LABELS } from "./blocks/constants";
import { BlockType } from "@/types/smart-link";
import type React from "react";

// ─── Block type → icon ────────────────────────────────────────────────────────

const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'animated-button': Zap, 'button': MousePointerClick, 'image-button': ImagePlus,
  'header': Heading, 'text': Type, 'image': ImageIcon, 'video': Video,
  'gallery': Images, 'carousel': GalleryHorizontal, 'html': Code,
  'cta': MessageSquare, 'countdown': Timer, 'testimonial': Star,
  'stats': BarChart3, 'product': ShoppingBag, 'email-capture': Mail,
  'banner': Megaphone, 'contacts': Users, 'spotify': Music,
  'map': MapPin, 'faq': HelpCircle, 'badges': Award,
  'spacer': Space, 'separator': MinusIcon,
};

const BLOCK_CATEGORY: Record<string, string> = {
  'animated-button': 'BOTÕES', 'button': 'BOTÕES', 'image-button': 'BOTÕES',
  'header': 'TEXTO', 'text': 'TEXTO',
  'image': 'MÍDIA', 'video': 'MÍDIA', 'gallery': 'MÍDIA',
  'carousel': 'MÍDIA', 'html': 'MÍDIA',
  'cta': 'CONVERSÃO', 'countdown': 'CONVERSÃO', 'testimonial': 'CONVERSÃO',
  'stats': 'CONVERSÃO', 'product': 'CONVERSÃO', 'email-capture': 'CONVERSÃO',
  'banner': 'CONVERSÃO',
  'contacts': 'SOCIAL', 'spotify': 'SOCIAL', 'map': 'SOCIAL',
  'faq': 'SOCIAL', 'badges': 'SOCIAL',
  'spacer': 'LAYOUT', 'separator': 'LAYOUT',
};

const CATEGORY_COLORS: Record<string, string> = {
  'BOTÕES': 'text-pink-400', 'TEXTO': 'text-purple-400', 'MÍDIA': 'text-blue-400',
  'CONVERSÃO': 'text-green-400', 'SOCIAL': 'text-orange-400', 'LAYOUT': 'text-gray-400',
};

const CATEGORY_ORDER = ['BOTÕES', 'TEXTO', 'MÍDIA', 'CONVERSÃO', 'SOCIAL', 'LAYOUT'];

function getItemCategory(item: UnifiedItem): string {
  if (item.kind === 'button') return 'BOTÕES';
  return BLOCK_CATEGORY[(item.data as { type: string }).type] || 'OUTROS';
}

function getItemLabel(item: UnifiedItem): string {
  if (item.kind === 'button') return (item.data as { label?: string }).label || 'Botão';
  const block = item.data as { content?: string; animButtonLabel?: string; type: string };
  if (block.content) return block.content.replace(/<[^>]+>/g, '').slice(0, 22) || BLOCK_LABELS[block.type as BlockType] || block.type;
  if (block.animButtonLabel) return (block.animButtonLabel as string).slice(0, 22);
  return BLOCK_LABELS[block.type as BlockType] || block.type;
}

function getItemIcon(item: UnifiedItem): React.ComponentType<{ className?: string }> {
  if (item.kind === 'button') return MousePointerClick;
  return BLOCK_ICONS[(item.data as { type: string }).type] || Code;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorLeftPanelProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onRemoveItem: (id: string, kind: 'button' | 'block') => void;
}

// ─── Sortable Item ────────────────────────────────────────────────────────────

interface SortableBlockItemProps {
  item: UnifiedItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onRemoveItem: (id: string, kind: 'button' | 'block') => void;
  onDuplicate: (id: string, kind: 'button' | 'block') => void;
}

function SortableBlockItem({
  item, isSelected, onSelect, onMoveBlock, onRemoveItem, onDuplicate,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = getItemIcon(item);
  const label = getItemLabel(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(item.id)}
      className={`group relative flex items-center gap-1 px-1 h-8 cursor-pointer select-none transition-colors ${
        isSelected
          ? 'bg-primary/12 border-l-2 border-primary text-foreground'
          : 'hover:bg-secondary/30 border-l-2 border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-40 hover:!opacity-80 shrink-0 flex items-center justify-center h-4 w-4 rounded cursor-grab active:cursor-grabbing transition-opacity touch-none"
        title="Arrastar para reordenar"
      >
        <GripVertical className="h-3 w-3" />
      </button>

      <Icon className={`h-3 w-3 shrink-0 ${isSelected ? 'text-primary' : ''}`} />
      <span className="flex-1 text-[10px] truncate min-w-0 pr-1">
        {label}
      </span>

      {/* Actions on hover */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDuplicate(item.id, item.kind); }}
          className="h-4 w-4 flex items-center justify-center rounded hover:bg-secondary/60 transition-colors"
          title="Duplicar"
        >
          <Copy className="h-2.5 w-2.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveBlock(item.id, 'up'); }}
          className="h-4 w-4 flex items-center justify-center rounded hover:bg-secondary/60 transition-colors"
          title="Mover para cima"
        >
          <ArrowUp className="h-2.5 w-2.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveBlock(item.id, 'down'); }}
          className="h-4 w-4 flex items-center justify-center rounded hover:bg-secondary/60 transition-colors"
          title="Mover para baixo"
        >
          <ArrowDown className="h-2.5 w-2.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id, item.kind); }}
          className="h-4 w-4 flex items-center justify-center rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
          title="Remover"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorLeftPanel({ link, onUpdateLink, onMoveBlock, onRemoveItem }: EditorLeftPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  const openDrawer = useEditorStore((s) => s.ui.openDrawer);
  const selectedElementId = useEditorStore((s) => s.ui.selectedElementId);
  const setUI = useEditorStore((s) => s.setUI);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const selectItem = useCallback((id: string) => {
    setUI({ selectedElementId: id, openDrawer: null });
  }, [setUI]);

  const selectPanel = useCallback((panel: 'theme' | 'effects' | 'pages' | 'elements') => {
    setUI({ openDrawer: panel, selectedElementId: null });
  }, [setUI]);

  const duplicateItem = useCallback((id: string, kind: 'button' | 'block') => {
    const now = Date.now();

    // Find original item order so the duplicate lands right below it
    const allItems = getUnifiedItems(link);
    const original = allItems.find((i) => i.id === id);
    if (!original) return;

    const insertOrder = (original.data.order ?? 0) + 1;

    // Shift every item that sits at or after the insert position
    const bumpedButtons = link.buttons.map((b) =>
      (b.order ?? 0) >= insertOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
    );
    const bumpedBlocks = link.blocks.map((b) =>
      (b.order ?? 0) >= insertOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
    );

    if (kind === 'button') {
      const btn = link.buttons.find((b) => b.id === id);
      if (!btn) return;
      onUpdateLink({
        buttons: [
          ...bumpedButtons,
          { ...btn, id: `${now}`, order: insertOrder, label: (btn.label || '') + ' (cópia)' },
        ],
        blocks: bumpedBlocks,
      });
    } else {
      const block = link.blocks.find((b) => b.id === id);
      if (!block) return;
      onUpdateLink({
        buttons: bumpedButtons,
        blocks: [...bumpedBlocks, { ...block, id: `${now}`, order: insertOrder }],
      });
    }
  }, [link, onUpdateLink]);

  // Build grouped block list
  const unifiedItems = useMemo(() => getUnifiedItems(link), [link]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, UnifiedItem[]>();
    for (const item of unifiedItems) {
      const cat = getItemCategory(item);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(item);
    }
    // Sort groups by defined order
    const ordered = new Map<string, UnifiedItem[]>();
    for (const cat of CATEGORY_ORDER) {
      if (groups.has(cat)) ordered.set(cat, groups.get(cat)!);
    }
    for (const [cat, items] of groups) {
      if (!ordered.has(cat)) ordered.set(cat, items);
    }
    return ordered;
  }, [unifiedItems]);

  // Flat display order for SortableContext (matches visual rendering order)
  const flatDisplayItems = useMemo(
    () => Array.from(groupedItems.values()).flat(),
    [groupedItems]
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIdx = flatDisplayItems.findIndex((i) => i.id === active.id);
    const toIdx = flatDisplayItems.findIndex((i) => i.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;

    const newItems = arrayMove(flatDisplayItems, fromIdx, toIdx);
    const withOrders = newItems.map((item, idx) => ({
      ...item,
      data: { ...item.data, order: idx },
    }));

    onUpdateLink({
      buttons: withOrders
        .filter((i) => i.kind === 'button')
        .map((i) => i.data as SmartLinkButton),
      blocks: withOrders
        .filter((i) => i.kind === 'block')
        .map((i) => i.data as LinkBlock),
    });
  }, [flatDisplayItems, onUpdateLink]);

  const navItems = [
    { key: 'theme' as const, icon: Palette, label: 'Tema' },
    { key: 'effects' as const, icon: Sparkles, label: 'Efeitos' },
    { key: 'pages' as const, icon: FileText, label: 'Páginas' },
  ];

  return (
    <div className="hidden lg:flex w-[280px] shrink-0 h-full flex-col border-r border-border bg-secondary/10">

      {/* ── Info do Negócio ──────────────────────────── */}
      <div className="shrink-0 border-b border-border/50">
        <button
          type="button"
          onClick={() => setInfoOpen((v) => !v)}
          className="w-full flex items-center justify-between px-2.5 h-9 hover:bg-secondary/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-primary shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-foreground">Info</span>
          </div>
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${infoOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {infoOpen && (
          <div className="border-t border-border/30 p-2 space-y-1.5">
            <input
              value={link.businessName || ''}
              onChange={(e) => onUpdateLink({ businessName: e.target.value })}
              placeholder="Nome do negócio"
              className="w-full h-6 px-2 text-[10px] bg-background border border-border rounded outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
            <input
              value={link.tagline || ''}
              onChange={(e) => onUpdateLink({ tagline: e.target.value })}
              placeholder="Slogan"
              className="w-full h-6 px-2 text-[10px] bg-background border border-border rounded outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
            <input
              value={link.slug || ''}
              onChange={(e) => onUpdateLink({ slug: e.target.value })}
              placeholder="meu-link"
              className="w-full h-6 px-2 text-[9px] bg-background border border-border rounded outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground font-mono"
            />
            <button
              type="button"
              onClick={() => {
                setInfoOpen(false);
                setUI({ openDrawer: null, selectedElementId: '__business-info__' });
              }}
              className="text-[9px] text-primary hover:underline w-full text-right cursor-pointer"
            >
              Mais opções →
            </button>
          </div>
        )}
      </div>

      {/* ── Nav: Tema / Efeitos / Páginas ────────────── */}
      <div className="shrink-0 border-b border-border/50 p-1.5 space-y-0.5">
        {navItems.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => selectPanel(key)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
              openDrawer === key
                ? 'bg-primary/15 text-primary border border-primary/25'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Elementos header ─────────────────────────── */}
      <div className="flex items-center justify-between px-2.5 pt-2 pb-1 shrink-0">
        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">Elementos</span>
        <button
          type="button"
          onClick={() => selectPanel('elements')}
          title="Adicionar elemento"
          className="h-4 w-4 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* ── Block list with drag-to-reorder ─────────── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={flatDisplayItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto custom-scroll pb-2 min-h-0">
            {groupedItems.size === 0 ? (
              <div className="px-2.5 py-4 text-center space-y-1">
                <p className="text-[10px] text-muted-foreground/50">Nenhum elemento.</p>
                <p className="text-[9px] text-muted-foreground/35">Clique em + para adicionar.</p>
              </div>
            ) : (
              Array.from(groupedItems.entries()).map(([cat, items]) => (
                <div key={cat}>
                  <p className={`px-2.5 pt-2 pb-0.5 text-[8px] font-bold uppercase tracking-widest ${CATEGORY_COLORS[cat] || 'text-muted-foreground'}`}>
                    {cat}
                  </p>
                  {items.map((item) => (
                    <SortableBlockItem
                      key={item.id}
                      item={item}
                      isSelected={selectedElementId === item.id}
                      onSelect={selectItem}
                      onMoveBlock={onMoveBlock}
                      onRemoveItem={onRemoveItem}
                      onDuplicate={duplicateItem}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
