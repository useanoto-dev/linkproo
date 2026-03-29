import { X, Keyboard } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

const SHORTCUTS = [
  { keys: ['Ctrl', 'Z'], description: 'Desfazer' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Refazer' },
  { keys: ['Ctrl', 'Y'], description: 'Refazer (alternativo)' },
  { keys: ['Ctrl', 'S'], description: 'Salvar' },
] as const;

export function ShortcutsModal() {
  const showShortcuts = useEditorStore((s) => s.ui.showShortcuts);
  const setUI = useEditorStore((s) => s.setUI);

  if (!showShortcuts) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setUI({ showShortcuts: false })}
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
            onClick={() => setUI({ showShortcuts: false })}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {SHORTCUTS.map(({ keys, description }) => (
            <div
              key={description}
              className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
            >
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
  );
}
