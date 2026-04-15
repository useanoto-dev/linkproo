/**
 * Autosave subscriber — lives OUTSIDE React component lifecycle.
 * Subscribes to store.link changes, debounces, calls Supabase directly.
 * Survives component unmounts and route changes.
 */
import { useEditorStore } from './editor-store';
import { smartLinkToRow } from '@/lib/link-mappers';
import { supabase } from '@/integrations/supabase/client';
import { SmartLink } from '@/types/smart-link';

const AUTOSAVE_DELAY_MS = 1500;

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let statusResetTimer: ReturnType<typeof setTimeout> | undefined;
let currentUserId: string | null = null;
let pendingLink: SmartLink | null = null;

function serializeLink(l: SmartLink): string {
  const { views: _views, clicks: _clicks, createdAt: _createdAt, ...rest } = l;
  return JSON.stringify(rest);
}

async function sendToServer(link: SmartLink, userId: string): Promise<void> {
  const row = smartLinkToRow(link, userId);
  const { error } = await supabase
    .from('links')
    .update(row as Record<string, unknown>)
    .eq('id', link.id)
    .eq('user_id', userId);

  if (error) throw error;
}

async function performSave(link: SmartLink, userId: string): Promise<void> {
  const store = useEditorStore.getState();
  store.setAutosaveStatus('saving');

  try {
    await sendToServer(link, userId);

    // ── SUCCESS ──────────────────────────────────────────────────────────────
    store.setAutosaveSavedAt(new Date());
    store.initAutosaveSnapshot(link); // also stores lastSavedLink for rollback
    store.setAutosaveStatus('saved');

    if (statusResetTimer) clearTimeout(statusResetTimer);
    statusResetTimer = setTimeout(() => {
      const current = useEditorStore.getState();
      if (current.autosave.status === 'saved') {
        current.setAutosaveStatus('idle');
      }
    }, 2000);
  } catch {
    // Set error status immediately — the UI shows "Erro — tentar novamente".
    // Manual retry is available via retryAutosave() / the retry button.
    if (statusResetTimer) clearTimeout(statusResetTimer);
    store.setAutosaveStatus('error');
  }
}

/**
 * Flush any pending debounced save immediately.
 * Call on visibilitychange (tab hidden) and on editor unmount.
 */
export async function flushAutosave(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }

  const store = useEditorStore.getState();
  if (!store.autosave.enabled || !currentUserId || !pendingLink) return;

  const snapshot = serializeLink(pendingLink);
  if (snapshot === store.autosave.lastSavedSnapshot) return;

  await performSave(pendingLink, currentUserId);
}

/**
 * Register the autosave subscriber.
 * Call once when the editor mounts with a valid userId.
 * Returns an unsubscribe function — call it on editor unmount.
 */
export function registerAutosaveSubscriber(userId: string): () => void {
  currentUserId = userId;

  const unsubscribe = useEditorStore.subscribe(
    (state) => state.link,
    (link) => {
      const store = useEditorStore.getState();
      if (!store.autosave.enabled || !currentUserId || link.id?.startsWith('new-')) return;

      const snapshot = serializeLink(link);
      if (snapshot === store.autosave.lastSavedSnapshot) return;

      pendingLink = link;

      // A new edit coming in while in error state means the user kept going —
      // reset to idle so the "Erro" badge doesn't linger while they type.
      if (store.autosave.status === 'error') {
        store.setAutosaveStatus('idle');
      }

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (pendingLink && currentUserId) {
          void performSave(pendingLink, currentUserId);
        }
      }, AUTOSAVE_DELAY_MS);
    }
  );

  return () => {
    unsubscribe();
    currentUserId = null;
    pendingLink = null;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }
    if (statusResetTimer) {
      clearTimeout(statusResetTimer);
      statusResetTimer = undefined;
    }
  };
}

/**
 * Manually retry a failed save.
 */
export async function retryAutosave(): Promise<void> {
  const store = useEditorStore.getState();
  if (!currentUserId) return;
  pendingLink = store.link;
  await flushAutosave();
}
