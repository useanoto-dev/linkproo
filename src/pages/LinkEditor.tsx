import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorDrawer } from '@/components/editor/EditorDrawer';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { EditorLeftPanel } from '@/components/editor/EditorLeftPanel';
import { EditorRightPanel } from '@/components/editor/EditorRightPanel';
import { ShortcutsModal } from '@/components/editor/ShortcutsModal';
import { SmartLink, BlockType, LinkBlock, SmartLinkButton } from '@/types/smart-link';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { templates } from '@/data/templates';
import { useSaveLink, useLink } from '@/hooks/use-links';
import { useAuth } from '@/contexts/AuthContext';
import { validateSlug, checkSlugAvailability } from '@/lib/slug-utils';
import { useEditorStore } from '@/stores/editor-store';
import { useBlockOperations } from '@/hooks/use-block-operations';
import { getUnifiedItems } from '@/components/editor/blocks/unified-items';
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
  const selectedElementId = useEditorStore((s) => s.ui.selectedElementId);
  const setUI = useEditorStore((s) => s.setUI);

  const [initialized, setInitialized] = useState(!isEditing);
  const dragTypeRef = useRef<BlockType | null>(null);

  // ─── Block operations ──────────────────────────────────────────────────────

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    const items = getUnifiedItems(link);
    const idx = items.findIndex((item) => item.id === id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const swapped = [...items];
    [swapped[idx], swapped[targetIdx]] = [swapped[targetIdx], swapped[idx]];
    const withOrders = swapped.map((item, i) => ({ ...item, data: { ...item.data, order: i } }));
    const newButtons = withOrders.filter((i) => i.kind === 'button').map((i) => i.data as SmartLinkButton);
    const newBlocks = withOrders.filter((i) => i.kind === 'block').map((i) => i.data as LinkBlock);
    updateLink({ buttons: newButtons, blocks: newBlocks });
  }, [link, updateLink]);

  const removeItem = useCallback((id: string, kind: 'button' | 'block') => {
    if (kind === 'button') {
      updateLink({ buttons: link.buttons.filter((b) => b.id !== id) });
    } else {
      updateLink({ blocks: link.blocks.filter((b) => b.id !== id) });
    }
    if (selectedElementId === id) setUI({ selectedElementId: null });
  }, [link, updateLink, selectedElementId, setUI]);

  // Block operations
  const { addBlock, updateSubPage, addBlockToSubPage, insertBlockToSubPageAt } =
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
          <div className="w-[280px] shrink-0 border-r border-border bg-card p-4 space-y-4 overflow-hidden">
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

  return (
    <DashboardLayout title="Editor de Link" noPadding>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">

        {/* Top toolbar */}
        <EditorToolbar
          autosaveStatus={autosave.status} savedAt={autosave.savedAt}
          onRetryAutosave={retryAutosave} onSave={handleSave}
          isSavePending={saveLink.isPending} isExistingLink={isExistingLink}
        />

        {/* 3-zone body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Zone 1: Left panel (desktop) */}
          <EditorLeftPanel
            link={link}
            onUpdateLink={updateLink}
            onMoveBlock={moveBlock}
            onRemoveItem={removeItem}
          />

          {/* Mobile: drawer (hidden on lg) */}
          <EditorDrawer link={link} onUpdateLink={updateLink} onAddBlock={addBlock} />

          {/* Zone 2: Preview (center, always visible) */}
          <EditorPreview
            previewLink={previewLink} link={link}
            onDragOver={handlePreviewDragOver} onDragEnter={handlePreviewDragEnter}
            onDragLeave={handlePreviewDragLeave} onDrop={handlePreviewDrop}
          />

          {/* Zone 3: Properties panel (desktop) */}
          <EditorRightPanel
            link={link}
            onUpdateLink={updateLink}
            onAddBlock={addBlock}
            updateSubPage={updateSubPage}
            addBlockToSubPage={addBlockToSubPage}
            insertBlockToSubPageAt={insertBlockToSubPageAt}
          />
        </div>

        <ShortcutsModal />
      </div>
    </DashboardLayout>
  );
}
