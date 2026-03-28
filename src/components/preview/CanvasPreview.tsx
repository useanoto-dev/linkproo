import { useRef, useEffect, useState, useCallback, CSSProperties, memo } from "react";
import Moveable from "react-moveable";
import { SmartLink, SmartLinkButton, LinkBlock } from "@/types/smart-link";
import { BlockRenderer } from "./BlockRenderer";
import { ButtonPreview } from "./ButtonPreview";
import { getEntryVariants, FONT_LINKS, loadGoogleFont, isDarkBg } from "./preview-utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type CanvasItem =
  | { kind: "button"; id: string; data: SmartLinkButton; order: number }
  | { kind: "block"; id: string; data: LinkBlock; order: number };

interface CanvasPreviewProps {
  link: SmartLink;
  editorScale: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<SmartLinkButton> | Partial<LinkBlock>) => void;
  onDeleteElement?: (id: string) => void;
  onDuplicateElement?: (id: string) => void;
  onBringForward?: (id: string) => void;
  onSendBackward?: (id: string) => void;
}

// ─── Default height per item kind ──────────────────────────────────────────

function getDefaultHeight(item: CanvasItem): number {
  if (item.kind === "button") return 56;
  const t = item.data.type;
  if (t === "spacer") return (item.data as LinkBlock).height ?? 32;
  if (t === "image" || t === "image-button") return 160;
  if (t === "video") return 220;
  if (t === "hero") return 160;
  if (t === "gallery") return 200;
  if (t === "carousel") return 200;
  if (t === "map") return 200;
  if (t === "spotify") return 80;
  if (t === "html") return (item.data as LinkBlock).htmlHeight ?? 120;
  if (t === "countdown") return 80;
  if (t === "stats") return 80;
  if (t === "testimonial") return 120;
  if (t === "product") return 180;
  if (t === "email-capture") return 100;
  if (t === "faq") return 140;
  if (t === "contacts") return 120;
  if (t === "animated-button") return 72;
  if (t === "separator") return 24;
  return 64;
}

// ─── assignInitialCanvasPositions ─────────────────────────────────────────

export function assignInitialCanvasPositions(
  buttons: SmartLinkButton[],
  blocks: LinkBlock[],
): { buttons: SmartLinkButton[]; blocks: LinkBlock[] } {
  // Unified sort by order
  type Tagged = { kind: "button"; idx: number; order: number } | { kind: "block"; idx: number; order: number };
  const sorted: Tagged[] = [
    ...buttons.map((b, i) => ({ kind: "button" as const, idx: i, order: b.order ?? i })),
    ...blocks.map((b, i) => ({ kind: "block" as const, idx: i, order: b.order ?? (buttons.length + i) })),
  ].sort((a, b) => a.order - b.order);

  const newButtons = [...buttons];
  const newBlocks = [...blocks];

  let currentY = 16;
  for (const t of sorted) {
    const item: CanvasItem =
      t.kind === "button"
        ? { kind: "button", id: buttons[t.idx].id, data: buttons[t.idx], order: t.order }
        : { kind: "block", id: blocks[t.idx].id, data: blocks[t.idx], order: t.order };

    const el = item.data;
    if (el.canvasX !== undefined) {
      // Already has position — advance cursor past it
      const h = el.canvasH ?? getDefaultHeight(item);
      currentY = Math.max(currentY, (el.canvasY ?? 0) + h + 12);
      continue;
    }

    const h = getDefaultHeight(item);
    const pos = { canvasX: 16, canvasY: currentY, canvasW: 358, canvasH: h, canvasRotation: 0 };
    if (t.kind === "button") {
      newButtons[t.idx] = { ...newButtons[t.idx], ...pos };
    } else {
      newBlocks[t.idx] = { ...newBlocks[t.idx], ...pos };
    }
    currentY += h + 12;
  }

  return { buttons: newButtons, blocks: newBlocks };
}

// ─── CanvasItem Component ─────────────────────────────────────────────────

interface CanvasItemProps {
  item: CanvasItem;
  isSelected: boolean;
  editingId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<SmartLinkButton> | Partial<LinkBlock>) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, text: string) => void;
  itemRefSetter: (id: string, el: HTMLElement | null) => void;
  accent: string;
  linkId: string;
  dark: boolean;
  textClass: string;
  subtextClass: string;
}

const IFRAME_TYPES = new Set(["html", "video", "map", "spotify"]);
const TEXT_EDITABLE_TYPES = new Set(["text", "header", "cta", "title", "banner"]);

const CanvasItemEl = memo(function CanvasItemEl({
  item,
  isSelected,
  editingId,
  onSelect,
  onUpdate,
  onStartEdit,
  onEndEdit,
  itemRefSetter,
  accent,
  linkId,
  dark,
  textClass,
  subtextClass,
}: CanvasItemProps) {
  const el = item.data;
  const isEditing = editingId === item.id;

  const style: CSSProperties = {
    position: "absolute",
    left: el.canvasX ?? 16,
    top: el.canvasY ?? 0,
    width: el.canvasW ?? 358,
    height: el.canvasH !== undefined ? el.canvasH : "auto",
    transform: `rotate(${el.canvasRotation ?? 0}deg)`,
    transformOrigin: "center center",
    cursor: isEditing ? "text" : "pointer",
    userSelect: isEditing ? "text" : "none",
    boxSizing: "border-box",
    outline: isSelected ? "2px solid #6366f1" : "none",
    outlineOffset: isSelected ? 2 : 0,
    zIndex: isSelected ? 10 : 1,
  };

  const entryVariants = getEntryVariants("none", 0);

  return (
    <div
      ref={(domEl) => itemRefSetter(item.id, domEl)}
      data-canvas-id={item.id}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (item.kind === "block" && TEXT_EDITABLE_TYPES.has(item.data.type)) {
          onStartEdit(item.id);
        }
      }}
    >
      {/* Render the actual block/button */}
      {item.kind === "block" ? (
        isEditing && TEXT_EDITABLE_TYPES.has(item.data.type) ? (
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              outline: "none",
              minHeight: 24,
              padding: "4px 8px",
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "inherit",
              width: "100%",
            }}
            onBlur={(e) => {
              onEndEdit(item.id, e.currentTarget.textContent ?? "");
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onEndEdit(item.id, e.currentTarget.textContent ?? "");
                e.currentTarget.blur();
              }
            }}
          >
            {(item.data as LinkBlock).content ?? ""}
          </div>
        ) : (
          <BlockRenderer
            block={item.data as LinkBlock}
            accent={accent}
            dark={dark}
            textClass={textClass}
            subtextClass={subtextClass}
            delay={0}
            linkId={linkId}
            entryVariants={entryVariants}
          />
        )
      ) : (
        <ButtonPreview
          btn={item.data as SmartLinkButton}
          accent={accent}
          linkId={linkId}
          entryVariants={entryVariants}
        />
      )}

      {/* Iframe capture overlay */}
      {item.kind === "block" && IFRAME_TYPES.has((item.data as LinkBlock).type) && !isEditing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            cursor: "pointer",
            background: "transparent",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.id);
          }}
        />
      )}
    </div>
  );
});

// ─── CanvasPreview ────────────────────────────────────────────────────────

export const CanvasPreview = memo(function CanvasPreview({
  link,
  editorScale,
  selectedId,
  onSelect,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
}: CanvasPreviewProps) {
  const artboardRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fontFamily = FONT_LINKS[link.fontFamily || "Inter"] || "'Inter', sans-serif";
  useEffect(() => {
    if (link.fontFamily) loadGoogleFont(link.fontFamily);
  }, [link.fontFamily]);

  const accent = link.accentColor || "#f59e0b";
  const dark = isDarkBg(link.backgroundColor);
  const textClass = dark ? "text-white" : "text-gray-900";
  const subtextClass = dark ? "text-white/60" : "text-gray-500";

  // Build unified sorted items list
  const items: CanvasItem[] = [
    ...link.buttons.map((b, i) => ({ kind: "button" as const, id: b.id, data: b, order: b.order ?? i })),
    ...link.blocks.map((b, i) => ({ kind: "block" as const, id: b.id, data: b, order: b.order ?? (link.buttons.length + i) })),
  ].sort((a, b) => a.order - b.order);

  const itemRefSetter = useCallback((id: string, el: HTMLElement | null) => {
    itemRefs.current[id] = el;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedId) return;
      // Don't intercept when editing text
      if (editingId) return;

      const step = e.shiftKey ? 10 : 1;
      const item = items.find((i) => i.id === selectedId);
      if (!item) return;
      const el = item.data;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDeleteElement?.(selectedId);
      } else if (e.key === "Escape") {
        onSelect(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onUpdateElement(selectedId, { canvasX: Math.round((el.canvasX ?? 0) - step) });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onUpdateElement(selectedId, { canvasX: Math.round((el.canvasX ?? 0) + step) });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onUpdateElement(selectedId, { canvasY: Math.round((el.canvasY ?? 0) - step) });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onUpdateElement(selectedId, { canvasY: Math.round((el.canvasY ?? 0) + step) });
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        onDuplicateElement?.(selectedId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "]") {
        e.preventDefault();
        onBringForward?.(selectedId);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "[") {
        e.preventDefault();
        onSendBackward?.(selectedId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, editingId, items, onSelect, onUpdateElement, onDeleteElement, onDuplicateElement, onBringForward, onSendBackward]);

  // Calculate artboard min height
  const minHeight = Math.max(700, ...items.map((i) => (i.data.canvasY ?? 0) + (i.data.canvasH ?? getDefaultHeight(i)) + 32));

  const selectedTarget = selectedId ? itemRefs.current[selectedId] ?? undefined : undefined;

  return (
    <div
      ref={artboardRef}
      style={{
        position: "relative",
        width: 390,
        minHeight,
        background: "transparent",
        fontFamily,
        overflow: "visible",
      }}
      onClick={(e) => {
        if (e.target === artboardRef.current) onSelect(null);
      }}
    >
      {items.map((item) => (
        <CanvasItemEl
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          editingId={editingId}
          onSelect={onSelect}
          onUpdate={onUpdateElement}
          onStartEdit={(id) => setEditingId(id)}
          onEndEdit={(id, text) => {
            onUpdateElement(id, { content: text } as Partial<LinkBlock>);
            setEditingId(null);
          }}
          itemRefSetter={itemRefSetter}
          accent={accent}
          linkId={link.id}
          dark={dark}
          textClass={textClass}
          subtextClass={subtextClass}
        />
      ))}

      {/* Moveable — rendered in the artboard so it scales with the frame */}
      {selectedId && selectedTarget && !editingId && (
        <Moveable
          target={selectedTarget}
          zoom={1 / editorScale}
          draggable
          resizable
          rotatable
          snappable
          snapGridWidth={8}
          snapGridHeight={8}
          keepRatio={false}
          renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
          rotationPosition="top"
          throttleDrag={0}
          throttleResize={0}
          throttleRotate={0}
          onDrag={({ left, top }) => {
            onUpdateElement(selectedId, {
              canvasX: Math.round(left),
              canvasY: Math.round(top),
            });
          }}
          onResize={({ width, height, drag }) => {
            onUpdateElement(selectedId, {
              canvasW: Math.round(width),
              canvasH: Math.round(height),
              canvasX: Math.round(drag.left),
              canvasY: Math.round(drag.top),
            });
          }}
          onRotate={({ rotation }) => {
            onUpdateElement(selectedId, { canvasRotation: Math.round(rotation) });
          }}
        />
      )}
    </div>
  );
});
