import {
  Save, Copy, ExternalLink, Undo2, Redo2,
  Check, AlertCircle, Cloud, Sparkles, FileText, Keyboard,
  Layers, Palette, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor-store';
import { getPublicLinkUrl } from '@/hooks/use-links';

export interface EditorToolbarProps {
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  savedAt: Date | null;
  onRetryAutosave: () => void;
  onSave: () => void;
  isSavePending: boolean;
  isExistingLink: boolean;
}

export function EditorToolbar({
  autosaveStatus,
  savedAt,
  onRetryAutosave,
  onSave,
  isSavePending,
  isExistingLink,
}: EditorToolbarProps) {
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const linkSlug = useEditorStore((s) => s.link.slug);
  const linkId = useEditorStore((s) => s.link.id);
  const openDrawer = useEditorStore((s) => s.ui.openDrawer);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const setUI = useEditorStore((s) => s.setUI);

  const isPublished = linkSlug && linkId && !linkId.startsWith('new-');

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-card shrink-0 overflow-x-auto custom-scroll min-w-0">
      {(
        [
          { key: 'elements' as const, icon: Layers, label: 'Elementos' },
          { key: 'theme' as const, icon: Palette, label: 'Tema' },
          { key: 'effects' as const, icon: Sparkles, label: 'Efeitos' },
          { key: 'pages' as const, icon: FileText, label: 'Páginas' },
        ] as const
      ).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setUI({ openDrawer: openDrawer === key ? null : key })}
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap shrink-0 ${
            openDrawer === key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30'
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
          onClick={() => setUI({ showShortcuts: true })}
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
          {autosaveStatus === 'saving' && (
            <><Cloud className="h-3 w-3 animate-pulse" /><span>Salvando...</span></>
          )}
          {autosaveStatus === 'saved' && (
            <><Check className="h-3 w-3 text-green-400" /><span className="text-green-400">Salvo</span></>
          )}
          {autosaveStatus === 'error' && (
            <button
              type="button"
              onClick={onRetryAutosave}
              className="flex items-center gap-1 text-destructive hover:underline cursor-pointer"
            >
              <AlertCircle className="h-3 w-3" />
              <span>Erro — tentar novamente</span>
            </button>
          )}
          {autosaveStatus === 'idle' && isExistingLink && (
            savedAt ? (
              <><Check className="h-3 w-3 opacity-40" /><span>Salvo às {savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></>
            ) : (
              <><Cloud className="h-3 w-3" /><span>Autosave</span></>
            )
          )}
        </div>
      )}

      {/* Copy & Open public link */}
      {isPublished && (
        <>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(getPublicLinkUrl(linkSlug));
              toast.success('Link copiado!');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30 transition-all cursor-pointer select-none"
            title="Copiar link público"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </button>
          <a
            href={getPublicLinkUrl(linkSlug)}
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
        onClick={onSave}
        disabled={isSavePending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer select-none disabled:cursor-not-allowed"
      >
        {isSavePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {isSavePending ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );
}
