import React, { Suspense, useRef, useCallback } from "react";
import { SmartLink, LinkBlock, SmartLinkButton, SubPage, BlockType } from "@/types/smart-link";
import { useEditorStore } from "@/stores/editor-store";
import { BusinessInfoPanel } from "./blocks/BusinessInfoPanel";
import { ThemePanel } from "./ThemePanel";
import { EffectsPanel } from "./EffectsPanel";
import { SubPageEditor } from "./SubPageEditor";
import { ElementsSidebar } from "./ElementsSidebar";
import { ButtonBlockEditor } from "./ButtonBlockEditor";
import { BLOCK_LABELS } from "./blocks/constants";
import { Layers } from "lucide-react";

// ─── Lazy block editors (same as BlockEditor.tsx) ────────────────────────────

const TextBlockEditor = React.lazy(() =>
  import("./blocks/TextBlockEditor").then((m) => ({ default: m.TextBlockEditor }))
);
const MediaBlockEditor = React.lazy(() =>
  import("./blocks/MediaBlockEditor").then((m) => ({ default: m.MediaBlockEditor }))
);
const LayoutBlockEditor = React.lazy(() =>
  import("./blocks/LayoutBlockEditor").then((m) => ({ default: m.LayoutBlockEditor }))
);
const InteractiveBlockEditor = React.lazy(() =>
  import("./blocks/InteractiveBlockEditor").then((m) => ({ default: m.InteractiveBlockEditor }))
);
const ListBlockEditor = React.lazy(() =>
  import("./blocks/ListBlockEditor").then((m) => ({ default: m.ListBlockEditor }))
);

const LazyFallback = () => (
  <div className="p-3 text-[10px] text-muted-foreground animate-pulse">Carregando...</div>
);

// ─── Block editor content ─────────────────────────────────────────────────────

function BlockEditorContent({
  block,
  link,
  onUpdateLink,
}: {
  block: LinkBlock;
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onUpdate = useCallback(
    (id: string, updates: Partial<LinkBlock>) => {
      onUpdateLink({ blocks: link.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)) });
    },
    [link.blocks, onUpdateLink]
  );

  const applyTextFormat = useCallback(
    (tag: string, url?: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const current = block.content || "";
      const selected = current.slice(start, end);
      const replacement =
        tag === "a"
          ? `<a href="${url || ""}" target="_blank">${selected || "link"}</a>`
          : `<${tag}>${selected || (tag === "b" ? "texto em negrito" : "texto em itálico")}</${tag}>`;
      onUpdate(block.id, {
        content: current.slice(0, start) + replacement + current.slice(end),
      });
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + replacement.length, start + replacement.length);
      });
    },
    [block, onUpdate]
  );

  switch (block.type) {
    case "text":
    case "cta":
    case "header":
      return (
        <TextBlockEditor
          block={block}
          onUpdate={onUpdate}
          textareaRef={textareaRef}
          applyTextFormat={applyTextFormat}
        />
      );
    case "image":
    case "video":
    case "spotify":
    case "map":
    case "html":
    case "carousel":
      return <MediaBlockEditor block={block} onUpdate={onUpdate} />;
    case "spacer":
    case "separator":
    case "banner":
      return <LayoutBlockEditor block={block} onUpdate={onUpdate} />;
    case "image-button":
    case "animated-button":
    case "email-capture":
    case "countdown":
    case "badges":
      return (
        <InteractiveBlockEditor block={block} onUpdate={onUpdate} pages={link.pages} />
      );
    case "faq":
    case "gallery":
    case "testimonial":
    case "stats":
    case "product":
    case "contacts":
      return <ListBlockEditor block={block} onUpdate={onUpdate} />;
    default:
      return (
        <p className="text-[10px] text-muted-foreground p-3">Sem propriedades para este bloco.</p>
      );
  }
}

// ─── Button editor content ────────────────────────────────────────────────────

function ButtonEditorContent({
  button,
  link,
  onUpdateLink,
}: {
  button: SmartLinkButton;
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
}) {
  const onUpdate = useCallback(
    (id: string, updates: Partial<SmartLinkButton>) => {
      onUpdateLink({ buttons: link.buttons.map((b) => (b.id === id ? { ...b, ...updates } : b)) });
    },
    [link.buttons, onUpdateLink]
  );

  const onRemove = useCallback(
    (id: string) => {
      onUpdateLink({ buttons: link.buttons.filter((b) => b.id !== id) });
    },
    [link.buttons, onUpdateLink]
  );

  const onDuplicate = useCallback(
    (id: string) => {
      const btn = link.buttons.find((b) => b.id === id);
      if (!btn) return;
      const now = Date.now();
      const maxOrder = Math.max(
        ...link.buttons.map((b) => b.order ?? 0),
        ...link.blocks.map((b) => b.order ?? 0),
        -1
      );
      onUpdateLink({
        buttons: [
          ...link.buttons,
          { ...btn, id: `${now}`, order: maxOrder + 1, label: (btn.label || "") + " (cópia)" },
        ],
      });
    },
    [link.buttons, link.blocks, onUpdateLink]
  );

  const onApplyColorToAll = useCallback(() => {
    const color = button.gradientColor;
    if (!color) return;
    onUpdateLink({ buttons: link.buttons.map((b) => ({ ...b, gradientColor: color })) });
  }, [button.gradientColor, link.buttons, onUpdateLink]);

  const idx = link.buttons.findIndex((b) => b.id === button.id);

  return (
    <ButtonBlockEditor
      button={button}
      index={idx}
      onUpdate={onUpdate}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onApplyColorToAll={onApplyColorToAll}
      pages={link.pages}
    />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorRightPanelProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onAddBlock: (type: BlockType, defaults?: Record<string, unknown>) => void;
  updateSubPage: (id: string, updates: Partial<SubPage>) => void;
  addBlockToSubPage: (pageId: string, type: BlockType, defaults?: Record<string, unknown>) => void;
  insertBlockToSubPageAt: (
    pageId: string,
    type: BlockType,
    atIndex: number,
    defaults?: Record<string, unknown>
  ) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorRightPanel({
  link,
  onUpdateLink,
  onAddBlock,
  updateSubPage,
  addBlockToSubPage,
  insertBlockToSubPageAt,
}: EditorRightPanelProps) {
  const openDrawer = useEditorStore((s) => s.ui.openDrawer);
  const selectedElementId = useEditorStore((s) => s.ui.selectedElementId);
  const setUI = useEditorStore((s) => s.setUI);

  // ── Determine panel content ───────────────────────────────────────────────

  let panelTitle = "Propriedades";
  let panelContent: React.ReactNode;

  if (openDrawer === "theme") {
    panelTitle = "Tema";
    panelContent = <ThemePanel link={link} onUpdateLink={onUpdateLink} />;
  } else if (openDrawer === "effects") {
    panelTitle = "Efeitos";
    panelContent = <EffectsPanel link={link} onUpdateLink={onUpdateLink} />;
  } else if (openDrawer === "pages") {
    panelTitle = "Páginas";
    panelContent = (
      <SubPageEditor
        link={link}
        onUpdateLink={onUpdateLink}
        onEditingPageChange={(id) => setUI({ editingSubPageId: id })}
        onOpenPageEditor={(id) => setUI({ editingSubPageId: id })}
      />
    );
  } else if (openDrawer === "elements") {
    panelTitle = "Adicionar Elemento";
    panelContent = <ElementsSidebar onAddBlock={onAddBlock} />;
  } else if (selectedElementId === "__business-info__") {
    panelTitle = "Info do Negócio";
    panelContent = <BusinessInfoPanel link={link} onUpdateLink={onUpdateLink} />;
  } else if (selectedElementId) {
    const button = link.buttons.find((b) => b.id === selectedElementId);
    const block = link.blocks.find((b) => b.id === selectedElementId);

    if (button) {
      panelTitle = button.label || "Botão";
      panelContent = (
        <Suspense fallback={<LazyFallback />}>
          <ButtonEditorContent key={button.id} button={button} link={link} onUpdateLink={onUpdateLink} />
        </Suspense>
      );
    } else if (block) {
      panelTitle = BLOCK_LABELS[block.type as BlockType] || block.type;
      panelContent = (
        <Suspense fallback={<LazyFallback />}>
          <BlockEditorContent key={block.id} block={block} link={link} onUpdateLink={onUpdateLink} />
        </Suspense>
      );
    } else {
      panelContent = null; // element not found, fall through to empty state
    }
  }

  // Empty state
  if (!panelContent) {
    panelTitle = "Propriedades";
    panelContent = (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
        <Layers className="h-8 w-8 text-muted-foreground/25" />
        <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
          Selecione um elemento na lista à esquerda para editar suas propriedades.
        </p>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex w-[260px] shrink-0 h-full flex-col border-l border-border bg-secondary/10">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-9 border-b border-border shrink-0 bg-secondary/20">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate flex-1">
          {panelTitle}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scroll p-3 min-h-0">
        {panelContent}
      </div>
    </div>
  );
}
