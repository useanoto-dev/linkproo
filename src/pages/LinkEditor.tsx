import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { BlockEditor } from '@/components/editor/BlockEditor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorDrawer } from '@/components/editor/EditorDrawer';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { ShortcutsModal } from '@/components/editor/ShortcutsModal';
import { SmartLink, BlockType } from '@/types/smart-link';
import { Eye, PanelRightClose, ArrowLeft, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { templates } from '@/data/templates';
import { useSaveLink, useLink } from '@/hooks/use-links';
import { useAuth } from '@/contexts/AuthContext';
import { validateSlug, checkSlugAvailability } from '@/lib/slug-utils';
import { useEditorStore } from '@/stores/editor-store';
import { useBlockOperations } from '@/hooks/use-block-operations';
import { registerAutosaveSubscriber, flushAutosave, retryAutosave } from '@/stores/autosave-subscriber';

// ─── helpers ─────────────────────────────────────────────────────────────────

function createDefaultLink(): SmartLink {
  return {
    id: 'new-' + Date.now(), slug: '', businessName: '', tagline: '',
    heroImage: '', logoUrl: '', backgroundColor: 'from-gray-50 to-white',
    textColor: 'text-white', accentColor: '#f59e0b', fontFamily: 'Inter',
    buttons: [], badges: [], floatingEmojis: [], blocks: [], pages: [],
    views: 0, clicks: 0, isActive: true, createdAt: new Date().toISOString(),
  };
}

function createFromTemplate(templateId: string): SmartLink | null {
  const tpl = templates.find((t) => t.id === templateId);
  if (!tpl) return null;
  const now = Date.now();
  return {
    ...tpl.template, id: 'new-' + now, views: 0, clicks: 0, isActive: true,
    createdAt: new Date().toISOString(),
    buttons: (tpl.template.buttons ?? []).map((b, i) => ({ ...b, id: `${now}-btn-${i}`, order: i })),
    blocks: (tpl.template.blocks ?? []).map((b, i) => ({ ...b, id: `${now}-blk-${i}`, order: (tpl.template.buttons ?? []).length + i })),
    pages: tpl.template.pages || [],
  };
}

// ─── component ───────────────────────────────────────────────────────────────

export default function LinkEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template');
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const isEditing = !!id;
  const { data: existingLink, isLoading } = useLink(id);
  const saveLink = useSaveLink();

  // Store selectors
  const link = useEditorStore((s) => s.link);
  const previewLink = useEditorStore((s) => s.previewLink);
  const setLink = useEditorStore((s) => s.setLink);
  const updateLink = useEditorStore((s) => s.updateLink);
  const resetLink = useEditorStore((s) => s.resetLink);
  const updatePreviewLink = useEditorStore((s) => s.updatePreviewLink);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const showPreview = useEditorStore((s) => s.ui.showPreview);
  const openDrawer = useEditorStore((s) => s.ui.openDrawer);
  const editingSubPageId = useEditorStore((s) => s.ui.editingSubPageId);
  const selectedElementId = useEditorStore((s) => s.ui.selectedElementId);
  const setUI = useEditorStore((s) => s.setUI);

  const [initialized, setInitialized] = useState(!isEditing);
  const dragTypeRef = useRef<BlockType | null>(null);

  // Block operations
  const { insertBlockAt, addBlock, updateSubPage, addBlockToSubPage, insertBlockToSubPageAt } =
    useBlockOperations({ link, updateLink, setLink });

  // Initialize store on first mount
  useEffect(() => {
    const initialLink = templateId ? createFromTemplate(templateId) ?? createDefaultLink() : createDefaultLink();
    resetLink(initialLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced preview (50ms)
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => updatePreviewLink(link), 50);
    return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
  }, [link, updatePreviewLink]);

  // Mobile: hide preview
  useEffect(() => { if (isMobile) setUI({ showPreview: false }); }, [isMobile, setUI]);

  // Autosave
  const isExistingLink = isEditing || !link.id?.startsWith('new-');
  const autosave = useEditorStore((s) => s.autosave);

  // Register autosave subscriber when user is available
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = registerAutosaveSubscriber(user.id);
    return () => {
      void flushAutosave(); // flush on unmount
      unsubscribe();
    };
  }, [user?.id]);

  // Load existing link
  useEffect(() => {
    if (existingLink && !initialized) {
      resetLink(existingLink);
      useEditorStore.getState().initAutosaveSnapshot(existingLink);
      useEditorStore.getState().setAutosaveEnabled(true);
      setInitialized(true);
    }
  }, [existingLink, initialized, resetLink]);

  // beforeunload / visibility / unmount flush
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const autosaveStatus = useEditorStore.getState().autosave.status;
      if (autosaveStatus === 'saving' || autosaveStatus === 'error') {
        e.preventDefault();
        e.returnValue = 'Há alterações não salvas. Tem certeza que deseja sair?';
      }
    };
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden') void flushAutosave(); };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Drag-from-sidebar events
  useEffect(() => {
    const onStart = (e: Event) => { dragTypeRef.current = (e as CustomEvent).detail?.type as BlockType || null; };
    const onEnd = () => { dragTypeRef.current = null; setUI({ ghostBlockType: null }); };
    window.addEventListener('block-drag-start', onStart);
    window.addEventListener('block-drag-end', onEnd);
    return () => { window.removeEventListener('block-drag-start', onStart); window.removeEventListener('block-drag-end', onEnd); };
  }, [setUI]);

  // Save
  const handleSave = useCallback(async () => {
    const slugError = validateSlug(link.slug);
    if (slugError) { toast.error(slugError); return; }
    const isAvailable = await checkSlugAvailability(link.slug, isEditing ? link.id : undefined);
    if (!isAvailable) { toast.error('Esse endereço já está em uso. Escolha outro slug.'); return; }
    try {
      const saved = await saveLink.mutateAsync({ link, isNew: !isEditing });
      setLink(saved, true);
      toast.success('Link salvo com sucesso! 🎉');
      if (!isEditing) navigate(`/links/${saved.id}/edit`, { replace: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const code = (error as { code?: string })?.code;
      if (msg.includes('Limite de links')) toast.error('Você atingiu o limite de links do seu plano. Faça upgrade para criar mais!');
      else if (msg.includes('duplicate key') || code === '23505') toast.error('Esse endereço já está em uso. Escolha outro slug.');
      else toast.error('Erro ao salvar: ' + (msg || 'tente novamente'));
    }
  }, [link, isEditing, saveLink, setLink, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, handleSave]);

  // Drag handlers for preview panel
  const handlePreviewDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes('application/x-block-type')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }
  }, []);
  const handlePreviewDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes('application/x-block-type'))
      setUI({ isDraggingOverPreview: true, ghostBlockType: dragTypeRef.current });
  }, [setUI]);
  const handlePreviewDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
      setUI({ isDraggingOverPreview: false, ghostBlockType: null });
  }, [setUI]);
  const handlePreviewDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUI({ isDraggingOverPreview: false, ghostBlockType: null });
    const type = e.dataTransfer.getData('application/x-block-type') as BlockType;
    if (!type) return;
    const defaultsRaw = e.dataTransfer.getData('application/x-block-defaults');
    addBlock(type, defaultsRaw ? JSON.parse(defaultsRaw) : {});
  }, [addBlock, setUI]);

  // ─── loading skeleton ─────────────────────────────────────────────────────

  if (isEditing && isLoading) {
    return (
      <DashboardLayout title="Editor de Link" noPadding>
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
          <div className="w-80 shrink-0 border-r border-border bg-card p-4 space-y-4 overflow-hidden">
            <Skeleton className="h-8 w-full rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-block-${i}`} className="rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" /><Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="w-[375px] space-y-4">
              <Skeleton className="w-full h-40 rounded-xl" />
              <Skeleton className="h-6 w-32 mx-auto" /><Skeleton className="h-4 w-48 mx-auto" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={`skeleton-btn-${i}`} className="h-11 w-full rounded-xl" />)}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── main render ──────────────────────────────────────────────────────────

  const subPage = editingSubPageId ? (link.pages || []).find((p) => p.id === editingSubPageId) : null;

  return (
    <DashboardLayout title="Editor de Link" noPadding>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden relative">

        <EditorDrawer link={link} onUpdateLink={updateLink} onAddBlock={addBlock} />

        {/* Center panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background">
          <EditorToolbar
            autosaveStatus={autosave.status} savedAt={autosave.savedAt}
            onRetryAutosave={retryAutosave} onSave={handleSave}
            isSavePending={saveLink.isPending} isExistingLink={isExistingLink}
          />
          <div
            className="flex-1 overflow-y-auto custom-scroll p-4 lg:p-6"
            style={{ contain: 'paint', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            onPointerDown={() => { if (openDrawer) setUI({ openDrawer: null, editingSubPageId: null }); }}
          >
            <div className={`mx-auto ${showPreview ? 'max-w-3xl' : 'max-w-2xl'}`}>
              {subPage ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <button
                      type="button"
                      onClick={() => { setUI({ editingSubPageId: null }); if (openDrawer !== 'pages') setUI({ openDrawer: 'pages' }); }}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />Páginas
                    </button>
                    <div className="w-px h-4 bg-border shrink-0" />
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate">{subPage.title}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{subPage.blocks.length} blocos</span>
                  </div>
                  <BlockEditor
                    link={link} onUpdateLink={updateLink} onInsertBlockAt={insertBlockAt}
                    subPageMode={{
                      page: subPage,
                      onUpdatePage: (updates) => updateSubPage(editingSubPageId, updates),
                      onAddBlock: (type, defaults) => addBlockToSubPage(editingSubPageId, type, defaults),
                      onInsertBlockAt: (type, atIndex, defaults) => insertBlockToSubPageAt(editingSubPageId, type, atIndex, defaults),
                    }}
                  />
                </div>
              ) : (
                <BlockEditor
                  link={link} onUpdateLink={updateLink} onInsertBlockAt={insertBlockAt}
                  selectedElementId={selectedElementId ?? undefined}
                  onElementSelected={(id) => setUI({ selectedElementId: id })}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right preview panel */}
        <AnimatePresence>
          {showPreview && (
            <EditorPreview
              previewLink={previewLink} link={link}
              onDragOver={handlePreviewDragOver} onDragEnter={handlePreviewDragEnter}
              onDragLeave={handlePreviewDragLeave} onDrop={handlePreviewDrop}
            />
          )}
        </AnimatePresence>

        <ShortcutsModal />

        {/* Preview toggle FAB */}
        <button
          type="button"
          onClick={() => setUI({ showPreview: !showPreview })}
          className={`fixed z-50 shadow-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer select-none ${
            isMobile
              ? 'bottom-6 right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-primary/30'
              : 'bottom-6 right-6 h-10 px-4 rounded-xl bg-card border border-border text-foreground text-xs font-medium gap-2 hover:bg-secondary'
          }`}
        >
          {showPreview ? (
            <><PanelRightClose className="h-4 w-4" />{!isMobile && <span>Fechar Preview</span>}</>
          ) : (
            <><Eye className="h-4 w-4" />{!isMobile && <span>Preview</span>}</>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
}
