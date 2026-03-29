import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Palette, Sparkles, FileText } from 'lucide-react';
import { ElementsSidebar } from '@/components/editor/ElementsSidebar';
import { ThemePanel } from '@/components/editor/ThemePanel';
import { EffectsPanel } from '@/components/editor/EffectsPanel';
import { SubPageEditor } from '@/components/editor/SubPageEditor';
import { SmartLink, BlockType } from '@/types/smart-link';
import { useEditorStore } from '@/stores/editor-store';
import { useIsMobile } from '@/hooks/use-mobile';

export interface EditorDrawerProps {
  link: SmartLink;
  onUpdateLink: (updates: Partial<SmartLink>) => void;
  onAddBlock: (type: BlockType, defaults?: Record<string, unknown>) => void;
}

export function EditorDrawer({ link, onUpdateLink, onAddBlock }: EditorDrawerProps) {
  const openDrawer = useEditorStore((s) => s.ui.openDrawer);
  const editingSubPageId = useEditorStore((s) => s.ui.editingSubPageId);
  const setUI = useEditorStore((s) => s.setUI);
  const isMobile = useIsMobile();

  const closeDrawer = () => setUI({ openDrawer: null, editingSubPageId: null });

  const drawerLabel: Record<NonNullable<typeof openDrawer>, string> = {
    elements: 'Elementos',
    theme: 'Tema',
    effects: 'Efeitos',
    pages: 'Páginas',
  };

  const DrawerIcon = openDrawer === 'elements'
    ? Layers
    : openDrawer === 'effects'
    ? Sparkles
    : openDrawer === 'pages'
    ? FileText
    : Palette;

  return (
    <AnimatePresence>
      {openDrawer && isMobile && (
        <motion.div
          key="drawer-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 z-30 bg-black/50"
          onClick={closeDrawer}
        />
      )}
      {openDrawer && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`absolute left-0 top-0 bottom-0 z-40 ${isMobile ? 'w-full' : 'w-[320px]'} bg-card border-r border-border shadow-lg flex flex-col`}
        >
          <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              <DrawerIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {drawerLabel[openDrawer]}
              </span>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-3">
            {openDrawer === 'elements' ? (
              <ElementsSidebar onAddBlock={(type, defaults) => onAddBlock(type, defaults)} />
            ) : openDrawer === 'effects' ? (
              <EffectsPanel link={link} onUpdateLink={onUpdateLink} />
            ) : openDrawer === 'pages' ? (
              <SubPageEditor
                link={link}
                onUpdateLink={onUpdateLink}
                onEditingPageChange={(id) => setUI({ editingSubPageId: id })}
                onOpenPageEditor={(id) => setUI({ editingSubPageId: id, openDrawer: null })}
              />
            ) : (
              <ThemePanel link={link} onUpdateLink={onUpdateLink} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
