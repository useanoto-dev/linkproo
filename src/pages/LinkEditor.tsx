import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SmartLinkPreview } from "@/components/SmartLinkPreview";
import { SubPagePreview } from "@/components/SubPagePreview";
import { ElementsSidebar } from "@/components/editor/ElementsSidebar";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { ThemePanel } from "@/components/editor/ThemePanel";
import { SmartLink, BlockType, SubPage } from "@/types/smart-link";
import { Save, Eye, EyeOff, Palette, Layers, Smartphone, PanelRightClose, Loader2, X, ExternalLink, Copy, Undo2, Redo2, Check, AlertCircle, Cloud, Sparkles, FileText, Keyboard, ArrowLeft } from "lucide-react";
import { EffectsPanel } from "@/components/editor/EffectsPanel";
import { SubPageEditor } from "@/components/editor/SubPageEditor";
import { DeviceFrame, DeviceType, DEVICE_LABELS } from "@/components/editor/DeviceFrame";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { templates } from "@/data/templates";
import { useSaveLink, useLink, getPublicLinkUrl } from "@/hooks/use-links";
import { smartLinkToRow } from "@/lib/link-mappers";
import { createBlockDefaults } from "@/lib/block-utils";
import { useAutosave } from "@/hooks/use-autosave";
import { useEditorHistory } from "@/hooks/use-editor-history";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { validateSlug, checkSlugAvailability } from "@/lib/slug-utils";

function createDefaultLink(): SmartLink {
  return {
    id: "new-" + Date.now(),
    slug: "",
    businessName: "",
    tagline: "",
    heroImage: "",
    logoUrl: "",
    backgroundColor: "from-gray-50 to-white",
    textColor: "text-white",
    accentColor: "#f59e0b",
    fontFamily: "Inter",
    buttons: [],
    badges: [],
    floatingEmojis: [],
    blocks: [],
    pages: [],
    views: 0,
    clicks: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

function createFromTemplate(templateId: string): SmartLink | null {
  const tpl = templates.find((t) => t.id === templateId);
  if (!tpl) return null;
  const now = Date.now();
  return {
    ...tpl.template,
    id: "new-" + now,
    views: 0,
    clicks: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    buttons: tpl.template.buttons.map((b, i) => ({ ...b, id: `${now}-btn-${i}`, order: i })),
    blocks: tpl.template.blocks.map((b, i) => ({ ...b, id: `${now}-blk-${i}`, order: tpl.template.buttons.length + i })),
    pages: tpl.template.pages || [],
  };
}

// Extracted to src/hooks/use-editor-history.ts

export default function LinkEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get("template");
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const isEditing = !!id;
  const { data: existingLink, isLoading } = useLink(id);
  const saveLink = useSaveLink();

  const initialLink = templateId ? createFromTemplate(templateId) || createDefaultLink() : createDefaultLink();
  const { state: link, set: setLink, undo, redo, canUndo, canRedo, reset } = useEditorHistory(initialLink);

  // Debounced preview — preview only updates 150ms after user stops typing
  // This eliminates 95% of preview re-renders without affecting editor responsiveness
  const [previewLink, setPreviewLink] = useState(link);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => setPreviewLink(link), 50);
    return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
  }, [link]);

  const [showPreview, setShowPreview] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [device, setDevice] = useState<DeviceType>("iphone15");
  const [openDrawer, setOpenDrawer] = useState<"elements" | "theme" | "effects" | "pages" | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingSubPageId, setEditingSubPageId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(!isEditing);
  const [isDraggingOverPreview, setIsDraggingOverPreview] = useState(false);
  const [ghostBlockType, setGhostBlockType] = useState<BlockType | null>(null);
  const dragTypeRef = useRef<BlockType | null>(null);

  // Autosave using shared mapper
  const isExistingLink = isEditing || !link.id.startsWith("new-");
  const autosaveFn = useCallback(async (l: SmartLink) => {
    if (!user) return;
    const row = smartLinkToRow(l, user.id);
    const { error } = await supabase
      .from("links")
      .update(row as any)
      .eq("id", l.id)
      .eq("user_id", user.id);
    if (error) throw error;
  }, [user]);
  const { status: autosaveStatus, initializeRef, savedAt, retry, flush } = useAutosave(link, autosaveFn, isExistingLink && initialized, 1500);

  useEffect(() => {
    if (existingLink && !initialized) {
      reset(existingLink);
      initializeRef(existingLink);
      setInitialized(true);
    }
  }, [existingLink, initialized, reset, initializeRef]);

  // Warn before leaving with unsaved changes and attempt immediate save
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Try to flush pending saves synchronously before unload
      // Note: async operations during beforeunload are unreliable,
      // but we can at minimum reduce the risk
      if (autosaveStatus === "saving" || autosaveStatus === "error") {
        e.preventDefault();
        e.returnValue = "Há alterações não salvas. Tem certeza que deseja sair?";
      }
    };

    const handleVisibilityChange = () => {
      // When tab becomes hidden (user switching tabs or about to close),
      // trigger immediate save
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autosaveStatus, flush]);

  // Save on unmount (navigation away within the app)
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  useEffect(() => {
    if (isMobile) setShowPreview(false);
  }, [isMobile]);

  // Track which block type is being dragged from the sidebar
  useEffect(() => {
    const onStart = (e: Event) => {
      const type = (e as CustomEvent).detail?.type as BlockType;
      dragTypeRef.current = type || null;
    };
    const onEnd = () => {
      dragTypeRef.current = null;
      setGhostBlockType(null);
    };
    window.addEventListener("block-drag-start", onStart);
    window.addEventListener("block-drag-end", onEnd);
    return () => {
      window.removeEventListener("block-drag-start", onStart);
      window.removeEventListener("block-drag-end", onEnd);
    };
  }, []);

  const updateLink = useCallback((updates: Partial<SmartLink>) => {
    setLink((prev) => ({ ...prev, ...updates }));
  }, [setLink]);

  const getNextOrder = () => {
    const maxBtnOrder = link.buttons.reduce((max, b) => Math.max(max, b.order ?? 0), -1);
    const maxBlkOrder = link.blocks.reduce((max, b) => Math.max(max, b.order ?? 0), -1);
    return Math.max(maxBtnOrder, maxBlkOrder, link.buttons.length + link.blocks.length - 1) + 1;
  };

  const insertBlockAt = useCallback((type: BlockType, atIndex: number, extraDefaults?: Record<string, unknown>) => {
    // Bump order of all existing items at or after atIndex by 1
    const updatedButtons = link.buttons.map((b) =>
      (b.order ?? 0) >= atIndex ? { ...b, order: (b.order ?? 0) + 1 } : b
    );
    const updatedBlocks = link.blocks.map((b) =>
      (b.order ?? 0) >= atIndex ? { ...b, order: (b.order ?? 0) + 1 } : b
    );

    const names: Record<string, string> = {
      button: "Botão Visual", "image-button": "Botão Imagem", text: "Texto",
      badges: "Badges", cta: "CTA", separator: "Separador", image: "Imagem",
      header: "Título", spacer: "Espaçador", video: "Vídeo", hero: "Hero",
      info: "Info", countdown: "Countdown", faq: "FAQ", gallery: "Galeria",
      testimonial: "Depoimento", stats: "Números/Stats", product: "Produto",
      "email-capture": "Captura Email", spotify: "Spotify", map: "Mapa",
      carousel: "Carrossel", banner: "Banner Promo", "animated-button": "Botão Animado",
    };

    if (type === "button") {
      const newBtn = {
        id: Date.now().toString(),
        label: "",
        subtitle: "",
        url: "",
        icon: "",
        gradientColor: "from-blue-600 to-blue-800",
        iconEmoji: "",
        imagePosition: "right" as const,
        imageOpacity: 85,
        imageSize: 50,
        order: atIndex,
      };
      updateLink({ buttons: [...updatedButtons, newBtn], blocks: updatedBlocks });
    } else {
      const newBlock = createBlockDefaults(type, atIndex, extraDefaults);
      updateLink({ buttons: updatedButtons, blocks: [...updatedBlocks, newBlock] });
    }
    toast.success(`${names[type] || "Bloco"} inserido!`);
  }, [link, updateLink]);

  const addBlock = (type: BlockType, extraDefaults?: Record<string, unknown>) => {
    const nextOrder = getNextOrder();
    const names: Record<string, string> = {
      button: "Botão Visual", "image-button": "Botão Imagem", text: "Texto",
      badges: "Badges", cta: "CTA", separator: "Separador", image: "Imagem",
      header: "Título", spacer: "Espaçador", video: "Vídeo", hero: "Hero",
      info: "Info", countdown: "Countdown", faq: "FAQ", gallery: "Galeria",
      testimonial: "Depoimento", stats: "Números/Stats", product: "Produto",
      "email-capture": "Captura Email", spotify: "Spotify", map: "Mapa",
      carousel: "Carrossel", banner: "Banner Promo", "animated-button": "Botão Animado",
    };
    if (type === "button") {
      updateLink({
        buttons: [
          ...link.buttons,
          {
            id: Date.now().toString(),
            label: "",
            subtitle: "",
            url: "",
            icon: "",
            gradientColor: "from-blue-600 to-blue-800",
            iconEmoji: "",
            imagePosition: "right",
            imageOpacity: 85,
            imageSize: 50,
            order: nextOrder,
          },
        ],
      });
    } else {
      const newBlock = createBlockDefaults(type, nextOrder, extraDefaults);
      updateLink({ blocks: [...link.blocks, newBlock] });
    }
    toast.success(`${names[type] || "Bloco"} adicionado!`);
  };

  const handlePreviewDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("application/x-block-type")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handlePreviewDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("application/x-block-type")) {
      setIsDraggingOverPreview(true);
      if (dragTypeRef.current) setGhostBlockType(dragTypeRef.current);
    }
  }, []);

  const handlePreviewDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDraggingOverPreview(false);
      setGhostBlockType(null);
    }
  }, []);

  const handlePreviewDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOverPreview(false);
    setGhostBlockType(null);
    const type = e.dataTransfer.getData("application/x-block-type") as BlockType;
    if (!type) return;
    const defaultsRaw = e.dataTransfer.getData("application/x-block-defaults");
    const defaults: Record<string, unknown> = defaultsRaw ? JSON.parse(defaultsRaw) : {};
    addBlock(type, defaults);
  }, [addBlock]);

  const updateSubPage = useCallback((pageId: string, updates: Partial<SubPage>) => {
    setLink((prev) => ({
      ...prev,
      pages: (prev.pages || []).map((p) => p.id === pageId ? { ...p, ...updates } : p),
    }));
  }, [setLink]);

  const addBlockToSubPage = useCallback((pageId: string, type: BlockType, extraDefaults?: Record<string, unknown>) => {
    const page = (link.pages || []).find((p) => p.id === pageId);
    if (!page) return;
    const nextOrder = page.blocks.reduce((max, b) => Math.max(max, b.order ?? 0), -1) + 1;
    const newBlock = createBlockDefaults(type, nextOrder, extraDefaults);
    updateSubPage(pageId, { blocks: [...page.blocks, newBlock] });
    toast.success("Bloco adicionado!");
  }, [link.pages, updateSubPage]);

  const insertBlockToSubPageAt = useCallback((pageId: string, type: BlockType, atIndex: number, extraDefaults?: Record<string, unknown>) => {
    const page = (link.pages || []).find((p) => p.id === pageId);
    if (!page) return;
    const sorted = [...page.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const newOrder = atIndex;
    const bumpedBlocks = sorted.map((b) => (b.order ?? 0) >= newOrder ? { ...b, order: (b.order ?? 0) + 1 } : b);
    const newBlock = createBlockDefaults(type, newOrder, extraDefaults);
    updateSubPage(pageId, { blocks: [...bumpedBlocks, newBlock] });
  }, [link.pages, updateSubPage]);

  const handleSave = async () => {
    // Validate slug
    const slugError = validateSlug(link.slug);
    if (slugError) {
      toast.error(slugError);
      return;
    }

    // Check slug uniqueness
    const isNew = !isEditing;
    const isAvailable = await checkSlugAvailability(link.slug, isNew ? undefined : link.id);
    if (!isAvailable) {
      toast.error("Esse endereço já está em uso. Escolha outro slug.");
      return;
    }

    try {
      const saved = await saveLink.mutateAsync({ link, isNew });
      setLink(saved);
      toast.success("Link salvo com sucesso! 🎉");
      if (isNew) {
        navigate(`/links/${saved.id}/edit`, { replace: true });
      }
    } catch (e: any) {
      if (e?.message?.includes("Limite de links")) {
        toast.error("Você atingiu o limite de links do seu plano. Faça upgrade para criar mais!");
      } else if (e?.message?.includes("duplicate key") || e?.code === "23505") {
        toast.error("Esse endereço já está em uso. Escolha outro slug.");
      } else {
        toast.error("Erro ao salvar: " + (e?.message || "tente novamente"));
      }
    }
  };

  // Keyboard shortcuts for undo/redo/save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, handleSave]);

  if (isEditing && isLoading) {
    return (
      <DashboardLayout title="Editor de Link" noPadding>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editor de Link" noPadding>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden relative">

        {/* Slide-out drawer for Elements / Theme */}
        <AnimatePresence>
          {openDrawer && isMobile && (
            <motion.div
              key="drawer-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 z-30 bg-black/50"
              onClick={() => { setOpenDrawer(null); setEditingSubPageId(null); }}
            />
          )}
          {openDrawer && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`absolute left-0 top-0 bottom-0 z-40 ${isMobile ? "w-full" : "w-[280px]"} bg-card border-r border-border shadow-lg flex flex-col`}
            >
              <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-2">
                  {openDrawer === "elements" ? (
                    <Layers className="h-4 w-4 text-primary" />
                  ) : openDrawer === "effects" ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : openDrawer === "pages" ? (
                    <FileText className="h-4 w-4 text-primary" />
                  ) : (
                    <Palette className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {openDrawer === "elements" ? "Elementos" : openDrawer === "effects" ? "Efeitos" : openDrawer === "pages" ? "Páginas" : "Tema"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setOpenDrawer(null); setEditingSubPageId(null); }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll p-3">
                {openDrawer === "elements" ? (
                  <ElementsSidebar onAddBlock={(type, defaults) => { addBlock(type, defaults); }} />
                ) : openDrawer === "effects" ? (
                  <EffectsPanel link={link} onUpdateLink={updateLink} />
                ) : openDrawer === "pages" ? (
                  <SubPageEditor link={link} onUpdateLink={updateLink} onEditingPageChange={setEditingSubPageId} onOpenPageEditor={(id) => { setEditingSubPageId(id); setOpenDrawer(null); }} />
                ) : (
                  <ThemePanel link={link} onUpdateLink={updateLink} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
          {/* Top toolbar */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-card shrink-0 overflow-x-auto custom-scroll min-w-0">
            {[
              { key: "elements" as const, icon: Layers, label: "Elementos" },
              { key: "theme" as const, icon: Palette, label: "Tema" },
              { key: "effects" as const, icon: Sparkles, label: "Efeitos" },
              { key: "pages" as const, icon: FileText, label: "Páginas" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setOpenDrawer(openDrawer === key ? null : key)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap shrink-0 ${
                  openDrawer === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 ml-1">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer select-none"
                title="Refazer (Ctrl+Shift+Z)"
              >
                <Redo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer select-none"
                title="Atalhos de teclado"
              >
                <Keyboard className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1" />

            {/* Autosave status */}
            {isExistingLink && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {autosaveStatus === "saving" && (
                  <><Cloud className="h-3 w-3 animate-pulse" /><span>Salvando...</span></>
                )}
                {autosaveStatus === "saved" && (
                  <><Check className="h-3 w-3 text-green-400" /><span className="text-green-400">Salvo</span></>
                )}
                {autosaveStatus === "error" && (
                  <button
                    type="button"
                    onClick={retry}
                    className="flex items-center gap-1 text-destructive hover:underline cursor-pointer"
                  >
                    <AlertCircle className="h-3 w-3" />
                    <span>Erro — tentar novamente</span>
                  </button>
                )}
                {autosaveStatus === "idle" && isExistingLink && (
                  savedAt ? (
                    <><Check className="h-3 w-3 opacity-40" /><span>Salvo às {savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></>
                  ) : (
                    <><Cloud className="h-3 w-3" /><span>Autosave</span></>
                  )
                )}
              </div>
            )}

            {/* Copy & Open public link */}
            {link.slug && !link.id.startsWith("new-") && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getPublicLinkUrl(link.slug));
                    toast.success("Link copiado!");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30 transition-all cursor-pointer select-none"
                  title="Copiar link público"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </button>
                <a
                  href={getPublicLinkUrl(link.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30 transition-all"
                  title="Abrir link público"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir
                </a>
              </>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saveLink.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer select-none disabled:cursor-not-allowed"
            >
              {saveLink.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saveLink.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>

          {/* Editor content */}
          <div
            className="flex-1 overflow-y-auto custom-scroll p-4 lg:p-6"
            style={{ contain: 'paint', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            onPointerDown={() => { if (openDrawer) { setOpenDrawer(null); setEditingSubPageId(null); } }}
          >
            <div className={`mx-auto ${showPreview ? "max-w-3xl" : "max-w-2xl"}`}>
              {editingSubPageId && (link.pages || []).find(p => p.id === editingSubPageId) ? (() => {
                const subPage = (link.pages || []).find(p => p.id === editingSubPageId)!;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <button
                        type="button"
                        onClick={() => { setEditingSubPageId(null); if (openDrawer !== "pages") setOpenDrawer("pages"); }}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Páginas
                      </button>
                      <div className="w-px h-4 bg-border shrink-0" />
                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-foreground truncate">{subPage.title}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{subPage.blocks.length} blocos</span>
                    </div>
                    <BlockEditor
                      link={link}
                      onUpdateLink={updateLink}
                      onInsertBlockAt={insertBlockAt}
                      subPageMode={{
                        page: subPage,
                        onUpdatePage: (updates) => updateSubPage(editingSubPageId, updates),
                        onAddBlock: (type, defaults) => addBlockToSubPage(editingSubPageId, type, defaults),
                        onInsertBlockAt: (type, atIndex, defaults) => insertBlockToSubPageAt(editingSubPageId, type, atIndex, defaults),
                      }}
                    />
                  </div>
                );
              })() : (
                <BlockEditor link={link} onUpdateLink={updateLink} onInsertBlockAt={insertBlockAt} selectedElementId={selectedElementId ?? undefined} onElementSelected={setSelectedElementId} />
              )}
            </div>
          </div>
        </div>

        {/* Right panel - Preview */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ width: isMobile ? "100%" : 380 }}
              className={`shrink-0 border-l border-border bg-secondary/20 flex flex-col items-center justify-center overflow-hidden ${
                isMobile ? "fixed inset-0 z-50 bg-background" : ""
              }`}
            >
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-secondary border border-border cursor-pointer"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              )}

              {/* Header row: label + device selector */}
              <div className="flex items-center justify-between w-full mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                    {editingSubPageId ? "Sub-página" : "Preview"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {(["iphone15", "pixel8", "galaxy"] as DeviceType[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDevice(d)}
                      className={`px-2 py-0.5 rounded-full text-[8.5px] font-semibold transition-all cursor-pointer select-none ${
                        device === d
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      {DEVICE_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div
                onDragOver={handlePreviewDragOver}
                onDragEnter={handlePreviewDragEnter}
                onDragLeave={handlePreviewDragLeave}
                onDrop={handlePreviewDrop}
                className={`relative rounded-[2.5rem] transition-all duration-150 ${
                  isDraggingOverPreview
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : ""
                }`}
              >
                <DeviceFrame device={device}>
                  {editingSubPageId && (link.pages || []).find((p) => p.id === editingSubPageId) ? (
                    <SubPagePreview
                      page={(link.pages || []).find((p) => p.id === editingSubPageId)!}
                      link={previewLink}
                    />
                  ) : (
                    <SmartLinkPreview
                      link={previewLink}
                      selectedId={selectedElementId ?? undefined}
                      ghostBlockType={ghostBlockType ?? undefined}
                      onSelectElement={(id) => {
                        setSelectedElementId(id);
                        if (openDrawer) setOpenDrawer(null);
                      }}
                    />
                  )}
                </DeviceFrame>

                {isDraggingOverPreview && (
                  <div className="absolute inset-x-0 -bottom-8 flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-lg animate-bounce">
                      ⬇ Solte aqui para adicionar
                    </span>
                  </div>
                )}
              </div>

              {link.slug && !editingSubPageId && (
                <div className="mt-3 px-3 py-1 rounded-full bg-secondary border border-border text-[10px] text-muted-foreground font-mono">
                  {window.location.host}/l/<span className="text-primary font-semibold">{link.slug}</span>
                </div>
              )}
              {editingSubPageId && (
                <div className="mt-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-semibold">
                  Editando sub-página
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard shortcuts overlay */}
        {showShortcuts && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <div
              className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-80 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Atalhos de Teclado</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { keys: ["Ctrl", "Z"], description: "Desfazer" },
                  { keys: ["Ctrl", "Shift", "Z"], description: "Refazer" },
                  { keys: ["Ctrl", "Y"], description: "Refazer (alternativo)" },
                  { keys: ["Ctrl", "S"], description: "Salvar" },
                ].map(({ keys, description }) => (
                  <div key={description} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                    <span className="text-sm text-muted-foreground">{description}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="px-1.5 py-0.5 rounded-md bg-secondary border border-border text-[11px] font-mono font-semibold text-foreground leading-none"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`fixed z-50 shadow-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer select-none ${
            isMobile
              ? "bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-primary/30"
              : "bottom-6 right-6 h-10 px-4 rounded-xl bg-card border border-border text-foreground text-xs font-medium gap-2 hover:bg-secondary"
          }`}
        >
          {showPreview ? (
            <>
              <PanelRightClose className="h-4 w-4" />
              {!isMobile && <span>Fechar Preview</span>}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              {!isMobile && <span>Preview</span>}
            </>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
}
