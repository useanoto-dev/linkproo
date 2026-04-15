import { SmartLink, SubPage } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowLeft, FileText, Palette, Copy, PencilLine } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { COLOR_PRESETS } from "@/lib/color-utils";
import { normalizeSlug } from "@/lib/slug-utils";

interface SubPageEditorProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onEditingPageChange?: (pageId: string | null) => void;
  onOpenPageEditor?: (pageId: string) => void;
}

const fontOptions = [
  "Inter", "Plus Jakarta Sans", "DM Sans", "Outfit", "Sora", "Manrope",
  "Poppins", "Montserrat", "Raleway", "Rubik", "Nunito", "Space Grotesk", "Unbounded",
  "Playfair Display", "Cormorant Garamond", "Libre Baskerville", "DM Serif Display", "Fraunces", "Lora",
  "Archivo Black", "Bebas Neue", "Caveat",
];

const bgColorOptions = [
  { label: "Herdar do link", value: "" },
  ...COLOR_PRESETS.map((p) => ({ label: p.label, value: p.value })),
];

type LinkableItem =
  | { kind: "button"; id: string; label: string }
  | { kind: "block"; id: string; label: string };

export function SubPageEditor({ link, onUpdateLink, onEditingPageChange, onOpenPageEditor }: SubPageEditorProps) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const pages = link.pages || [];
  const buttons = link.buttons || [];
  const blocks = link.blocks || [];
  const editingPage = pages.find((p) => p.id === editingPageId);

  const onEditingPageChangeRef = useRef(onEditingPageChange);
  onEditingPageChangeRef.current = onEditingPageChange;
  useEffect(() => {
    onEditingPageChangeRef.current?.(editingPageId);
  }, [editingPageId]);

  // ─── Linkable items: buttons + image-button and animated-button blocks ────────

  const getLinkableItems = (): LinkableItem[] => [
    ...buttons.map((b) => ({
      kind: "button" as const,
      id: b.id,
      label: b.label || `Botão ${b.id.slice(-4)}`,
    })),
    ...blocks
      .filter((b) => b.type === "image-button" || b.type === "animated-button")
      .map((b) => ({
        kind: "block" as const,
        id: b.id,
        label:
          b.type === "animated-button"
            ? b.animButtonLabel || b.content || "Botão Animado"
            : b.content || "Botão Imagem",
      })),
  ];

  const getLinkedItemId = (pageId: string): string | undefined => {
    // Check buttons first
    const linkedBtn = buttons.find((b) => b.linkType === "page" && b.pageId === pageId);
    if (linkedBtn) return linkedBtn.id;
    // Check blocks
    const linkedBlock = blocks.find((b) => b.blockPageId === pageId);
    if (linkedBlock) return linkedBlock.id;
    return undefined;
  };

  const linkItemToPage = (pageId: string, itemId: string) => {
    const isButton = buttons.some((b) => b.id === itemId);

    if (isButton) {
      // Clear any old button linked to this page; link the chosen button
      const updatedButtons = buttons.map((b) => {
        if (b.linkType === "page" && b.pageId === pageId && b.id !== itemId)
          return { ...b, linkType: "external" as const, pageId: undefined };
        if (b.id === itemId) return { ...b, linkType: "page" as const, pageId };
        return b;
      });
      // Clear any old block linked to this page
      const updatedBlocks = blocks.map((b) =>
        b.blockPageId === pageId ? { ...b, blockPageId: undefined } : b
      );
      // Sync page.linkedButtonId
      const updatedPages = pages.map((p) => {
        if (p.id === pageId) return { ...p, linkedButtonId: itemId };
        if (p.linkedButtonId === itemId) return { ...p, linkedButtonId: undefined };
        return p;
      });
      onUpdateLink({ buttons: updatedButtons, blocks: updatedBlocks, pages: updatedPages });
    } else {
      // It's a block
      // Clear any old button linked to this page
      const updatedButtons = buttons.map((b) =>
        b.linkType === "page" && b.pageId === pageId
          ? { ...b, linkType: "external" as const, pageId: undefined }
          : b
      );
      // Clear any old block linked to this page; link this block; clear this block from other pages
      const updatedBlocks = blocks.map((b) => {
        if (b.blockPageId === pageId && b.id !== itemId) return { ...b, blockPageId: undefined };
        if (b.id === itemId) return { ...b, blockPageId: pageId };
        return b;
      });
      const updatedPages = pages.map((p) => {
        if (p.id === pageId) return { ...p, linkedButtonId: itemId };
        if (p.linkedButtonId === itemId) return { ...p, linkedButtonId: undefined };
        return p;
      });
      onUpdateLink({ buttons: updatedButtons, blocks: updatedBlocks, pages: updatedPages });
    }
  };

  const unlinkItemFromPage = (pageId: string) => {
    const itemId = getLinkedItemId(pageId);
    if (!itemId) return;
    const isButton = buttons.some((b) => b.id === itemId);
    const updatedButtons = isButton
      ? buttons.map((b) =>
          b.id === itemId ? { ...b, linkType: "external" as const, pageId: undefined } : b
        )
      : buttons;
    const updatedBlocks = !isButton
      ? blocks.map((b) => (b.id === itemId ? { ...b, blockPageId: undefined } : b))
      : blocks;
    const updatedPages = pages.map((p) =>
      p.id === pageId ? { ...p, linkedButtonId: undefined } : p
    );
    onUpdateLink({ buttons: updatedButtons, blocks: updatedBlocks, pages: updatedPages });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const addPage = () => {
    if (pages.length >= 10) {
      toast.error("Máximo de 10 sub-páginas");
      return;
    }
    const newPage: SubPage = {
      id: crypto.randomUUID(),
      title: `Página ${pages.length + 1}`,
      blocks: [],
    };
    onUpdateLink({ pages: [...pages, newPage] });
    setEditingPageId(newPage.id);
    toast.success("Sub-página criada!");
  };

  const updatePage = (id: string, updates: Partial<SubPage>) => {
    onUpdateLink({ pages: pages.map((p) => (p.id === id ? { ...p, ...updates } : p)) });
  };

  const removePage = (id: string) => {
    const itemId = getLinkedItemId(id);
    if (itemId) {
      const isButton = buttons.some((b) => b.id === itemId);
      const updatedButtons = isButton
        ? buttons.map((b) =>
            b.id === itemId ? { ...b, linkType: "external" as const, pageId: undefined } : b
          )
        : buttons;
      const updatedBlocks = !isButton
        ? blocks.map((b) => (b.id === itemId ? { ...b, blockPageId: undefined } : b))
        : blocks;
      onUpdateLink({
        pages: pages.filter((p) => p.id !== id),
        buttons: updatedButtons,
        blocks: updatedBlocks,
      });
    } else {
      onUpdateLink({ pages: pages.filter((p) => p.id !== id) });
    }
    if (editingPageId === id) setEditingPageId(null);
    toast.success("Sub-página removida");
  };

  // ─── Editing a specific page ──────────────────────────────────────────────────
  if (editingPage) {
    const linkableItems = getLinkableItems();
    const linkedItemId = getLinkedItemId(editingPage.id);
    const linkedItem = linkableItems.find((i) => i.id === linkedItemId);

    return (
      <div className="space-y-4">
        <button
          onClick={() => setEditingPageId(null)}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar às páginas
        </button>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Título da Página</Label>
          <Input
            value={editingPage.title}
            onChange={(e) => updatePage(editingPage.id, { title: e.target.value })}
            placeholder="Ex: Espaço Interno"
            className="text-sm h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Slug da página (para URL direta)</Label>
          <div className="flex gap-1.5">
            <Input
              value={editingPage.slug || ""}
              onChange={(e) => updatePage(editingPage.id, { slug: normalizeSlug(e.target.value) })}
              placeholder="minha-pagina"
              className="text-sm h-9 font-mono"
            />
            {editingPage.slug && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/l/${link.slug}/${editingPage.slug}`);
                  toast.success("URL copiada!");
                }}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                title="Copiar URL"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {editingPage.slug && (
            <p className="text-[10px] text-muted-foreground">
              URL: /l/{link.slug}/{editingPage.slug}
            </p>
          )}
        </div>

        {/* Item selector — shows ALL buttons and image-button/animated-button blocks */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Botão vinculado <span className="text-muted-foreground/60">(opcional)</span>
          </Label>
          {linkableItems.length === 0 ? (
            <p className="text-[11px] text-muted-foreground py-1">
              Nenhum botão criado ainda. Adicione botões na aba de elementos.
            </p>
          ) : (
            <Select
              value={linkedItemId ?? "__none__"}
              onValueChange={(val) => {
                if (val === "__none__") {
                  unlinkItemFromPage(editingPage.id);
                } else {
                  linkItemToPage(editingPage.id, val);
                }
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Nenhum (acessível via slug)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" className="text-xs text-muted-foreground">
                  Nenhum (acessível via slug)
                </SelectItem>
                {linkableItems.map((item) => {
                  const usedByOther =
                    item.kind === "button"
                      ? (() => {
                          const btn = buttons.find((b) => b.id === item.id);
                          return (
                            btn?.linkType === "page" &&
                            btn.pageId !== undefined &&
                            btn.pageId !== editingPage.id
                          );
                        })()
                      : (() => {
                          const blk = blocks.find((b) => b.id === item.id);
                          return (
                            blk?.blockPageId !== undefined &&
                            blk.blockPageId !== editingPage.id
                          );
                        })();

                  const otherPageTitle = usedByOther
                    ? (() => {
                        if (item.kind === "button") {
                          const btn = buttons.find((b) => b.id === item.id);
                          return pages.find((p) => p.id === btn?.pageId)?.title;
                        } else {
                          const blk = blocks.find((b) => b.id === item.id);
                          return pages.find((p) => p.id === blk?.blockPageId)?.title;
                        }
                      })()
                    : undefined;

                  const kindLabel = item.kind === "block" ? " (bloco)" : "";

                  return (
                    <SelectItem key={item.id} value={item.id} className="text-xs">
                      {item.label}{kindLabel}
                      {usedByOther && (
                        <span className="ml-1.5 text-[10px] text-amber-500">
                          (em uso: {otherPageTitle || "outra página"})
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          {linkedItem ? (
            <p className="text-[10px] text-muted-foreground">
              Ao clicar em "{linkedItem.label}", abrirá esta página.
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Página acessível via URL direta: /l/{link.slug}/{editingPage.slug || "slug-da-pagina"}
            </p>
          )}
        </div>

        {/* Page styling */}
        <div className="space-y-3 p-3 rounded-xl border border-border bg-secondary/20">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <Label className="text-xs font-semibold text-foreground">Estilo da Página</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground">Cor de fundo</Label>
            <Select
              value={editingPage.backgroundColor || ""}
              onValueChange={(val) => updatePage(editingPage.id, { backgroundColor: val || undefined })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Herdar do link" />
              </SelectTrigger>
              <SelectContent>
                {bgColorOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value || "inherit"} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground">Tipografia</Label>
            <Select
              value={editingPage.fontFamily || ""}
              onValueChange={(val) => updatePage(editingPage.id, { fontFamily: val || undefined })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Herdar do link" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit" className="text-xs">Herdar do link</SelectItem>
                {fontOptions.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Block editor CTA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground font-semibold">Blocos da Página</Label>
            <span className="text-[10px] text-muted-foreground">{editingPage.blocks.length} blocos</span>
          </div>
          <button
            onClick={() => onOpenPageEditor?.(editingPage.id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary/30 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
          >
            <PencilLine className="h-4 w-4" />
            Editar Blocos
          </button>
          <p className="text-[10px] text-muted-foreground text-center">
            Use o editor central com todos os 24 tipos de bloco, arrastar e soltar, e muito mais.
          </p>
        </div>
      </div>
    );
  }

  // ─── Pages list ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          Sub-Páginas ({pages.length})
        </Label>
        <button
          onClick={addPage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold hover:opacity-90 transition-all"
        >
          <Plus className="h-3 w-3" />
          Nova
        </button>
      </div>

      {pages.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-4">
          Crie sub-páginas para adicionar conteúdo extra aos seus botões.
        </p>
      )}

      {pages.map((page) => {
        const linkableItems = getLinkableItems();
        const linkedItemId = getLinkedItemId(page.id);
        const linkedItem = linkableItems.find((i) => i.id === linkedItemId);
        return (
          <div
            key={page.id}
            className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => setEditingPageId(page.id)}
          >
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {page.blocks.length} blocos
                {linkedItem && ` · Botão: ${linkedItem.label}`}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removePage(page.id);
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-destructive/60 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
