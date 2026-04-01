import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SmartLink, BlockType } from '@/types/smart-link';
import { DeviceType } from '@/components/editor/DeviceFrame';
import { EDITOR_MAX_HISTORY } from '@/lib/editor-constants';

export function serializeLink(l: SmartLink): string {
  const { views, clicks, createdAt, ...rest } = l;
  return JSON.stringify(rest);
}

export interface EditorUIState {
  openDrawer: 'elements' | 'theme' | 'effects' | 'pages' | null;
  selectedElementId: string | null;
  editingSubPageId: string | null;
  showPreview: boolean;
  showShortcuts: boolean;
  device: DeviceType;
  isDraggingOverPreview: boolean;
  ghostBlockType: BlockType | null;
  contextMenu: {
    x: number;
    y: number;
    itemId: string;
    itemKind: 'button' | 'block';
  } | null;
}

export interface EditorStore {
  // Data state
  link: SmartLink;
  previewLink: SmartLink;

  // History
  past: SmartLink[];
  future: SmartLink[];

  // UI
  ui: EditorUIState;

  // Derived
  canUndo: boolean;
  canRedo: boolean;

  // Autosave
  autosave: {
    status: 'idle' | 'saving' | 'saved' | 'error';
    savedAt: Date | null;
    lastSavedSnapshot: string;
    enabled: boolean;
  };

  // Actions — link data
  setLink: (updater: SmartLink | ((prev: SmartLink) => SmartLink), skipHistory?: boolean) => void;
  updateLink: (updates: Partial<SmartLink>) => void;
  resetLink: (link: SmartLink) => void;
  updatePreviewLink: (link: SmartLink) => void;

  // Actions — history
  undo: () => void;
  redo: () => void;

  // Actions — UI
  setUI: (updates: Partial<EditorUIState>) => void;

  // Actions — autosave
  setAutosaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setAutosaveSavedAt: (date: Date) => void;
  initAutosaveSnapshot: (link: SmartLink) => void;
  setAutosaveEnabled: (enabled: boolean) => void;
}

const EMPTY_LINK: SmartLink = {
  id: '',
  slug: '',
  businessName: '',
  tagline: '',
  heroImage: '',
  logoUrl: '',
  backgroundColor: 'from-gray-50 to-white',
  textColor: 'text-white',
  accentColor: '#f59e0b',
  buttons: [],
  blocks: [],
  pages: [],
  badges: [],
  floatingEmojis: [],
  views: 0,
  clicks: 0,
  isActive: true,
  createdAt: new Date().toISOString(),
};

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    link: EMPTY_LINK,
    previewLink: EMPTY_LINK,
    past: [],
    future: [],
    autosave: {
      status: 'idle',
      savedAt: null,
      lastSavedSnapshot: '',
      enabled: false,
    },
    ui: {
      openDrawer: null,
      selectedElementId: null,
      editingSubPageId: null,
      showPreview: true,
      showShortcuts: false,
      device: 'iphone15' as DeviceType,
      isDraggingOverPreview: false,
      ghostBlockType: null,
      contextMenu: null,
    },
    canUndo: false,
    canRedo: false,

    setLink: (updater, skipHistory = false) => {
      const state = get();
      const prev = state.link;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const newPast = skipHistory
        ? state.past
        : [...state.past.slice(-(EDITOR_MAX_HISTORY - 1)), prev];
      const newFuture = skipHistory ? state.future : [];
      set({
        link: next,
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: newFuture.length > 0,
      });
    },

    updateLink: (updates) => {
      get().setLink((prev) => ({ ...prev, ...updates }));
    },

    resetLink: (link) => {
      set({
        link,
        previewLink: link,
        past: [],
        future: [],
        canUndo: false,
        canRedo: false,
      });
    },

    updatePreviewLink: (link) => {
      set({ previewLink: link });
    },

    undo: () => {
      const state = get();
      if (state.past.length === 0) return;
      const prev = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      const newFuture = [state.link, ...state.future];
      set({
        link: prev,
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: newFuture.length > 0,
      });
    },

    redo: () => {
      const state = get();
      if (state.future.length === 0) return;
      const next = state.future[0];
      const newPast = [...state.past, state.link];
      const newFuture = state.future.slice(1);
      set({
        link: next,
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: newFuture.length > 0,
      });
    },

    setUI: (updates) => {
      set((state) => ({ ui: { ...state.ui, ...updates } }));
    },

    setAutosaveStatus: (status) => set((state) => ({ autosave: { ...state.autosave, status } })),
    setAutosaveSavedAt: (date) => set((state) => ({ autosave: { ...state.autosave, savedAt: date } })),
    initAutosaveSnapshot: (link) => set((state) => ({ autosave: { ...state.autosave, lastSavedSnapshot: serializeLink(link) } })),
    setAutosaveEnabled: (enabled) => set((state) => ({ autosave: { ...state.autosave, enabled } })),
  }))
);
