import { memo, ComponentType } from "react";
import { SmartLink, SmartLinkButton, LinkBlock, BlockType, SubPage } from "@/types/smart-link";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CopyPlus, Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import React, { Suspense, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BLOCK_LABELS } from "./constants";
import { getUnifiedItemsForMode, SubPageMode, UnifiedItem } from "./unified-items";
import { SortableButton } from "./SortableButton";
import { BlockErrorBoundary } from "./BlockErrorBoundary";

// ─── Group editor prop types ──────────────────────────────────────────────────

export interface GroupEditorComponents {
  TextBlockEditor: ComponentType<{ block: LinkBlock; onUpdate: (id: string, updates: Partial<LinkBlock>) => void; textareaRef: React.RefObject<HTMLTextAreaElement>; applyTextFormat: (tag: string, url?: string) => void }>;
  MediaBlockEditor: ComponentType<{ block: LinkBlock; onUpdate: (id: string, updates: Partial<LinkBlock>) => void }>;
  LayoutBlockEditor: ComponentType<{ block: LinkBlock; onUpdate: (id: string, updates: Partial<LinkBlock>) => void }>;
  InteractiveBlockEditor: ComponentType<{ block: LinkBlock; onUpdate: (id: string, updates: Partial<LinkBlock>) => void; pages?: SubPage[] }>;
  ListBlockEditor: ComponentType<{ block: LinkBlock; onUpdate: (id: string, updates: Partial<LinkBlock>) => void }>;
}

function renderGroupEditor(
  block: LinkBlock,
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void,
  pages: SubPage[] | undefined,
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  applyTextFormat: (tag: string, url?: string) => void,
  editors: GroupEditorComponents,
) {
  const { TextBlockEditor, MediaBlockEditor, LayoutBlockEditor, InteractiveBlockEditor, ListBlockEditor } = editors;
  switch (block.type) {
    case "text": case "cta": case "header":
      return <TextBlockEditor block={block} onUpdate={onUpdate} textareaRef={textareaRef} applyTextFormat={applyTextFormat} />;
    case "image": case "video": case "spotify": case "map": case "html": case "carousel":
      return <MediaBlockEditor block={block} onUpdate={onUpdate} />;
    case "spacer": case "separator": case "banner":
      return <LayoutBlockEditor block={block} onUpdate={onUpdate} />;
    case "image-button": case "animated-button": case "email-capture": case "countdown": case "badges":
      return <InteractiveBlockEditor block={block} onUpdate={onUpdate} pages={pages} />;
    case "faq": case "gallery": case "testimonial": case "stats": case "product": case "contacts":
      return <ListBlockEditor block={block} onUpdate={onUpdate} />;
    default: return null;
  }
}

const SortableBlock = memo(function SortableBlock({
  block, onUpdate, onRemove, onDuplicate, pages, openKey, editors,
}: {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  pages?: SubPage[];
  openKey?: number;
  editors: GroupEditorComponents;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (openKey) setOpen(true); }, [openKey]);

  const applyTextFormat = useCallback((tag: string, url?: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = block.content || "";
    const selected = current.slice(start, end);
    let replacement: string;
    if (tag === "a") {
      replacement = `<a href="${url || ""}" target="_blank">${selected || "link"}</a>`;
    } else {
      replacement = `<${tag}>${selected || (tag === "b" ? "texto em negrito" : "texto em itálico")}</${tag}>`;
    }
    onUpdate(block.id, { content: current.slice(0, start) + replacement + current.slice(end) });
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + replacement.length, start + replacement.length); });
  }, [block.id, block.content, onUpdate]);

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="editor-card">
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/30 cursor-pointer select-none" onClick={() => setOpen((v) => !v)}>
        <div {...listeners} onClick={(e) => e.stopPropagation()} className="cursor-grab active:cursor-grabbing p-1.5 flex items-center justify-center text-muted-foreground hover:text-foreground">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold text-foreground flex-1 truncate">{BLOCK_LABELS[block.type]}</span>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }} className="p-1.5 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors" title="Duplicar">
          <CopyPlus className="h-3.5 w-3.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(block.id); }} className="p-1.5 flex items-center justify-center text-destructive/70 hover:text-destructive transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <div className="p-1.5 text-muted-foreground">
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18, ease: "easeInOut" }} className="overflow-hidden">
            <div className="p-3 space-y-3 border-t border-border/30">
              <Suspense fallback={<div className="p-3 animate-pulse h-20 bg-muted/30 rounded" />}>
                {renderGroupEditor(block, onUpdate, pages, textareaRef, applyTextFormat, editors)}
              </Suspense>
              {/* Scheduling */}
              <div className="pt-2 border-t border-border/20 space-y-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    const hasSchedule = block.visibleFrom || block.visibleUntil;
                    if (hasSchedule) {
                      onUpdate(block.id, { visibleFrom: undefined, visibleUntil: undefined });
                    }
                  }}
                >
                  <Clock className="h-3 w-3" />
                  Agendamento
                  {(block.visibleFrom || block.visibleUntil) && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold">ATIVO</span>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Mostrar a partir de</label>
                    <input
                      type="datetime-local"
                      value={block.visibleFrom ?? ""}
                      onChange={(e) => onUpdate(block.id, { visibleFrom: e.target.value || undefined })}
                      className="w-full h-8 px-2 text-[11px] rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Ocultar a partir de</label>
                    <input
                      type="datetime-local"
                      value={block.visibleUntil ?? ""}
                      onChange={(e) => onUpdate(block.id, { visibleUntil: e.target.value || undefined })}
                      className="w-full h-8 px-2 text-[11px] rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                </div>
                {(block.visibleFrom || block.visibleUntil) && (
                  <p className="text-[10px] text-amber-500">
                    No preview do editor o bloco fica sempre visível. Na página pública ele segue o agendamento.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const SortableItem = memo(function SortableItem({
  item, buttonIndex, onUpdateButton, onRemoveButton, onDuplicateButton,
  onUpdateBlock, onRemoveBlock, onDuplicateBlock, pages, openKey, editors,
}: {
  item: UnifiedItem;
  buttonIndex: number;
  onUpdateButton: (id: string, updates: Partial<SmartLinkButton>) => void;
  onRemoveButton: (id: string) => void;
  onDuplicateButton?: (id: string) => void;
  onUpdateBlock: (id: string, updates: Partial<LinkBlock>) => void;
  onRemoveBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  pages: SubPage[];
  openKey?: number;
  editors: GroupEditorComponents;
}) {
  if (item.kind === "button") {
    return (
      <BlockErrorBoundary blockId={item.id} onRemove={onRemoveButton}>
        <SortableButton button={item.data} index={buttonIndex} onUpdate={onUpdateButton} onRemove={onRemoveButton} onDuplicate={onDuplicateButton} pages={pages} />
      </BlockErrorBoundary>
    );
  }
  return (
    <BlockErrorBoundary blockId={item.id} onRemove={onRemoveBlock}>
      <SortableBlock block={item.data} onUpdate={onUpdateBlock} onRemove={onRemoveBlock} onDuplicate={onDuplicateBlock} pages={pages} openKey={openKey} editors={editors} />
    </BlockErrorBoundary>
  );
});

export interface SortableListProps {
  link: SmartLink;
  isSubPage: boolean;
  subPageMode?: SubPageMode;
  selectedElementId?: string;
  onElementSelected?: (id: string | null) => void;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onInsertBlockAt?: (type: BlockType, atIndex: number, defaults?: Record<string, unknown>) => void;
  editors: GroupEditorComponents;
}

export const SortableList = memo(function SortableList({
  link, isSubPage, subPageMode, selectedElementId, onElementSelected, onUpdateLink, onInsertBlockAt, editors,
}: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const unifiedItems = useMemo(() => getUnifiedItemsForMode(link, subPageMode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [link.buttons, link.blocks, subPageMode?.page.blocks]);

  const updateBlocks = useCallback((newBlocks: LinkBlock[]) => {
    if (isSubPage) subPageMode!.onUpdatePage({ blocks: newBlocks });
    else onUpdateLink({ blocks: newBlocks });
  }, [isSubPage, subPageMode, onUpdateLink]);

  const buttonsRef = useRef(link.buttons); buttonsRef.current = link.buttons;
  const blocksRef = useRef(link.blocks); blocksRef.current = link.blocks;
  const subPageBlocksRef = useRef(isSubPage ? subPageMode!.page.blocks : link.blocks);
  subPageBlocksRef.current = isSubPage ? subPageMode!.page.blocks : link.blocks;

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [selectedOpenKey, setSelectedOpenKey] = useState(0);
  useEffect(() => {
    if (selectedElementId && itemRefs.current[selectedElementId]) {
      itemRefs.current[selectedElementId]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setSelectedOpenKey(k => k + 1);
    }
  }, [selectedElementId]);

  const updateButton = useCallback((id: string, updates: Partial<SmartLinkButton>) => {
    onUpdateLink({ buttons: buttonsRef.current.map((b) => (b.id === id ? { ...b, ...updates } : b)) });
  }, [onUpdateLink]);
  const removeButton = useCallback((id: string) => {
    onUpdateLink({ buttons: buttonsRef.current.filter((b) => b.id !== id) });
  }, [onUpdateLink]);
  const duplicateButton = useCallback((id: string) => {
    const btn = buttonsRef.current.find((b) => b.id === id);
    if (!btn) return;
    const srcOrder = btn.order ?? 0;
    const newOrder = srcOrder + 1;
    const newButtons = buttonsRef.current.map((b) =>
      b.id !== id && (b.order ?? 0) >= newOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
    );
    const newBlocks = blocksRef.current.map((b) =>
      (b.order ?? 0) >= newOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
    );
    onUpdateLink({
      buttons: [...newButtons, { ...btn, id: `btn-${Date.now()}`, order: newOrder }],
      blocks: newBlocks,
    });
  }, [onUpdateLink]);
  const updateBlock = useCallback((id: string, updates: Partial<LinkBlock>) => {
    updateBlocks(subPageBlocksRef.current.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, [updateBlocks]);
  const removeBlock = useCallback((id: string) => {
    updateBlocks(subPageBlocksRef.current.filter((b) => b.id !== id));
  }, [updateBlocks]);
  const duplicateBlock = useCallback((id: string) => {
    const blocks = subPageBlocksRef.current;
    const blk = blocks.find((b) => b.id === id);
    if (!blk) return;
    const srcOrder = blk.order ?? 0;
    const newOrder = srcOrder + 1;
    if (isSubPage) {
      const updatedBlocks = blocks.map((b) =>
        b.id !== id && (b.order ?? 0) >= newOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
      );
      updateBlocks([...updatedBlocks, { ...blk, id: `blk-${Date.now()}`, order: newOrder }]);
    } else {
      const updatedButtons = buttonsRef.current.map((b) =>
        (b.order ?? 0) >= newOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
      );
      const updatedBlocks = blocks.map((b) =>
        b.id !== id && (b.order ?? 0) >= newOrder ? { ...b, order: (b.order ?? 0) + 1 } : b
      );
      onUpdateLink({
        buttons: updatedButtons,
        blocks: [...updatedBlocks, { ...blk, id: `blk-${Date.now()}`, order: newOrder }],
      });
    }
  }, [isSubPage, updateBlocks, onUpdateLink]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = unifiedItems.findIndex((item) => item.id === String(active.id));
    const newIndex = unifiedItems.findIndex((item) => item.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove([...unifiedItems], oldIndex, newIndex);
    if (isSubPage) { updateBlocks(reordered.map((item, i) => ({ ...(item.data as LinkBlock), order: i }))); return; }
    const newButtons: SmartLinkButton[] = [];
    const newBlocks: LinkBlock[] = [];
    reordered.forEach((item, i) => {
      if (item.kind === "button") newButtons.push({ ...item.data, order: i });
      else newBlocks.push({ ...item.data, order: i });
    });
    onUpdateLink({ buttons: newButtons, blocks: newBlocks });
  };

  const handleDropInsert = (type: BlockType, atIndex: number, defaults: Record<string, unknown>) => {
    if (isSubPage) subPageMode!.onInsertBlockAt(type, atIndex, defaults);
    else onInsertBlockAt?.(type, atIndex, defaults);
  };

  const parseDropData = (e: React.DragEvent) => {
    const type = e.dataTransfer.getData("application/x-block-type") as BlockType;
    if (!type) return null;
    const rawDefaults = e.dataTransfer.getData("application/x-block-defaults");
    return { type, defaults: rawDefaults ? (JSON.parse(rawDefaults) as Record<string, unknown>) : {} };
  };

  let buttonCounter = 0;

  if (unifiedItems.length === 0) {
    return (
      <div
        className={`transition-all duration-100 rounded-xl border-2 border-dashed text-center py-12 text-muted-foreground ${dragOverIndex === 0 ? "border-primary/70 bg-primary/5" : "border-border/30"}`}
        onDragOver={(e) => { if (!e.dataTransfer.types.includes("application/x-block-type")) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOverIndex(0); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverIndex(null); }}
        onDrop={(e) => { const d = parseDropData(e); if (!d) return; e.preventDefault(); handleDropInsert(d.type, 0, d.defaults); setDragOverIndex(null); }}
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
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Elementos</h3>
      <DndContext sensors={sensors} collisionDetection={closestCorners} modifiers={[restrictToVerticalAxis]} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={unifiedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {unifiedItems.map((item, itemIndex) => {
              const bi = item.kind === "button" ? buttonCounter++ : 0;
              const isSelectedItem = !isSubPage && selectedElementId === item.id;
              return (
                <div
                  key={item.id}
                  ref={(el) => { itemRefs.current[item.id] = el; }}
                  style={{ opacity: activeId === item.id ? 0.4 : 1 }}
                  className={`rounded-xl transition-all duration-200 ${isSelectedItem ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  onClick={!isSubPage && onElementSelected ? () => onElementSelected(item.id) : undefined}
                  onDragOver={(e) => { if (!e.dataTransfer.types.includes("application/x-block-type")) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOverIndex(itemIndex); }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverIndex(null); }}
                  onDrop={(e) => { const d = parseDropData(e); if (!d) return; e.preventDefault(); handleDropInsert(d.type, itemIndex, d.defaults); setDragOverIndex(null); }}
                >
                  {dragOverIndex === itemIndex && <div className="h-0.5 bg-primary rounded-full mx-2 mb-1.5 opacity-90" />}
                  <SortableItem
                    item={item} buttonIndex={bi}
                    onUpdateButton={updateButton} onRemoveButton={removeButton} onDuplicateButton={duplicateButton}
                    onUpdateBlock={updateBlock} onRemoveBlock={removeBlock} onDuplicateBlock={duplicateBlock}
                    pages={link.pages || []} openKey={isSelectedItem ? selectedOpenKey : 0}
                    editors={editors}
                  />
                </div>
              );
            })}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`transition-all duration-100 rounded-xl border-2 border-dashed ${dragOverIndex === unifiedItems.length ? "border-primary/70 bg-primary/5 py-3" : "border-border/25 py-2"}`}
              onDragOver={(e) => { if (!e.dataTransfer.types.includes("application/x-block-type")) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOverIndex(unifiedItems.length); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverIndex(null); }}
              onDrop={(e) => { const d = parseDropData(e); if (!d) return; e.preventDefault(); handleDropInsert(d.type, unifiedItems.length, d.defaults); setDragOverIndex(null); }}
            >
              <p className={`text-center text-xs font-medium pointer-events-none transition-opacity duration-100 ${dragOverIndex === unifiedItems.length ? "text-primary opacity-100" : "text-muted-foreground/40 opacity-100"}`}>
                {dragOverIndex === unifiedItems.length ? "Solte aqui para adicionar ao final" : "↓ solte aqui"}
              </p>
            </motion.div>
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (() => {
            const activeItem = unifiedItems.find(item => item.id === activeId);
            if (!activeItem) return null;
            const label = activeItem.kind === "button"
              ? (activeItem.data as SmartLinkButton).label || "Botão"
              : BLOCK_LABELS[(activeItem.data as LinkBlock).type] || "Bloco";
            return (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.02 }}
                className="rounded-xl bg-card border border-border shadow-2xl"
                style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
              >
                <div className="flex items-center gap-1.5 px-3 py-2.5">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground truncate">{label}</span>
                </div>
              </motion.div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
});
